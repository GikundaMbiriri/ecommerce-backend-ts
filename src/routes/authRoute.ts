const express = require("express");
const {
  createUser,

} = require("../controller/userCtrl");
//const { authMiddleware, isAdmin } = require("../middlewares/authMidleware");
const router = express.Router();

router.post("/register", createUser);


module.exports = router;
export{}