// backend/routes/v1/orders.js
import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js';
import { StatusCode } from '../../lib/constants.js';
import { verifyJWT } from '../../lib/jwt.js';

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

    // 獲取訂單列表
    const [orders] = await mysqlConnectionPool.query(
      `SELECT o.id, o.product, o.quantity, o.paid, o.created_at 
       FROM orders o 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC 
       LIMIT ? OFFSET ?`,
      [user_id, parseInt(limit), parseInt(offset)]
    );    res.json({
      orders: orders,                 // 訂單資料陣列
      totalOrders: totalOrders,       // 該用戶的總訂單數
      newOffset: orders.length < limit ? null : parseInt(offset) + orders.length  // 分頁用的位移值
    });
  } catch (error) {
    console.error('獲取訂單列表錯誤:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: '無法獲取訂單列表' });
  }
});

export default router;