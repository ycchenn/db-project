// backend/routes/v1/cart.js
import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js';




const router = Router();



router.post('/', async (req, res) => {
  const { userId, groupBuyId, productName, quantity, unitPrice } = req.body;

  if (!userId || !groupBuyId || !productName || !quantity || !unitPrice) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  try {
    // 查詢是否已存在相同 user_id + groupbuy_id 組合
    const [existing] = await mysqlConnectionPool.query(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND groupbuy_id = ?',
      [userId, groupBuyId]
    );

    if (existing.length > 0) {
      // 已存在，更新數量
      await mysqlConnectionPool.query(
        'UPDATE carts SET quantity = quantity + ?, unit_price = ? WHERE id = ?',
        [quantity, unitPrice, existing[0].id]
      );
    } else {
      // 新增項目
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


export default router;