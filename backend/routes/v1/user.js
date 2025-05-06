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
    res.status(StatusCode.OK).json({
      id: results[0]["UserId"],
      token: await signJWT({ id: results[0]["UserId"] }),
    });
  } catch (err) {
    res.status(StatusCode.BAD_REQUEST).json({ error: err.toString() });
  }
}
userRouter.post("/login", login);
