import { Router } from 'express';
import mysqlConnectionPool from '../../lib/mysql.js'; // 如果你的 mysql 檔在別的地方請改對路徑

const router = Router();

router.get('/', async (req, res) => {

  try {
    const [rows] = await mysqlConnectionPool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
