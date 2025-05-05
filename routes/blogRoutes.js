import express from "express"
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getRelatedPosts
} from "../controllers/blog.js" 

import { verifyToken, isAuthorOrAdmin } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getPosts)
router.get("/:id", getPostById)
router.get("/:id/related", getRelatedPosts)

// Protected routes
router.post("/", verifyToken, isAuthorOrAdmin, createPost)
router.put("/:id", verifyToken, isAuthorOrAdmin, updatePost)
router.delete("/:id", verifyToken, isAuthorOrAdmin, deletePost)

export default router
