import { Router } from "express";
import userRouter from "./user.js";
import couponRouter from "./coupon.js";
import productsRouter from "./products.js";


const v1 = Router();
v1.use("/user", userRouter);
v1.use("/coupon", couponRouter);
v1.use("/products", productsRouter);


export default v1;
