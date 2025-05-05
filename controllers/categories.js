
// controllers/category.js
import { Category } from "../models/category.js"
import mongoose from "mongoose"

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body

    const categoryExists = await Category.findOne({ slug })
    if (categoryExists) {
      return res.status(400).json({ message: "Category with this slug already exists" })
    }

    const newCategory = new Category({ name, slug, description })
    await newCategory.save()

    res.status(201).json(newCategory)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getCategoryByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params
    let category = mongoose.Types.ObjectId.isValid(identifier)
      ? await Category.findById(identifier)
      : await Category.findOne({ slug: identifier })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid category ID" })
    }

    const existing = await Category.findOne({ slug, _id: { $ne: id } })
    if (existing) {
      return res.status(400).json({ message: "Category with this slug already exists" })
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      { name, slug, description, updatedAt: new Date() },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid category ID" })
    }

    const deleted = await Category.findByIdAndRemove(id)
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const { name, slug, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(404).json({ message: "Invalid category ID" })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const exists = category.subCategories.some(sub => sub.slug === slug)
    if (exists) {
      return res.status(400).json({ message: "Subcategory with this slug already exists" })
    }

    category.subCategories.push({ name, slug, description })
    category.updatedAt = new Date()
    await category.save()

    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(404).json({ message: "Invalid category ID" })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category.subCategories)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const updateSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params
    const { name, slug, description } = req.body

    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(404).json({ message: "Invalid ID" })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const subIndex = category.subCategories.findIndex(sub => sub._id.toString() === subCategoryId)
    if (subIndex === -1) {
      return res.status(404).json({ message: "Subcategory not found" })
    }

    const slugExists = slug && category.subCategories.some(
      sub => sub.slug === slug && sub._id.toString() !== subCategoryId
    )
    if (slugExists) {
      return res.status(400).json({ message: "Subcategory with this slug already exists" })
    }

    const sub = category.subCategories[subIndex]
    if (name) sub.name = name
    if (slug) sub.slug = slug
    if (description) sub.description = description
    sub.updatedAt = new Date()

    category.updatedAt = new Date()
    await category.save()

    res.json(category)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

export const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params

    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(404).json({ message: "Invalid ID" })
    }

    const category = await Category.findById(categoryId)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    const index = category.subCategories.findIndex(sub => sub._id.toString() === subCategoryId)
    if (index === -1) {
      return res.status(404).json({ message: "Subcategory not found" })
    }

    category.subCategories.splice(index, 1)
    category.updatedAt = new Date()
    await category.save()

    res.json({ message: "Subcategory deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
