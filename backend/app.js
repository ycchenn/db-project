import dotenv from 'dotenv';
dotenv.config();

import bodyParser from "body-parser";
import express from "express";
import cors from 'cors';
import v1 from "./routes/v1/api.js";
import authRoutes from './routes/v1/auth.js';
import groupbuyRouter from './routes/v1/groupbuys.js';
import orderRoutes from './routes/v1/orders.js';
import cartRoutes from './routes/v1/cart.js';

console.log('🧪 cartRoutes is:', cartRoutes);
console.log('🧪 orderRoutes is:', orderRoutes);

console.log(process.env.DB_USER);  // 打印特定環境變數


/**
 * @param {express.Response} res - We can manage Response with this arg.
 */
async function pong(_, res) {
  res.json({
    status: "pong",
  });
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3001'], // 或 ['http://localhost:3001', 'https://yourdomain.com']
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));



app.get("/", (_, res) => res.send("<h1>GET!</h1>"));
app.post("/", (_, res) => res.send("<h1>POST!</h1>"));

app.get('/test', (_, res) => {
  console.log('🧪 收到 /test 請求');
  res.send('test ok');
});

app.get("/ping", pong);
app.use('/api/v1', v1);
app.use('/api/groupbuys', groupbuyRouter);
app.use('/api', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// 添加一個測試路由
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.listen(3000, () => {
  console.log("✅ 伺服器正在 http://localhost:3000 上運行");
});
