import mysql2 from "mysql2/promise";
import { config } from "dotenv";
import { MySQL } from "../lib/constants.js";
config();

const access = {
  user: MySQL.USER,
  password: MySQL.PASSWORD,
  database: MySQL.DATABASE,
};
const mysqlConnectionPool = mysql2.createPool(access);

console.log(access);
export default mysqlConnectionPool;
