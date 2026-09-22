import { Router } from "express";

import {
  register,
  login,
  logout,
} from "../controllers/authController.js";

import { authRateLimiter } from "../config/rateLimit.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", authRateLimiter, register);

router.post("/login", authRateLimiter, login);

router.post("/logout", requireAuth, logout);

export default router;