import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import teamRoutes from "./routes/teams.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import commentRoutes from "./routes/comments.js";

import { requireAuth } from "./middleware/auth.js";
import { requireTenant } from "./middleware/tenant.js";

import { apiRateLimiter } from "./config/rateLimit.js";

import { securityHeaders } from "./config/security.js";

import {
  generateCsrfToken,
  doubleCsrfProtection,
} from "./middleware/csrf.js";

const app = express();

app.use(securityHeaders);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(cookieParser());

// General API rate limiting
//app.use("/api", apiRateLimiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
  });
});

//CSRF token
app.get("/api/auth/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);

  res.json({
    csrfToken: token,
  });
});

// Authentication
app.use("/api/auth", authRoutes);


// Protected routes
app.use(
  "/api/users",
  requireAuth,
  requireTenant,
  userRoutes
);

app.use(
  "/api/teams",
  requireAuth,
  requireTenant,
  teamRoutes
);

app.use(
  "/api/projects",
  requireAuth,
  requireTenant,
  projectRoutes
);

app.use(
  "/api/tasks",
  requireAuth,
  requireTenant,
  taskRoutes
);

app.use(
  "/api/comments",
  requireAuth,
  requireTenant,
  commentRoutes
);

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;