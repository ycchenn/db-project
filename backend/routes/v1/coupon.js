import express, { Router } from "express";
import mysqlConnectionPool from "../../lib/mysql.js";
import { StatusCode } from "../../lib/constants.js";
import { verifyJWT } from "../../lib/jwt.js";

const couponRouter = Router();
export default couponRouter;

/**
 * Add Coupon with fields:
 * - `title`
 * - `description` (optional)
 * - `brand` (optional)
 * - `location` (optional)
 * - `discountStart`
 * - `discountEnd`
 * - `currency` (optional)
 * - `discountNum`
 * - `discountType`
 * - `uploadDate` (optional)
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function addCoupon(req, res) {
  const { authorization: bearerToken } = req.headers;
  const token = bearerToken.slice(8, -1); //("Bearer ".length+1,-1)
  const { id } = verifyJWT(token);

  const {
    title,
    description,
    brand,
    location,
    discountStart,
    discountEnd,
    currency,
    discountNum,
    discountType,
    uploadDate,
  } = req.body;

  const mysql = await mysqlConnectionPool.getConnection();
  try {
    await mysql.query(
      `
		INSERT INTO \`Coupon\` (
			Title,
			Description,
			Brand,
			Location,
			DiscountStart,
			DiscountEnd,
			Currency,
			DiscountNum,
			DiscountType,
			UploadDate,
			UploadedBy
		)
		VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        title,
        description,
        brand,
        location,
        discountStart.slice(0, -1),
        discountEnd.slice(0, -1),
        currency,
        discountNum,
        discountType,
        uploadDate
          ? uploadDate.slice(0, -1)
          : new Date().toISOString().slice(0, -1),
        id,
      ],
    );
    return res.status(StatusCode.CREATED).json({ status: "ok" });
  } catch (err) {
    return res.status(StatusCode.BAD_REQUEST).json({ error: err.toString() });
  }
}
couponRouter.post("/", addCoupon);

/**
 * Search coupons with filters like:
 * - `keyword` (optional)
 * - `brand` (optional)
 * - `location` (optional)
 * - `archived` (optional)
 * - `since` (optional)
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function getCoupon(req, res) {
  const { keyword, brand, location, archived, since } = req.query;
  const { query, params } = genQueryParams(
    keyword,
    brand,
    location,
    archived,
    since,
  );
  const mysql = await mysqlConnectionPool.getConnection();
  try {
    const [results] = await mysql.query(query, params);
    return res.status(StatusCode.OK).json({ results });
  } catch (e) {
    return res.status(StatusCode.BAD_REQUEST).json({ error: "Invalid Fields" });
  }
}
couponRouter.get("/", getCoupon);
/**
 * A composition of sql statement and params
 * @typedef {Object} QueryParams
 * @property {string} query
 * @property {string[]} params
 */
/**
 * @param {string} keyword
 * @param {string} brand
 * @param {string} location
 * @param {string} archived
 * @param {number} since
 * @return {QueryParams}
 */
function genQueryParams(keyword, brand, location, archived, since) {
  const query = `
	SELECT
		CouponId,
		Title,
		Description,
		Brand,
		Location,
		DiscountStart,
		DiscountEnd,
		Currency,
		DiscountNum,
		DiscountType,
		UploadDate,
		UploadedBy,
		u.Name
	FROM \`Coupon\` c
	INNER JOIN \`User\` u ON c.UploadedBy=u.UserId
	WHERE
	`;
  let filters = [];
  let params = [];
  if (keyword) filters.push(`Title LIKE '%${keyword}%'`);
  if (brand) {
    filters.push("Brand=?");
    params.push(brand);
  }
  if (location) {
    filters.push("Location=?");
    params.push(location);
  }
  switch (archived) {
    case "true" || true:
      filters.push("Archived=TRUE");
      break;
    default:
      filters.push("Archived=FALSE");
      break;
  }
  if (since) {
    filters.push("CouponId > ?");
    params.push(since);
  }

  return { query: query + filters.join(" AND "), params };
}
