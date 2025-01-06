const ErrorHandler = require('../utils/errorHandler')



module.exports = (err,req,res,next) => {

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((value) => value.message).join(", ");
        err = new ErrorHandler(message, statusCode);
    }

    // wrong mongoDB ID error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    // mongodb duplicate ID error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400)
    }

    // wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid. Try again`
        err = new ErrorHandler(message, 400)
    }

    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is expired. Try again`
        err = new ErrorHandler(message, 400)
    }


    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}