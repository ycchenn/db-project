import { Router } from 'express';
import db from '../../lib/mysql.js';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.query.user_id;

  try {
    let rows;
    if (userId) {
      [rows] = await db.query(`
        SELECT g.*, u.name AS seller_name
        FROM groupbuys g
        LEFT JOIN users u ON g.user_id = u.id
        WHERE g.user_id = ?
      `, [userId]);
    } else {
      [rows] = await db.query(`
        SELECT g.*, u.name AS seller_name
        FROM groupbuys g
        LEFT JOIN users u ON g.user_id = u.id
      `);
    }

    res.json(rows);
  } catch (err) {
    console.error('❌ 查詢失敗:', {
      message: err.message,
      code: err.code,
      sql: err.sql,
      stack: err.stack,
    });
    res.status(500).json({ error: '查詢失敗', details: err.message });
  }
});

router.post('/', async (req, res) => {
  const {
    user_id,
    title,
    description,
    price,
    image_url,
    status,
    max_count,
    deadline
  } = req.body;

  const sql = `
    INSERT INTO groupbuys 
      (user_id, title, description, price, image_url, max_count, current_count, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `;
  try {
    await db.query(sql, [
      user_id,
      title,
      description,
      price,
      image_url,
      max_count,
      deadline,
      status || 'open'
    ]);
    res.status(201).json({ message: '新增團購成功' });
  } catch (err) {
    console.error('❌ 新增失敗:', err);
    res.status(500).json({ error: '新增失敗' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT g.*, u.name AS seller_name
      FROM groupbuys g
      LEFT JOIN users u ON g.user_id = u.id
      WHERE g.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: '找不到該團購' });
    res.json(rows[0]);
  } catch (err) {
    console.error('查詢失敗:', err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    image_url,
    status,
    max_count,
    current_count,
    deadline
  } = req.body;

  try {
    let updatedStatus = status;
    if (parseInt(current_count) >= parseInt(max_count)) {
      updatedStatus = 'full';
    }

    const sql = `
      UPDATE groupbuys
      SET title = ?, description = ?, price = ?, image_url = ?, status = ?, max_count = ?, current_count = ?, deadline = ?
      WHERE id = ?
    `;
    await db.query(sql, [
      title,
      description,
      price,
      image_url,
      updatedStatus,
      max_count,
      current_count,
      deadline,
      id
    ]);

    res.json({ message: '更新成功' });
  } catch (err) {
    console.error('更新失敗:', err);
    res.status(500).json({ error: '更新失敗' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 先刪除購物車中的相關項目
    await db.query('DELETE FROM cart_items WHERE groupbuy_id = ?', [id]);
    
    // 刪除團購（相關訂單會因為 CASCADE 自動刪除）
    await db.query('DELETE FROM groupbuys WHERE id = ?', [id]);
    
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('刪除失敗:', err);
    res.status(500).json({ error: '刪除失敗' });
  }
});

router.get('/:id/orders', async (req, res) => {
  const groupbuyId = req.params.id;
  try {
    const [orders] = await db.query(`
      SELECT o.id, o.product, o.quantity, o.paid, o.created_at,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.groupbuy_id = ?
      ORDER BY o.created_at DESC
    `, [groupbuyId]);
    res.json(orders);
  } catch (err) {
    console.error('查詢訂單失敗:', err);
    res.status(500).json({ error: '查詢訂單失敗' });
  }
});

export default router;