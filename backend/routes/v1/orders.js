// backend/routes/v1/orders.js
import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js';
import { StatusCode } from '../../lib/constants.js';
import { verifyJWT } from '../../lib/jwt.js';
import db from '../../lib/mysql.js';

const router = Router();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCode.UNAUTHORIZED).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    res.status(StatusCode.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const [orders] = await mysqlConnectionPool.query(
      'SELECT id, user_id, total FROM orders WHERE id = ?',
      [id]
    );
    if (!orders.length) {
      return res.status(StatusCode.NOT_FOUND).json({ error: 'Order not found' });
    }
    if (orders[0].user_id !== req.user.id) {
      return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
    }
    const [items] = await mysqlConnectionPool.query(
      'SELECT oi.product_id, p.name, oi.quantity, oi.price ' +
      'FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [id]
    );
    res.json({ id: orders[0].id, total: orders[0].total, items });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to fetch order' });
  }
});

router.get('/', async (req, res) => {
  const { user_id, offset = 0, limit = 5 } = req.query;
  
  try {
    // 簡化的用戶驗證，只檢查是否提供了 user_id
    if (!user_id) {
      return res.status(StatusCode.BAD_REQUEST).json({ error: '未提供用戶ID' });
    }

    // 獲取訂單總數
    const [totalResult] = await mysqlConnectionPool.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [user_id]
    );
    const totalOrders = totalResult[0].total;

    // 獲取未付款訂單數量
    const [unpaidResult] = await mysqlConnectionPool.query(
      'SELECT COUNT(*) as unpaidCount FROM orders a join groupbuys b on a.groupbuy_id=b.id WHERE a.user_id = ? AND a.paid = 0 and DATEDIFF(DATE(b.deadline), DATE(NOW()))<2 ',
      [user_id]
    );
    const unpaidCount = unpaidResult[0].unpaidCount;
    console.log('未付款訂單數量:', unpaidCount);

    // 獲取訂單列表
    const [orders] = await mysqlConnectionPool.query(
      `SELECT o.id, o.product, o.quantity, o.paid, o.created_at, DATE_FORMAT(deadline, '%Y-%m-%d') deadline  
       FROM orders o 
       join groupbuys g on o.groupbuy_id=g.id
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC 
       LIMIT ? OFFSET ?`,
      [user_id, parseInt(limit), parseInt(offset)]
    );    res.json({
      orders: orders,                 // 訂單資料陣列
      totalOrders: totalOrders,       // 該用戶的總訂單數
      unpaidCount: unpaidCount,     // 新增未付款訂單數量
      newOffset: orders.length < limit ? null : parseInt(offset) + orders.length  // 分頁用的位移值
    });
  } catch (error) {
    console.error('獲取訂單列表錯誤:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: '無法獲取訂單列表' });
  }
});

router.post('/', async (req, res) => {
  console.log('🔥 進入 POST /api/orders');
  console.log('✅ 收到 POST /api/v1/orders 請求', req.body);
  const { items, user_id } = req.body;

  if (!Array.isArray(items) || items.length === 0 || !user_id) {
    return res.status(400).json({ error: '缺少必要的資料' });
  }

  try {
    const insertOrderSQL = `
      INSERT INTO orders (groupbuy_id, user_id, product, quantity, paid, created_at)
      VALUES (?, ?, ?, ?, 0, NOW())
    `;

    for (const item of items) {
      const groupbuy_id = item.groupbuy_id || null;
      const { name: product, quantity } = item;

      await mysqlConnectionPool.query(insertOrderSQL, [
        groupbuy_id,
        user_id,
        product,
        quantity,
      ]);
    }
    console.log('🧹 準備刪除 carts 中的資料, user_id:', user_id);
    await mysqlConnectionPool.query(
      'DELETE FROM carts WHERE user_id = ?',
      [user_id]
    );
    console.log('✅ 已刪除 carts 中的資料, user_id:', user_id);

    return res.status(200).json({ message: '訂單已成功儲存' });
  } catch (error) {
    console.error('寫入訂單失敗:', error);
    return res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
  }
});


router.patch('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { paid } = req.body;

  // 驗證 paid 是否為布林值
  if (typeof paid !== 'boolean') {
    return res.status(400).json({ error: '無效的付款狀態' });
  }

  try {
    // 確認訂單存在
    const [orders] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: '訂單不存在' });
    }

    // 更新 paid 欄位
    await db.query('UPDATE orders SET paid = ? WHERE id = ?', [paid ? 1 : 0, id]);

    res.json({ message: '付款狀態更新成功' });
  } catch (error) {
    console.error('更新付款狀態失敗:', error);
    res.status(500).json({ error: '更新付款狀態失敗', details: error.message });
  }
});

export default router;