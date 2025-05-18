import { Router } from "express";
import userRouter from "./user.js";
import couponRouter from "./coupon.js";
import groupbuyRouter from "./groupbuys.js";

const v1 = Router();
v1.use("/user", userRouter);
v1.use("/coupon", couponRouter);
v1.use("/groupbuys", groupbuyRouter);


export default v1;
