const app = require('./app')

const cloudinary = require('cloudinary')
const connectDB = require('./config/database')

// handling uncaught exceptions
process.on('uncaughtException',(err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
})


if(process.env.NODE_ENV !== 'PRODUCTION') {
require('dotenv').config({path: "backend/config/config.env"})
}

// conencting to database
connectDB()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port http://localhost:${process.env.PORT}`)
})

// Unhandled Promise rejections
process.on("unhandledRejection", err => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection");

    server.close(() => {
        process.exit(1);
    });
    
    
})
