import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import v1 from "./routes/v1/api.js";
import bodyParser from "body-parser";
import cors from "./lib/cors.js";
import userRouter from "./routes/v1/user.js";


console.log(process.env.MYSQL_USER);  // 打印特定環境變數


/**
 * @param {express.Response} res - We can manage Response with this arg.
 */
async function pong(_, res) {
  res.json({
    status: "pong",
  });
}

const app = express();
app.use("/", cors);
app.use(bodyParser.json());

/* for example */
app.get("/", (_, res) => res.send("<h1>GET!</h1>"));
app.post("/", (_, res) => res.send("<h1>POST!</h1>"));
app.use("/user", userRouter);

app.get("/ping", pong);
app.use("/api/v1", v1);
app.listen(3000);
