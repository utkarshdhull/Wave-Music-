import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

export function generateToken(userId) {
  if (!env.jwtSecret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  return jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    expiresIn: "7d"
  });
}

