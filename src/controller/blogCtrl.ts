const { Request, Response, NextFunction } = require("express");
const Blog = require("../models/blogModel");
const user = require("../models/userModel");
const validateMongodbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");
const { validate } = require("../models/productModel");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");
import { ObjectId } from "mongodb";

const createBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const newBlog = await Blog.create(req.body);
      res.json(newBlog);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const updateBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updateBlog);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const getBlog = await Blog.findById(id)
        .populate("likes")
        .populate("dislikes");
      await Blog.findByIdAndUpdate(
        id,
        { $inc: { numViews: 1 } },
        {
          new: true,
        }
      );
      res.json(getBlog);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getAllBlogs = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const getBlogs = await Blog.find();

      res.json(getBlogs);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const deletedBlog = await Blog.findByIdAndDelete(id);

      res.json(deletedBlog);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const likeBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const blog = await Blog.findById(id);
      const loginUserId = req?.user?._id;
      const isLiked = blog?.isLiked;
      const alreadyDisliked = blog?.dislikes?.find(
        (userId: ObjectId) => userId?.toString() === loginUserId?.toString()
      );
      if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $pull: { dislikes: loginUserId },
            isDisLiked: false,
          },
          { new: true }
        );
        res.json(blog);
      }
      if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $pull: { likes: loginUserId },
            isLiked: false,
          },
          { new: true }
        );
        res.json(blog);
      } else {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $push: { likes: loginUserId },
            isLiked: true,
          },
          { new: true }
        );
        res.json(blog);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const unlikeBlog = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const blog = await Blog.findById(id);
      const loginUserId = req?.user?._id;
      const isDisLiked = blog?.isDisLiked;
      const alreadyLiked = blog?.likes?.find(
        (userId: ObjectId) => userId?.toString() === loginUserId?.toString()
      );
      if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $pull: { likes: loginUserId },
            isLiked: false,
          },
          { new: true }
        );
        res.json(blog);
      }
      if (isDisLiked) {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $pull: { dislikes: loginUserId },
            isDisLiked: false,
          },
          { new: true }
        );
        res.json(blog);
      } else {
        const blog = await Blog.findByIdAndUpdate(
          id,
          {
            $push: { dislikes: loginUserId },
            isDisLiked: true,
          },
          { new: true }
        );
        res.json(blog);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const uploadImages = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
      const uploader = (path:string) => cloudinaryUploadImg(path, "images");
      const urls = [];
      const files = req.files;
      for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path);
        urls.push(newPath);
        fs.unlinkSync(path);
      }

      const findBlog = await Blog.findByIdAndUpdate(
        id,
        {
          images: urls.map((file) => {
            return file;
          }),
        },
        {
          new: true,
        }
      );

      res.json(findBlog);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  uploadImages,
};
export {};
