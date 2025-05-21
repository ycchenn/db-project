// backend/routes/v1/cart.js
import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js';
import { StatusCode } from '../../lib/constants.js';
import { verifyJWT } from '../../lib/jwt.js';

// 簡單的訂單 ID 生成函數（替代 uuid）
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

const router = Router();

// JWT 認證中介層
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // 添加日誌
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCode.UNAUTHORIZED).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token); // 添加日誌
  try {
    const payload = await verifyJWT(token);
    console.log('JWT payload:', payload); // 添加日誌
    req.user = payload;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(StatusCode.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};

// 檢查團購是否過期
const checkGroupBuyLock = async (userId, res, next) => {
  const [carts] = await mysqlConnectionPool.query(
    'SELECT group_buy_id FROM carts WHERE user_id = ? AND group_buy_id IS NOT NULL',
    [userId]
  );
  if (carts.length) {
    const [groupBuys] = await mysqlConnectionPool.query(
      'SELECT deadline FROM group_buys WHERE id = ?',
      [carts[0].group_buy_id]
    );
    if (groupBuys.length && new Date(groupBuys[0].deadline) < new Date()) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy expired, cart is locked' });
    }
  }
  next();
};

// 獲取購物車
router.get('/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [items] = await mysqlConnectionPool.query(
      'SELECT c.product_id AS id, p.name, c.quantity, p.price AS unitPrice, ' +
      '(c.quantity * p.price) AS totalPrice, c.group_buy_id ' +
      'FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
      [userId]
    );

    let groupBuy = null;
    if (items.length && items[0].group_buy_id) {
      const [groupBuys] = await mysqlConnectionPool.query(
        'SELECT id AS groupId, owner_name AS owner, target_quantity AS targetQuantity, ' +
        'current_quantity AS currentQuantity, deadline, status ' +
        'FROM group_buys WHERE id = ?',
        [items[0].group_buy_id]
      );
      groupBuy = groupBuys[0];
    }

    res.json({ items, groupBuy });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to fetch cart' });
  }
});

// 添加商品到購物車
router.post('/', authenticate, async (req, res) => {
  const { userId, productId, quantity, groupBuyId } = req.body;
  if (userId !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [products] = await mysqlConnectionPool.query(
      'SELECT stock, price FROM products WHERE id = ?',
      [productId]
    );
    if (!products.length || products[0].stock < quantity) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Insufficient stock' });
    }

    if (groupBuyId) {
      const [groupBuys] = await mysqlConnectionPool.query(
        'SELECT status, deadline FROM group_buys WHERE id = ?',
        [groupBuyId]
      );
      if (!groupBuys.length || groupBuys[0].status !== 'open' || new Date(groupBuys[0].deadline) < new Date()) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy not available or expired' });
      }
    }

    const [existing] = await mysqlConnectionPool.query(
      'SELECT quantity FROM carts WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length) {
      await mysqlConnectionPool.query(
        'UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    } else {
      await mysqlConnectionPool.query(
        'INSERT INTO carts (user_id, product_id, quantity, group_buy_id) VALUES (?, ?, ?, ?)',
        [userId, productId, quantity, groupBuyId || null]
      );
    }

    if (groupBuyId) {
      await mysqlConnectionPool.query(
        'UPDATE group_buys SET current_quantity = current_quantity + ? WHERE id = ?',
        [quantity, groupBuyId]
      );
    }

    const cart = await getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to add to cart' });
  }
});

// 更新購物車商品數量
router.put('/', authenticate, checkGroupBuyLock, async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (userId !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [carts] = await mysqlConnectionPool.query(
      'SELECT group_buy_id, quantity AS current_quantity FROM carts WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    if (!carts.length) {
      return res.status(StatusCode.NOT_FOUND).json({ error: 'Item not found' });
    }

    const [products] = await mysqlConnectionPool.query(
      'SELECT stock FROM products WHERE id = ?',
      [productId]
    );
    if (products[0].stock < quantity) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      await mysqlConnectionPool.query(
        'DELETE FROM carts WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
    } else {
      await mysqlConnectionPool.query(
        'UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
    }

    if (carts[0].group_buy_id) {
      const quantityDiff = quantity - carts[0].current_quantity;
      await mysqlConnectionPool.query(
        'UPDATE group_buys SET current_quantity = current_quantity + ? WHERE id = ?',
        [quantityDiff, carts[0].group_buy_id]
      );
    }

    const cart = await getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to update cart' });
  }
});

// 刪除購物車
router.delete('/:userId', authenticate, checkGroupBuyLock, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [carts] = await mysqlConnectionPool.query(
      'SELECT group_buy_id, quantity FROM carts WHERE user_id = ?',
      [userId]
    );

    for (const cart of carts) {
      if (cart.group_buy_id) {
        await mysqlConnectionPool.query(
          'UPDATE group_buys SET current_quantity = current_quantity - ? WHERE id = ?',
          [cart.quantity, cart.group_buy_id]
        );
      }
    }

    await mysqlConnectionPool.query('DELETE FROM carts WHERE user_id = ?', [userId]);
    res.status(StatusCode.OK).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to clear cart' });
  }
});

// 刪除單個商品
router.delete('/:userId/:productId', authenticate, checkGroupBuyLock, async (req, res) => {
  const { userId, productId } = req.params;
  if (parseInt(userId) !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [carts] = await mysqlConnectionPool.query(
      'SELECT group_buy_id, quantity FROM carts WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    if (!carts.length) {
      return res.status(StatusCode.NOT_FOUND).json({ error: 'Item not found' });
    }

    await mysqlConnectionPool.query(
      'DELETE FROM carts WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (carts[0].group_buy_id) {
      await mysqlConnectionPool.query(
        'UPDATE group_buys SET current_quantity = current_quantity - ? WHERE id = ?',
        [carts[0].quantity, carts[0].group_buy_id]
      );
    }

    res.status(StatusCode.OK).json({ message: 'Item removed' });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to remove item' });
  }
});

// 結帳
router.post('/checkout', authenticate, async (req, res) => {
  const { userId, groupBuyId } = req.body;
  if (userId !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const cart = await getCart(userId);
    if (!cart.items.length) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Cart is empty' });
    }

    if (groupBuyId) {
      const [groupBuys] = await mysqlConnectionPool.query(
        'SELECT current_quantity, target_quantity, deadline, status FROM group_buys WHERE id = ?',
        [groupBuyId]
      );
      if (!groupBuys.length || groupBuys[0].status !== 'open') {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy not available' });
      }
      if (new Date(groupBuys[0].deadline) < new Date()) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy expired' });
      }
      if (groupBuys[0].current_quantity < groupBuys[0].target_quantity) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy minimum not met' });
      }
    }

    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const orderId = generateOrderId(); // 使用自定義函數

    // 插入訂單主表
    await mysqlConnectionPool.query(
      'INSERT INTO orders (id, user_id, group_buy_id, total) VALUES (?, ?, ?, ?)',
      [orderId, userId, groupBuyId || null, total]
    );

    // 插入訂單詳細表
    for (const item of cart.items) {
      await mysqlConnectionPool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.unitPrice]
      );
      await mysqlConnectionPool.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await mysqlConnectionPool.query('DELETE FROM carts WHERE user_id = ?', [userId]);
    if (groupBuyId) {
      await mysqlConnectionPool.query(
        'UPDATE group_buys SET status = "completed" WHERE id = ?',
        [groupBuyId]
      );
    }

    res.json({ id: orderId, total });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to checkout' });
  }
});

// 加入團購
router.post('/group-buy/join', authenticate, async (req, res) => {
  const { userId, groupId } = req.body;
  if (userId !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }
  try {
    const [groupBuys] = await mysqlConnectionPool.query(
      'SELECT status, deadline FROM group_buys WHERE id = ?',
      [groupId]
    );
    if (!groupBuys.length || groupBuys[0].status !== 'open') {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy not available' });
    }
    if (new Date(groupBuys[0].deadline) < new Date()) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: 'Group buy expired' });
    }

    await mysqlConnectionPool.query(
      'UPDATE carts SET group_buy_id = ? WHERE user_id = ?',
      [groupId, userId]
    );

    const cart = await getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Join group buy error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to join group buy' });
  }
});

async function getCart(userId) {
  const [items] = await mysqlConnectionPool.query(
    'SELECT c.product_id AS id, p.name, c.quantity, p.price AS unitPrice, ' +
    '(c.quantity * p.price) AS totalPrice, c.group_buy_id ' +
    'FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?',
    [userId]
  );

  let groupBuy = null;
  if (items.length && items[0].group_buy_id) {
    const [groupBuys] = await mysqlConnectionPool.query(
      'SELECT id AS groupId, owner_name AS owner, target_quantity AS targetQuantity, ' +
      'current_quantity AS currentQuantity, deadline, status ' +
      'FROM group_buys WHERE id = ?',
      [items[0].group_buy_id]
    );
    groupBuy = groupBuys[0];
  }

  return { items, groupBuy };
}

export default router;