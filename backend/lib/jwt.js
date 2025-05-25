import * as jose from "jose";
import { JWT } from "./constants.js";

/**
 * @typedef {Object} Payload
 */

/**
 * This function sign a JWT with given payload
 *
 * @param {Payload} payload
 * @returns {Promise<string>}
 */
export async function signJWT(payload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT.ALG })
    .setExpirationTime("2h")
    .sign(JWT.SECRET);
}

/**
 * This function verify a JWT and extract the payload
 *
 * @param {string} jwt
 * @returns {Promise<Payload>}
 */
export async function verifyJWT(jwt) {
  const { payload } = await jose.jwtVerify(jwt, JWT.SECRET, {});
  return payload;
}
