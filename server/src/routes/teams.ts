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


// Create team
router.post(
  "/",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  createTeam
);


// List teams
router.get(
  "/",
  getTeams
);


// Get one team
router.get(
  "/:id",
  getTeamById
);


// Update team
router.patch(
  "/:id",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  updateTeam
);


// Delete team
router.delete(
  "/:id",
  requireRole("ADMIN"),
  deleteTeam
);


// Add team member
router.post(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  addTeamMember
);


// List team members
router.get(
  "/:id/members",
  getTeamMembers
);


// Remove team member
router.delete(
  "/:id/members",
  requireRole("ADMIN", "PROJECT_MANAGER"),
  removeTeamMember
);


export default router;