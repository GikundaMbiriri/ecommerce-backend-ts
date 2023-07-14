const { Request, Response, NextFunction } = require("express");
const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");

const createBrand = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const newBrand = await Brand.create(req.body);
      res.json(newBrand);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const updateBrand = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedBrand);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteBrand = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const deletedBrand = await Brand.findByIdAndDelete(id);
      res.json(deletedBrand);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getBrand = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    try {
      const getBrand = await Brand.findById(id);
      res.json(getBrand);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getAllBrand = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const getBrand = await Brand.find();
      res.json(getBrand);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getAllBrand,
};
export {};
