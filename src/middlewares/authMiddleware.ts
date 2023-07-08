const User = require("../models/userModel");
const { Request, Response,NextFunction } = require('express');

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const authMiddleware = asyncHandler(async (req:typeof Request, res:typeof Response, next: typeof NextFunction) => {
  const cookie = req.cookies;
  if (!cookie?.token) throw new Error("No refreshToken in cookies.");
  const token = cookie.token;

  try {
    if (token) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET ? process.env.JWT_SECRET : "I am the greatest Dev"
      );
      const user = await User.findById(decodedToken?.id);
      req.user = user;
      next();
    }
  } catch (error) {
    throw new Error("Not Authorised.Token expired.");
  }
});

const isAdmin = asyncHandler(async (req:typeof Request, res:typeof Response, next: typeof NextFunction) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("You are not an admin");
  } else {
    next();
  }
});
module.exports = { authMiddleware, isAdmin };
