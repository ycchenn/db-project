import { Router } from 'express';
import db from '../../lib/mysql.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // 取得團購商品總數
    const [totalGroupBuys] = await db.query('SELECT COUNT(*) as total FROM groupbuys');
    
    // 取得已成團的團購數
    const [completedGroupBuys] = await db.query("SELECT COUNT(*) as completed FROM groupbuys WHERE status = '已成團'");
    
    // 取得進行中的團購數
    const [ongoingGroupBuys] = await db.query("SELECT COUNT(*) as ongoing FROM groupbuys WHERE status = '進行中'");
    
    // 取得總會員數
    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
    
    // 取得有下單過的顧客數（user_id 在 orders 出現過的唯一數量）
    const [uniqueOrderUsers] = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM orders');

    res.json({
      totalGroupBuys: totalGroupBuys[0].total,
      completedGroupBuys: completedGroupBuys[0].completed,
      ongoingGroupBuys: ongoingGroupBuys[0].ongoing,
      totalUsers: totalUsers[0].total,
      uniqueOrderUsers: uniqueOrderUsers[0].total
    });
  } catch (err) {
    console.error('❌ 查詢統計資料失敗:', err);
    res.status(500).json({ error: '查詢統計資料失敗' });
  }
});

export default router;
