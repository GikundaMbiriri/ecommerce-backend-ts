const express = require("express");
const {
  createUser,
  loginUserCtrl,
  loginAdmin,
  handleRefreshToken,
  logout,
  userCart,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.post("/cart", authMiddleware, userCart);

module.exports = router;
export {};
