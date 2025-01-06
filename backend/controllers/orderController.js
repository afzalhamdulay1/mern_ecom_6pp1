const Order = require('../models/orderModel');
const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')

// create new order

exports.createOrder = catchAsyncError(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(201).json({
        success: true,
        order
    })
})


// get single order details
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    
    if (!order) {
        return next(new ErrorHandler('Order not found', 404))
    }   
    
    res.status(200).json({
        success: true,
        order
    })
})

// get loggedIn user orders
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
     
    res.status(200).json({
        success: true,
        orders
    })
})


// get all orders -- ADMIN
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find().populate('user', 'name email')

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });
    
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}) 

// update order status
exports.updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
        return next(new ErrorHandler('Order not found', 404))
    }

    if(order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('You have already delivered this order', 400))
    }

    if (!req.body.status) {
        return next(new ErrorHandler('Status field is required', 400));
    }

    order.orderItems.forEach(async order => {
        await updateStock(order.productId, order.quantity)
    })

    order.orderStatus = req.body.status
    if(req.body.status === 'Delivered') {
        order.deliveredAt = Date.now()
    }

    await order.save({ validateBeforeSave: false })
    
    res.status(200).json({
        success: true,
    })
}) 

async function updateStock(productId, quantity) {
    const product = await Product.findById(productId)
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false })
}

// delete order -- ADMIN
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new ErrorHandler('Order not found', 404))
    }

    await order.deleteOne()
    
    res.status(200).json({
        success: true,
    })
}) 
