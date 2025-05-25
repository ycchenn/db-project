import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js';

const router = Router();


// 加入購物車
router.post('/', async (req, res) => {
  const { userId, groupBuyId, productName, quantity, unitPrice } = req.body;

  if (!userId || !groupBuyId || !productName || !quantity || !unitPrice) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  try {
    const [existing] = await mysqlConnectionPool.query(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND groupbuy_id = ?',
      [userId, groupBuyId]
    );

    if (existing.length > 0) {
      await mysqlConnectionPool.query(
        'UPDATE carts SET quantity = quantity + ?, unit_price = ? WHERE id = ?',
        [quantity, unitPrice, existing[0].id]
      );
    } else {
      await mysqlConnectionPool.query(
        `INSERT INTO carts (user_id, groupbuy_id, product_name, quantity, unit_price, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, groupBuyId, productName, quantity, unitPrice]
      );
    }

    res.status(200).json({ message: '加入購物車成功' });
  } catch (error) {
    console.error('加入購物車失敗:', error);
    res.status(500).json({ error: '伺服器錯誤，無法加入購物車' });
  }
});

// 取得指定使用者的購物車內容
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [items] = await mysqlConnectionPool.query(
      `SELECT 
         id,
         groupbuy_id AS groupbuy_id,
         product_name AS name,
         quantity,
         unit_price AS unitPrice,
         (quantity * unit_price) AS totalPrice
       FROM carts
       WHERE user_id = ?`,
      [userId]
    );

    if (!items.length) {
      return res.json({ items: [], groupBuys: [] });
    }

    const groupBuyIds = [...new Set(items.map(item => item.groupbuy_id))].filter(Boolean);

    let groupBuys = [];
    if (groupBuyIds.length > 0) {
      const [groupBuyRows] = await mysqlConnectionPool.query(
        `SELECT 
           id AS groupId,
           user_id AS owner,
           max_count AS targetQuantity,
           current_count AS currentQuantity,
           deadline,
           status
         FROM groupbuys
         WHERE id IN (?)`,
        [groupBuyIds]
      );
      groupBuys = groupBuyRows;
    }

    res.json({ items, groupBuys });
  } catch (error) {
    console.error('讀取購物車失敗:', error);
    res.status(500).json({ error: '伺服器錯誤，無法讀取購物車' });
  }
});

// 刪除購物車中指定商品
router.delete('/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    await mysqlConnectionPool.query(
      'DELETE FROM carts WHERE user_id = ? AND id = ?',
      [userId, productId]
    );
    res.status(200).json({ message: '商品已移除' });
  } catch (error) {
    console.error('刪除商品失敗:', error);
    res.status(500).json({ error: '伺服器錯誤，無法刪除商品' });
  }
});

// 清空購物車
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await mysqlConnectionPool.query(
      'DELETE FROM carts WHERE user_id = ?',
      [userId]
    );
    res.status(200).json({ message: '購物車已清空' });
  } catch (error) {
    console.error('清空購物車失敗:', error);
    res.status(500).json({ error: '伺服器錯誤，無法清空購物車' });
  }
});




// 更新購物車數量
router.put('/', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({ error: '缺少欄位' });
  }

  try {
    const [result] = await mysqlConnectionPool.query(
      'UPDATE carts SET quantity = ? WHERE user_id = ? AND id = ?',
      [quantity, userId, productId]
    );
    console.log('✅ 更新成功:', result);
    res.status(200).json({ message: '更新成功' });
  } catch (err) {
    console.error('更新數量失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});







export default router;
