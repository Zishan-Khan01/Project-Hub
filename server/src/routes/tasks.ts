import { Router } from "express";
import { requireRole } from "../middleware/rbac.js";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  createTask
);

router.get(
  "/",
  getTasks
);

router.get(
  "/:id",
  getTaskById
);

router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  updateTask
);

router.delete("/:id", requireRole("ADMIN"), deleteTask);

export default router;