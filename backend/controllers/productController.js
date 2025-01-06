const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')
const ApiFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')

// create product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
    
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    const imagesLinks = []

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products',
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks

    req.body.user = req.user.id;    
    const product = await Product.create(req.body)
    res.status(201).json({
        success: true,
        product
    })
}
)

// Get all products
// exports.getAllProducts = catchAsyncError(async (req, res) => {
//     // console.log(req.query); // Log query parameters for debugging

//     const resultPerPage = 8;
//     const productsCount = await Product.countDocuments(); // Get total product count

//     const apiFeature = new ApiFeatures(Product.find(), req.query)
//         .search() // Apply search functionality
//         .filter() // Apply filter functionality
//         .pagination(resultPerPage); // Apply pagination

//     const products = await apiFeature.query; // Execute the query with all features applied

//     res.status(200).json({
//         success: true,
//         products, // List of products
//         productsCount, // Total product count
//         resultPerPage
//     });
// });



exports.getAllProducts = catchAsyncError(async (req, res) => {
    // console.log(req.query); // Log query parameters for debugging

    const resultPerPage = 8;
    const productsCount = await Product.countDocuments(); // Get total product count

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search() // Apply search functionality
        .filter() // Apply filter functionality
        

    const filteredProductsCount = await apiFeature.query.clone().countDocuments();

    apiFeature.pagination(resultPerPage); // Apply pagination after filtering
    
    const products = await apiFeature.query;

        
    
    res.status(200).json({
        success: true,
        products, // List of products
        productsCount, // Total product count
        resultPerPage,
        filteredProductsCount

    });
});



exports.getAdminProducts = catchAsyncError(async (req, res) => {
    
    const products = await Product.find()

    res.status(200).json({
        success: true,
        products, // List of products
    });
});

// update product -- Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    )

    res.status(200).json({
        success: true,
        product
    })
}
)


// delete product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    // Deleting Images From Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

    await product.deleteOne()
    res.status(200).json({
        success: true,
        message: `${product.name} Product deleted successfully`
    })
}
)

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        product,
    })
}
)

// create new review or update existing review
exports.createReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body
    
    let review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(rev=> rev.user.toString() === req.user._id.toString())

    if(isReviewed){
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()){
                review.rating = rating 
                review.comment = comment
            }
        })
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }
    
    let avg=0
    product.reviews.forEach(rev => {
        avg += rev.rating
    })

    product.ratings = avg/product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})


exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    
    const product = await Product.findById(req.query.id)    

    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    if(product.reviews.length < 1) {
        return next(new ErrorHandler("0 reviews for this product"))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
    
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())
    
    let avg=0

    reviews.forEach(rev => {
        avg += rev.rating
    })

    
    // Handle cases where no reviews remain
    const ratings = reviews.length > 0 ? avg / reviews.length : 0;
    const numOfReviews = reviews.length;

    const updatedProduct = await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    },{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        reviews: updatedProduct.reviews,
        oldReviewLength: product.reviews.length,
        newReviewLength: updatedProduct.reviews.length
    })
})

