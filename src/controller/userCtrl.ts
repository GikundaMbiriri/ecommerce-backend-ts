const { Request, Response, NextFunction } = require("express");

const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const crypto = require("crypto");
const { findByIdAndUpdate } = require("../models/productModel");

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
const saveAddress = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const updateUser = await User.findByIdAndUpdate(
        _id,
        {
          address: req?.body?.address,
        },
        {
          new: true,
        }
      );
      res.json(updateUser);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getallUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    try {
      const getUsers = await User.find();
      res.json(getUsers);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const getaUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const getUser = await User.findById(id);
      res.json(getUser);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const deleteaUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const deleteUser = await User.findByIdAndDelete(id);
      res.json(deleteUser);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const updateaUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const updateUser = await User.findByIdAndUpdate(
        _id,
        {
          firstname: req?.body?.firstname,
          lastname: req?.body?.lastname,
          email: req?.body?.email,
          mobile: req?.body?.mobile,
        },
        {
          new: true,
        }
      );
      res.json(updateUser);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const blockUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    console.log(id);
    try {
      const block = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
        },
        {
          new: true,
        }
      );
      res.json(block);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const unblockUser = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const unblock = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
        },
        {
          new: true,
        }
      );
      res.json(unblock);
    } catch (error: any) {
      throw new Error(error);
    }
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
const updatePassword = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  }
);
const forgotPasswordToken = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    try {
      const token = await user.createPasswordResetToken();
      await user.save();
      const resetUrl = `Hi please follow this link to reset your password.This link is valid for ten minutes.<a href='http://localhost:5000/api/user/reset-password/${token}'>Click here</a>`;
      const data = {
        to: email,
        text: "Hey User",
        subject: "Forgot password Link",
        htm: resetUrl,
      };
      sendEmail(data);
      res.json(token);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const resetPassword = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token expired. Please try again.");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
  }
);
const getWishlist = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    try {
      const findUser = await User.findById(_id).populate("wishList");
      res.json(findUser);
    } catch (error: any) {
      throw new Error(error);
    }
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
const getUserCart = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const cart = await Cart.findOne({ orderBy: _id }).populate(
        "products.product"
      );
      res.json(cart);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
const emptyCart = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const user = await User.findOne({ _id });
      const cart = await Cart.findOneAndRemove({ orderBy: user._id });

      res.json(cart);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const applyCoupon = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
      throw new Error("Invalid Coupon.");
    }
    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({
      orderBy: user._id,
    }).populate("products.product");

    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      { orderBy: user._id },
      { totalAfterDiscount },
      { new: true }
    );
    res.json(totalAfterDiscount);
  }
);

const createOrder = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById({ _id });
      let userCart = await Cart.findOne({ orderBy: user._id });
      let finalAmount = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount;
      } else {
        finalAmount = userCart.cartTotal * 100;
      }
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmount,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderBy: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map(
        (item: { product: { _id: string }; count: number }) => {
          return {
            updateOne: {
              filter: { _id: item.product._id },
              update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
          };
        }
      );
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const getOrders = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
      const userorders = await Order.findOne({ orderBy: _id })
        .populate("products.product")
        .exec();
      res.json(userorders);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);

const updateOrderStatus = asyncHandler(
  async (req: typeof Request, res: typeof Response) => {
    const { status } = req.body;
    const { id } = req.params;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const findUser = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(findUser);
    } catch (error: any) {
      throw new Error(error);
    }
  }
);
module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
};

export {};
