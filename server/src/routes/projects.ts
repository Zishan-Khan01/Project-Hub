import { Router } from "express";
import { requireRole } from "../middleware/rbac.js";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "../controllers/projectController.js";

const router = Router();

router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  createProject
);

router.get(
  "/",
  getProjects
);

router.get(
  "/:id",
  getProjectById
);

router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  updateProject
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  deleteProject
);

router.post(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  addProjectMember
);

router.get(
  "/:id/members",
  getProjectMembers
);

router.delete(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  removeProjectMember
);

export default router;