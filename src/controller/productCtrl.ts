const { Request, Response, NextFunction } = require("express");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const { query } = require("express");
const User = require("../models/userModel");
const validateMongodbId = require("../utils/validateMongodbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
import { ObjectId } from "mongodb";
const fs = require("fs");
const createProduct = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error: any) {
      throw new Error(error);
    }
    res.json({
      message: "Hey it is a product post route",
    });
  }
);

const updateaProduct = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;

    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const updateProduct = await Product.findOneAndUpdate(
        { _id: id },
        req.body,
        {
          new: true,
        }
      );
      res.json(updateProduct);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getaProduct = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;

    try {
      const findProduct = await Product.findById(id);
      res.json(findProduct);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteProduct = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;

    try {
      const deleteProduct = await Product.findByIdAndDelete(id);
      res.json(deleteProduct);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getAllProducts = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const queryObj = { ...req.query };

      // const excludeFields = ["page", "sort", "limit", "fields"];
      // excludeFields.forEach((el) => delete queryObj[el]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );

      let query = Product.find(JSON.parse(queryStr));

      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }

      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This page does not exist");
      }

      const product = await query;
      res.json(product);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const addToWishlist = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    const { prodId } = req.body;

    try {
      const user = await User.findById(_id);

      const alreadyAdded = user.wishList.find(
        (id: ObjectId) => id.toString() === prodId
      );
      if (alreadyAdded) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishList: prodId },
          },
          { new: true }
        );
        res.json(user);
      } else {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishList: prodId },
          },
          { new: true }
        );
        res.json(user);
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const rating = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
      const product = await Product.findById(prodId);
      let alreadyRated = product.ratings.find(
        (userId: { postedby: ObjectId }) =>
          userId.postedby.toString() === _id.toString()
      );
      if (alreadyRated) {
        const updateRating = await Product.updateOne(
          {
            ratings: { $elemMatch: alreadyRated },
          },
          {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          },
          { new: true }
        );
      } else {
        const rateProduct = await Product.findByIdAndUpdate(
          prodId,
          {
            $push: {
              ratings: {
                star: star,
                comment: comment,
                postedby: _id,
              },
            },
          },
          { new: true }
        );
      }
      const getAllRatings = await Product.findById(prodId);
      let totalRating = getAllRatings.ratings.length;
      let ratingSum = getAllRatings.ratings
        .map((item: { star: number }) => item.star)
        .reduce((prev: number, curr: number) => prev + curr, 0);
      let actualRating = Math.round(ratingSum / totalRating);
      let finalProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          totalRating: actualRating,
        },
        {
          new: true,
        }
      );
      res.json(finalProduct);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const uploadImages = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;

    validateMongodbId(id);
    const uploader = (path: string) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      try {
        const { path } = file;

        const newPath = await uploader(path);
        urls.push(newPath);
        fs.unlinkSync(path);
      } catch (error: any) {
        throw new Error(error);
      }
    }
    try {
      const findProduct = await Product.findByIdAndUpdate(
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

      res.json(findProduct);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

module.exports = {
  createProduct,
  getaProduct,
  getAllProducts,
  updateaProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages,
};
export {};
