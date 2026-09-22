import { Router } from "express";

import { requireRole } from "../middleware/rbac.js";

import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
} from "../controllers/teamController.js";

const router = Router();

router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  createTeam
);

router.get(
  "/",
  getTeams
);

router.get(
  "/:id",
  getTeamById
);

router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  updateTeam
);

router.delete(
  "/:id",
  requireRole("ADMIN"),
  deleteTeam
);

router.post(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  addTeamMember
);

router.get(
  "/:id/members",
  getTeamMembers
);

router.delete(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  removeTeamMember
);

export default router;