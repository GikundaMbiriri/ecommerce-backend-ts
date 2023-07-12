const { Request, Response, NextFunction } = require("express");

const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const validateMongodbId = require("../utils/validateMongodbId");

const asyncHandler = require("express-async-handler");

const createUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      //create a new user
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      //user already exits
      throw new Error("User already exists");
    }
  }
);

const loginUserCtrl = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { email, password } = req.body;
    //User exists ?
    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const token = generateToken(findUser?._id);
      const updateUser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
);
const loginAdmin = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { email, password } = req.body;
    //User exists ?
    const findAdmin = await User.findOne({ email: email });
    if (findAdmin.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorised Access",
      });
    }
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findAdmin?._id);
      const token = generateToken(findAdmin?._id);
      const updateUser = await User.findByIdAndUpdate(
        findAdmin.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({
        _id: findAdmin?._id,
        firstname: findAdmin?.firstname,
        lastname: findAdmin?.lastname,
        email: findAdmin?.email,
        mobile: findAdmin?.mobile,
        token: generateToken(findAdmin?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
);
const handleRefreshToken = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
      return res.status(404).json({
        message: "No refreshToken in cookies.",
      });
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    console.log(user.id);
    if (!user) throw new Error("No refreshToken in database or matched.");
    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET,
      (err: any, decoded: { id: string }) => {
        if (err || user.id !== decoded.id) {
          throw new Error("There is something wrong with refresh token.");
        } else {
          const accessToken = generateToken(user._id);
          res.json({ accessToken });
        }
      }
    );
  }
);
const logout = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refreshToken in cookies.");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204);
    }
    await User.findOneAndUpdate(
      { refreshToken },
      {
        refreshToken: "",
      }
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json({
      message: "Logged out successfully",
    });
  }
);
const userCart = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
      let products = [];
      const user = await User.findById(_id);
      const cartExist = await Cart.findOne({ orderBy: user._id });
      if (cartExist) {
        cartExist.remove();
      }
      for (let i = 0; i < cart.length; i++) {
        let object: {
          product: string;
          count: number;
          color: string;
          price: number;
        } = {
          product: "",
          count: 0,
          color: "",
          price: 0,
        };
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getPrice = await Product.findById(cart[i]._id)
          .select("price")
          .exec();
        object.price = getPrice.price;
        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      console.log(products, cartTotal);
      let newCart = await new Cart({
        products,
        cartTotal,
        orderBy: user?._id,
      }).save();
      res.json(newCart);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
module.exports = {
  createUser,
  loginUserCtrl,
  loginAdmin,
  handleRefreshToken,
  logout,
  userCart,
};

export {};
