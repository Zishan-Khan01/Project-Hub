import { Router } from "express";

import { requireRole } from "../middleware/rbac.js";

import {
  getCurrentUser,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/me", getCurrentUser);

router.get("/", getUsers);

router.post(
  "/",
  requireRole("ADMIN"),
  createUser
);

router.patch(
  "/:id",
  requireRole("ADMIN"),
  updateUser
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  deleteUser
);

router.get("/:id", getUserById);

export default router;