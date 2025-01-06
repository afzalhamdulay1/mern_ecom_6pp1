const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')
const dotenv = require('dotenv')
dotenv.config({path: "backend/config/config.env"})
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.processPayment = catchAsyncError( async (req,res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        description: 'Payment for an item',
        metadata: { 
            company: "Ecommerce",
         },
    }) 

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
        paymentIntentId: myPayment.id
    })
 
})

exports.sendStripeApiKey = catchAsyncError( async (req,res, next) => {

    res.status(200).json({
        success: true,
        stripeApiKey: `${process.env.STRIPE_API_KEY}`
    })
 
})