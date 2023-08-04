const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "mgikunda",
  api_key: "146655336852887",
  api_secret: "0HBqZpQcJ0wJxfN_bCmiMeU_yUc",
});

const cloudinaryUploadImg = async (fileToUpload: any) => {

  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUpload, (result: any) => {
      resolve({
        url: result.secure_url,
      });
    });
  });
};

module.exports = cloudinaryUploadImg;
