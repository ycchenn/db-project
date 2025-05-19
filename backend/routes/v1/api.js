// backend/routes/v1/api.js
import { Router } from 'express';
import userRouter from './user.js';
import couponRouter from './coupon.js';
import groupbuyRouter from './groupbuys.js';
import cartRouter from './cart.js';
import ordersRouter from './orders.js';

const v1 = Router();
v1.use('/user', userRouter);
v1.use('/coupon', couponRouter);
v1.use('/groupbuys', groupbuyRouter);
v1.use('/cart', cartRouter);
v1.use('/orders', ordersRouter);

export default v1;