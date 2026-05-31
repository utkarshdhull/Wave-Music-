import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { serializeUser } from "../utils/serializers.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const existingUser = await User.exists({ email: email.toLowerCase() });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({
    user: serializeUser(user),
    token: generateToken(user._id)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  const isValidPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    user: serializeUser(user),
    token: generateToken(user._id)
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(204).end();
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

