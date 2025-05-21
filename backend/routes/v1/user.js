import express, { Router } from "express";
import mysqlConnectionPool from "../../lib/mysql.js";
import { signJWT } from "../../lib/jwt.js";
import { StatusCode } from "../../lib/constants.js";

const userRouter = Router();
export default userRouter;

/**
 * Signup with `name`, `email` and `password` in request body.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function signup(req, res) {
  const { name, email, password } = req.body;
  /* The password should encrypted / hashed, I skip that part here */
  const mysql = await mysqlConnectionPool.getConnection();
  try {
    await mysql.query(
      `
		INSERT INTO User (Name, Email, Password)
		VALUES (?, ?, ?)`,
      [name, email, password],
    );
    res.status(StatusCode.CREATED).json({ status: "ok" });
  } catch (err) {
    res.status(StatusCode.BAD_REQUEST).json({ error: err.toString() });
  }
}
userRouter.post("/signup", signup);

/**
 * Login with `email` and `password` in request body.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function login(req, res) {
  const { email, password } = req.body;
  const mysql = await mysqlConnectionPool.getConnection();
  try {
    const [results] = await mysql.query(
      `
		SELECT UserId, Name, Email FROM \`User\`
		WHERE
		Email=? AND Password=?
		`,
      [email, password],
    );
    if (results.length === 0) throw new Error("Wrong account or password!");

    // 調試 signJWT
    console.log("Generating token for user:", results[0]["UserId"]);
    const token = await signJWT({ id: results[0]["UserId"] });
    console.log("Generated token:", token);

    res.status(StatusCode.OK).json({
      id: results[0]["UserId"],
      email: results[0]["Email"],
      token: token, // 確保 token 被返回
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(StatusCode.BAD_REQUEST).json({ error: err.toString() });
  }
}
userRouter.post("/login", login);

/**
 * Get customer orders with details
 */
async function getCustomerOrders(req, res) {
  const customerId = req.params.customerId;
  const mysql = await mysqlConnectionPool.getConnection();
  try {
    const [results] = await mysql.query(
      `
      SELECT 
        o.id,
        p.name as product_name,
        od.quantity,
        od.unit_price,
        (od.quantity * od.unit_price) as total_price,
        o.created_at
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      JOIN products p ON od.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      `,
      [customerId]
    );
    
    res.json({
      orders: results
    });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  } finally {
    mysql.release();
  }
}

userRouter.get('/customers/:customerId/orders', getCustomerOrders);

/**
 * Get current user's order history
 */
async function getUserOrders(req, res) {
  const userId = req.user.id; // 從 JWT 取得用戶 ID
  const mysql = await mysqlConnectionPool.getConnection();
  
  try {
    const [results] = await mysql.query(
      `
      SELECT 
        o.id,
        p.name as product_name,
        od.quantity,
        od.unit_price,
        (od.quantity * od.unit_price) as total_price,
        o.created_at
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      JOIN products p ON od.product_id = p.id
      WHERE o.user_id = ? AND o.status = 'completed'
      ORDER BY o.created_at DESC
      `,
      [userId]
    );
    
    res.json({
      orders: results
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  } finally {
    mysql.release();
  }
}

/**
 * Get current user's orders
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getCurrentUserOrders(req, res) {
  console.log('Received userId:', req.query.userId); // 添加日誌
  const userId = req.query.userId; // 從請求中提取用戶ID
  const mysql = await mysqlConnectionPool.getConnection();
  try {
    const [results] = await mysql.query(
      `
      SELECT 
        id,
        groupbuy_id,
        user_id,
        product,
        quantity,
        paid,
        created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );
    console.log('Query results:', results); // 添加日誌
    res.json({
      orders: results
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: '無法載入訂單資料' });
  } finally {
    mysql.release();
  }
}

userRouter.get('/orders', getCurrentUserOrders);
