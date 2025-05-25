// backend/routes/v1/notifications.js
import { Router } from 'express';
import { StatusCode } from '../../lib/constants.js';
import mysqlConnectionPool from '../../lib/mysql.js';
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

// 發送團購通知給所有參與者
router.post('/groupbuy/:groupBuyId', authenticate, async (req, res) => {
  const { groupBuyId } = req.params;
  const { userId, content } = req.body;

  if (!userId) {
    return res.status(StatusCode.BAD_REQUEST).json({ error: 'Missing userId' });
  }

  try {
    // 確認發送者是否為團購主
    const [groupBuy] = await mysqlConnectionPool.query(
      'SELECT user_id FROM groupbuys WHERE id = ?',
      [groupBuyId]
    );

    if (!groupBuy.length || groupBuy[0].user_id !== parseInt(userId)) {
      return res.status(StatusCode.FORBIDDEN).json({ error: 'Only group buy owner can send notifications' });
    }

    // 獲取所有參與此團購的用戶
    const [participants] = await mysqlConnectionPool.query(
      'SELECT DISTINCT user_id FROM orders WHERE groupbuy_id = ?',
      [groupBuyId]
    );

    // 為每個參與者創建通知
    const notifications = participants.map(participant => [
      participant.user_id,
      content || '您好！您在此團購的商品已準備完成，請按時來取貨。',
      groupBuyId
    ]);

    if (notifications.length > 0) {
      await mysqlConnectionPool.query(
        'INSERT INTO notifications (user_id, content, reference_id) VALUES ?',
        [notifications]
      );
    }

    res.status(StatusCode.CREATED).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Send group buy notifications error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to send notifications' });
  }
});

// 獲取用戶的通知
router.get('/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;
  if (parseInt(userId) !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }

  try {
    const [notifications] = await mysqlConnectionPool.query(
      'SELECT id, content, reference_id, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to fetch notifications' });
  }
});

// 建立新通知
router.post('/', authenticate, async (req, res) => {
  const { userId, content, referenceId } = req.body;
  if (parseInt(userId) !== req.user.id) {
    return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
  }

  try {
    const [result] = await mysqlConnectionPool.query(
      'INSERT INTO notifications (user_id, content, reference_id) VALUES (?, ?, ?)',
      [userId, content, referenceId]
    );
    
    const [notification] = await mysqlConnectionPool.query(
      'SELECT id, content, reference_id, created_at FROM notifications WHERE id = ?',
      [result.insertId]
    );

    res.status(StatusCode.CREATED).json(notification[0]);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to create notification' });
  }
});

// 刪除通知
router.delete('/:notificationId', authenticate, async (req, res) => {
  const { notificationId } = req.params;

  try {
    // 確認這個通知屬於當前用戶
    const [notifications] = await mysqlConnectionPool.query(
      'SELECT user_id FROM notifications WHERE id = ?',
      [notificationId]
    );

    if (!notifications.length) {
      return res.status(StatusCode.NOT_FOUND).json({ error: 'Notification not found' });
    }

    if (notifications[0].user_id !== req.user.id) {
      return res.status(StatusCode.FORBIDDEN).json({ error: 'Unauthorized access' });
    }

    await mysqlConnectionPool.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
    res.status(StatusCode.OK).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to delete notification' });
  }
});

// 發送取貨通知
router.post('/groupbuy/:groupBuyId/pickup', authenticate, async (req, res) => {
  const { groupBuyId } = req.params;

  try {
    // 查詢該團購的已付款顧客清單
    const [users] = await mysqlConnectionPool.query(
      `SELECT DISTINCT u.id AS user_id
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.group_buy_id = ? AND o.status = 'completed'`,
      [groupBuyId]
    );

    if (!users.length) {
      return res.status(StatusCode.NOT_FOUND).json({ error: 'No users found for this group buy' });
    }

    // 批次寫入通知
    const notificationContent = '您的團購商品已準備好取貨，請盡快前往取貨點！';
    const notifications = users.map(user => [user.user_id, notificationContent, groupBuyId]);

    await mysqlConnectionPool.query(
      'INSERT INTO notifications (user_id, content, reference_id) VALUES ?',
      [notifications]
    );

    res.status(StatusCode.CREATED).json({ message: 'Pickup notifications sent successfully' });
  } catch (error) {
    console.error('Send pickup notifications error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to send pickup notifications' });
  }
});

// 發送團購通知給所有參與者
router.post('/groupbuy/:groupBuyId', async (req, res) => {
  const { groupBuyId } = req.params;
  const { userId, content } = req.body;

  try {
    // 確認發送者是否為團購主
    const [groupBuy] = await mysqlConnectionPool.query(
      'SELECT user_id FROM groupbuys WHERE id = ?',
      [groupBuyId]
    );

    if (!groupBuy.length || groupBuy[0].user_id !== parseInt(userId)) {
      return res.status(StatusCode.FORBIDDEN).json({ error: 'Only group buy owner can send notifications' });
    }

    // 獲取所有參與此團購的用戶
    const [participants] = await mysqlConnectionPool.query(
      'SELECT DISTINCT user_id FROM orders WHERE groupbuy_id = ?',
      [groupBuyId]
    );

    // 為每個參與者創建通知
    const notifications = participants.map(participant => [
      participant.user_id,
      content,
      groupBuyId
    ]);

    if (notifications.length > 0) {
      await mysqlConnectionPool.query(
        'INSERT INTO notifications (user_id, content, reference_id) VALUES ?',
        [notifications]
      );
    }

    res.status(StatusCode.CREATED).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Send group buy notifications error:', error);
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Failed to send notifications' });
  }
});

export default router;
