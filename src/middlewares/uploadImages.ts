const { Request, Response, NextFunction } = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { File } = multer;
const multerStorage = multer.diskStorage({
  destination: function (
    req: typeof Request,
    file: typeof File,
    cb: (error: any, destination: string) => void
  ) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (
    req: typeof Request,
    file: typeof File,
    cb: (error: any, destination: string) => void
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

const multerFilter = (
  req: typeof Request,
  file: typeof File,
  cb: (error: any, destination: string | boolean) => void
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

const productImgResize = async (
  req: typeof Request,
  res: typeof Response,
  next: typeof NextFunction
) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file: typeof File) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
      // fs.unlinkSync(`public/images/products/${file.filename}`);
    })
  );
  next();
};
const blogImgResize = async (
  req: typeof Request,
  res: typeof Response,
  next: typeof NextFunction
) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file: typeof File) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
      // fs.unlinkSync(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};

module.exports = {
  uploadPhoto,
  productImgResize,
  blogImgResize,
};

export {};
