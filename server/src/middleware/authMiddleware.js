import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getBearerToken(req) {
  const header = req.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7);
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  if (!env.jwtSecret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Invalid or expired token");
  }

  req.user = user;
  next();
});

export const optionalProtect = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    next();
    return;
  }

  if (!env.jwtSecret) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (user) {
      req.user = user;
    }
  } catch (e) {
    // Ignore token verify error for optional auth
  }

  next();
});

