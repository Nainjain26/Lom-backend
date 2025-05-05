import express from "express"
import {
  createCategory,
  getCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/categories.js"
import { verifyToken, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.get("/", getCategories)
router.get("/:identifier", getCategoryByIdOrSlug)
router.get("/:categoryId/subcategories", getSubCategories)

// Protected routes (admin only)
router.post("/", verifyToken, isAdmin, createCategory)
router.put("/:id", verifyToken, isAdmin, updateCategory)
router.delete("/:id", verifyToken, isAdmin, deleteCategory)

// Subcategory routes
router.post("/:categoryId/subcategories", verifyToken, isAdmin, createSubCategory)
router.put("/:categoryId/subcategories/:subCategoryId", verifyToken, isAdmin, updateSubCategory)
router.delete("/:categoryId/subcategories/:subCategoryId", verifyToken, isAdmin, deleteSubCategory)

export default router