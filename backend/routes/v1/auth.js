import { Router } from 'express';
import db from '../../lib/mysql.js';
import bcrypt from 'bcrypt';

const router = Router();

// 註冊
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 檢查是否已註冊
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Email 已被註冊' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
    'INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())', 
    [name, email, hashedPassword]);

    res.status(201).json({ message: '註冊成功' });
  } catch (err) {
    console.error('❌ 註冊錯誤:', err);
    res.status(500).json({ error: '註冊失敗' });
  }
});

// 登入
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];
      if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });
  
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: '帳號或密碼錯誤' });
  
      res.json({ id: user.id, email: user.email });
    } catch (err) {
      res.status(500).json({ error: '登入失敗' });
    }
  });

export default router;