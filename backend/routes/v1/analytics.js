import { Router } from 'express';
import db from '../../lib/mysql.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // 取得團購主 id，優先用 query 參數 user_id
    const ownerId = req.query.user_id;

    // 取得團購商品總數
    const [totalGroupBuys] = await db.query('SELECT COUNT(*) as total FROM groupbuys' + (ownerId ? ' WHERE user_id = ?' : ''), ownerId ? [ownerId] : []);
    
    // 取得已成團的團購數
    const [completedGroupBuys] = await db.query("SELECT COUNT(*) as completed FROM groupbuys WHERE status = '已成團'" + (ownerId ? ' AND user_id = ?' : ''), ownerId ? [ownerId] : []);
    
    // 取得進行中的團購數
    const [ongoingGroupBuys] = await db.query("SELECT COUNT(*) as ongoing FROM groupbuys WHERE status = '進行中'" + (ownerId ? ' AND user_id = ?' : ''), ownerId ? [ownerId] : []);
    
    // 取得總會員數
    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
    
    // 取得有下單過你開過的所有團購的顧客數（orders 裡 groupbuy_id 屬於你開的團購，user_id 不重複）
    let uniqueOrderUsers;
    if (ownerId) {
      // 先查出你開過的所有團購 id
      const [myGroupbuys] = await db.query('SELECT id FROM groupbuys WHERE user_id = ?', [ownerId]);
      const groupbuyIds = myGroupbuys.map(gb => gb.id);
      if (groupbuyIds.length > 0) {
        [uniqueOrderUsers] = await db.query(
          `SELECT COUNT(DISTINCT user_id) as total FROM orders WHERE groupbuy_id IN (${groupbuyIds.map(() => '?').join(',')})`,
          groupbuyIds
        );
      } else {
        uniqueOrderUsers = [{ total: 0 }];
      }
    } else {
      [uniqueOrderUsers] = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM orders');
    }

    // 取得熱門商品排行（僅統計自己開過的團購，依售出數量前3名）
    let topProducts = [];
    if (ownerId) {
      // 查出自己開過的所有團購 id
      const [myGroupbuys] = await db.query('SELECT id FROM groupbuys WHERE user_id = ?', [ownerId]);
      const groupbuyIds = myGroupbuys.map(gb => gb.id);
      if (groupbuyIds.length > 0) {
        [topProducts] = await db.query(
          `SELECT product, SUM(quantity) as totalSold
           FROM orders
           WHERE groupbuy_id IN (${groupbuyIds.map(() => '?').join(',')})
           GROUP BY product
           ORDER BY totalSold DESC
           LIMIT 3`,
          groupbuyIds
        );
      }
    }

    res.json({
      totalGroupBuys: totalGroupBuys[0].total,
      completedGroupBuys: completedGroupBuys[0].completed,
      ongoingGroupBuys: ongoingGroupBuys[0].ongoing,
      totalUsers: totalUsers[0].total,
      uniqueOrderUsers: uniqueOrderUsers[0].total,
      topProducts // 新增熱門商品排行
    });
  } catch (err) {
    console.error('❌ 查詢統計資料失敗:', err);
    res.status(500).json({ error: '查詢統計資料失敗' });
  }
});

export default router;
