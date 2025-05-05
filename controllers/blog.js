import Post from "../models/Blog.js"
import mongoose from "mongoose"

// Create a new post
export const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      subCategory,
      tags,
      featuredImage,
      images,
      status,
      sections,
      meta,
    } = req.body

    const newPost = new Post({
      title,
      content,
      summary,
      author: req.user._id,
      category,
      subCategory,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : [],
      featuredImage,
      images: images || [],
      sections: sections || [],
      meta: meta || {},
      status: status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newPost.save()

    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "name email profileImage")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")

    res.status(201).json(populatedPost)
  } catch (error) {
    console.error("Create post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all posts with pagination and filtering
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subCategory, tag, author, status, search } = req.query
    const query = {}

    if (category) query.category = category
    if (subCategory) query.subCategory = subCategory
    if (tag) query.tags = { $in: [tag] }
    if (author) query.author = author

    if (req.user && ["admin", "author"].includes(req.user.role)) {
      if (status) query.status = status
    } else {
      query.status = "published"
    }

    if (search) {
      query.$text = { $search: search }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name email profileImage")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")

    const total = await Post.countDocuments(query)

    res.json({
      posts,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalPosts: total,
    })
  } catch (error) {
    console.error("Get posts error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" })
    }

    const post = await Post.findById(id)
      .populate("author", "name email profileImage bio")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    post.viewCount += 1
    await post.save()

    res.json(post)
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update a post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      content,
      summary,
      category,
      subCategory,
      tags,
      featuredImage,
      images,
      status,
      sections,
      meta,
    } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" })
    }

    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this post" })
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title: title || post.title,
        content: content || post.content,
        summary: summary || post.summary,
        category: category || post.category,
        subCategory: subCategory || post.subCategory,
        tags: tags ? tags.split(",").map(tag => tag.trim()) : post.tags,
        featuredImage: featuredImage || post.featuredImage,
        images: images || post.images,
        sections: sections || post.sections,
        meta: meta || post.meta,
        status: status || post.status,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("author", "name email profileImage")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")

    res.json(updatedPost)
  } catch (error) {
    console.error("Update post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" })
    }

    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this post" })
    }

    await Post.findByIdAndRemove(id)

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get related posts
export const getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "No post with that id" })
    }

    const post = await Post.findById(id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const relatedPosts = await Post.find({
      _id: { $ne: id },
      category: post.category,
      status: "published",
    })
      .limit(3)
      .sort({ createdAt: -1 })
      .populate("author", "name profileImage")
      .populate("category", "name slug")

    res.json(relatedPosts)
  } catch (error) {
    console.error("Get related posts error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
