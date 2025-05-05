import mongoose from "mongoose"

const sectionSchema = mongoose.Schema({
  section_img: String,
  section_title: String,
  section_description: String,
  section_list: [String],
})

const metaSchema = mongoose.Schema({
  meta_title: String,
  meta_description: String,
  meta_keywords: [String],
})

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  summary: { type: String },
  content: { type: String },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
  },
  tags: [String],
  featuredImage: { type: String },
  images: [String],
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  featured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  sections: [sectionSchema],
  meta: metaSchema,
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
})

postSchema.index({ title: "text", description: "text", tags: "text" })

const Post = mongoose.model("Post", postSchema)
export default Post
