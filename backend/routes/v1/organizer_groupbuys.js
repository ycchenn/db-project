import { Router } from 'express';
import db from '../../lib/mysql.js'; // 請確認路徑是否正確

const router = Router();

// 取得所有團購資料
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM organizer_groupbuys');
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch organizer_groupbuys:', err);
    res.status(500).json({ error: '伺服器錯誤，無法取得團購資料' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, current_count, max_count, deadline} = req.body;

    const sql = `
      INSERT INTO organizer_groupbuys 
        (title, description, status, current_count, max_count, deadline)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [title, description, status, current_count, max_count, deadline]);

    res.status(201).json({ message: '新增成功' });
  } catch (err) {
    console.error('❌ 新增團購失敗:', err);
    res.status(500).json({ error: '新增失敗' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query('SELECT * FROM organizer_groupbuys WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: '找不到該團購' });
  res.json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, price, status, maxCount, currentCount, deadline } = req.body;
  try {
    let updatedStatus = status;
    if (parseInt(currentCount) >= parseInt(maxCount)) {
      updatedStatus = '已成團';
    }
    await db.query(
      'UPDATE organizer_groupbuys SET title = ?, description = ?, price = ?, status = ?, max_count = ?, current_count = ?, deadline = ? WHERE id = ?',
      [title, description, price, updatedStatus, maxCount, currentCount, deadline, id]
    );
    res.json({ message: '更新成功' });
  } catch (err) {
    console.error('更新失敗:', err);
    res.status(500).json({ error: '更新失敗' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM organizer_groupbuys WHERE id = ?', [id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('刪除失敗:', err);
    res.status(500).json({ error: '刪除失敗' });
  }
});

export default router;
