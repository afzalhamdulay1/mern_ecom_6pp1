const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');

if(process.env.NODE_ENV !== 'PRODUCTION') {
  require('dotenv').config({path: "backend/config/config.env"})
}


const errorMiddleware = require('./middlewares/error')

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
app.use(cors());


// app.use(
//   cors({
//     origin: 'https://ecom1-mern.netlify.app/',
//     credentials: true,  // Allow cookies to be sent
//   })
// );

// route imports
const product = require('./routes/productRoutes')
const user = require('./routes/userRoutes')
const order = require('./routes/orderRoutes')
const payment = require('./routes/paymentRoutes')

app.use("/api/v1",product)
app.use("/api/v1",user)
app.use("/api/v1",order)
app.use("/api/v1",payment)

app.use(express.static(path.join(__dirname,'../frontend/dist')))
app.get("*",(req,res)=>{
  res.sendFile(path.resolve(__dirname,'../frontend/dist/index.html'))
})

app.use(errorMiddleware)

module.exports = app