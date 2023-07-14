const { Request, Response, NextFunction } = require("express");
const Coupon = require("../models/couponModel");
const validateMongodbId = require("../utils/validateMongodbId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const newCoupon = await Coupon.create(req.body);
      res.json(newCoupon);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getAllCoupon = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const allCoupon = await Coupon.find();
      res.json(allCoupon);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const updateCoupon = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
      const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.json(updatedCoupon);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteCoupon = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
      const deletedCoupon = await Coupon.findByIdAndDelete(id);
      res.json(deletedCoupon);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
module.exports = { createCoupon, getAllCoupon, updateCoupon, deleteCoupon };
export {};
