const { Request, Response, NextFunction } = require("express");
const Category = require("../models/categoryModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const newCategory = await Category.create(req.body);
      res.json(newCategory);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const updateCategory = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedCategory);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteCategory = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const deletedCategory = await Category.findByIdAndDelete(id);
      res.json(deletedCategory);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getCategory = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const getCategory = await Category.findById(id);
      res.json(getCategory);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getAllCategory = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const getCategory = await Category.find();
      res.json(getCategory);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};

export {};
