const { Request, Response,NextFunction } = require('express');
const notFound = (req:typeof Request, res:typeof Response, next:typeof NextFunction) => {
    const error = new Error(`Not Found : ${req.orignalUrl}`);
    res.status(404);
    next(error);
  };
  
  const errorHandler = (err:Error, req:typeof Request, res:typeof Response, next:typeof NextFunction) => {
    console.log(err);
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err?.message,
      stack: err?.stack,
    });
  };
  
  module.exports = {
    errorHandler,
    notFound,
  };
  
  export{}