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

export default router;