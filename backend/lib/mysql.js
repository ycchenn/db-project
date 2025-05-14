import mysql2 from "mysql2/promise";
import { config } from "dotenv";
config(); // 載入 .env

const access = {
  host: process.env.DB_HOST,     //  加上 host
  port: process.env.DB_PORT || 3306, //  預設 MySQL port
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
};

const mysqlConnectionPool = mysql2.createPool(access);

console.log("✅ MySQL connected with config:", access);

export default mysqlConnectionPool;

