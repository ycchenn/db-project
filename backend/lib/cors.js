import express from "express";
/**
 * @param{express.Request} req
 * @param{express.Response} res
 * @param{function} next
 */
export default function cors(req, res, next) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // 預檢請求直接回應 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}
