const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    const conn = mongoose.connect(
      process.env.MONGODB_URL
        ? process.env.MONGODB_URL
        : "mongodb+srv://Mgrinders:36927683pm@cluster0.mvhi0eb.mongodb.net/ecommerce"
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database Error", error);
  }
};

module.exports = dbConnect;