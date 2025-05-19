import { Router } from "express";
import analyticsRouter from "./analytics.js";
import couponRouter from "./coupon.js";
import groupbuyRouter from "./groupbuys.js";
import userRouter from "./user.js";

const v1 = Router();
v1.use("/user", userRouter);
v1.use("/coupon", couponRouter);
v1.use("/groupbuys", groupbuyRouter);
v1.use("/analytics", analyticsRouter);


export default v1;
