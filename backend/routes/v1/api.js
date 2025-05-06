import { Router } from "express";
import userRouter from "./user.js";
import couponRouter from "./coupon.js";

const v1 = Router();
v1.use("/user", userRouter);
v1.use("/coupon", couponRouter);

export default v1;
