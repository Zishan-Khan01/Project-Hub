import { Router } from "express";

import {
  createComment,
  getCommentsByTask,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = Router();

router.post("/", createComment);
router.get("/task/:taskId", getCommentsByTask);
router.get("/:id", getCommentById);
router.patch("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;