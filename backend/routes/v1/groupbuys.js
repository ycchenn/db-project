import { Router } from 'express';
import db from '../../lib/mysql.js';

const router = Router();


router.get('/', async (req, res) => {
  const userId = req.query.user_id;

  try {
    let rows;
    if (userId) {
      [rows] = await db.query('SELECT * FROM groupbuys WHERE user_id = ?', [userId]);
    } else {
      [rows] = await db.query('SELECT * FROM groupbuys');
    }

    res.json(rows);
  } catch (err) {
    console.error('❌ 查詢失敗:', err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ✅ 建立新團購（含商品資訊）
router.post('/', async (req, res) => {
  const {
    user_id,
    title,
    description,
    price,
    image_url,
    max_count,
    deadline
  } = req.body;

  const sql = `
    INSERT INTO groupbuys 
      (user_id, title, description, price, image_url, max_count, current_count, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, '進行中')
  `;
  try {
    await db.query(sql, [user_id, title, description, price, image_url, max_count, deadline]);
    res.status(201).json({ message: '新增團購成功' });
  } catch (err) {
    console.error('❌ 新增失敗:', err);
    res.status(500).json({ error: '新增失敗' });
  }
});

// ✅ 取得單一團購
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM groupbuys WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: '找不到該團購' });
    res.json(rows[0]);
  } catch (err) {
    console.error('查詢失敗:', err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ✅ 更新團購資訊
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
      updatedStatus = '已成團';
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

// ✅ 刪除團購
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM groupbuys WHERE id = ?', [id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('刪除失敗:', err);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export default router;

