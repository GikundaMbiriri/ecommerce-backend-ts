const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const databaseConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRoute");
const brandRouter = require("./routes/brandRoute");
const blogRouter = require("./routes/blogRoute");
const couponRouter = require("./routes/couponRoute");
const blogCategoryRouter = require("./routes/blogCategoryRoute");

databaseConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/blog", blogRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/blog-category", blogCategoryRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
