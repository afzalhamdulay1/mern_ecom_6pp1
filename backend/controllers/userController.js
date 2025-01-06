const User = require('../models/userModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncErrors')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const cloudinary = require('cloudinary')
const crypto = require('crypto')

// register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {

    let userInfo = req.body

    if(req.body.avatar) {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        userInfo.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
    } else {
        userInfo.avatar = {
                public_id: "",
                url: ""
            }
    }
    
    
    const user = await User.create({ ...userInfo })

    sendToken(user, 201, res)
    
})

// update logged in user profile
// exports.updateProfile = catchAsyncError(async (req, res, next) => {
   
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//     }
//     const user = await User.findById(req.user.id)

//     if(req.body.avatar) {
//         if(user.avatar && user.avatar.public_id) {
//             const imageId = user.avatar.public_id
//             await cloudinary.v2.uploader.destroy(imageId)
//         }

//         const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
//             folder: 'avatars',
//             width: 150,
//             crop: "scale"
//         })

//         newUserData.avatar = {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url
//         }
        
        
//     } else {
//         newUserData.avatar = {
//             public_id: "",
//             url: "./images/Profile.png"
//         }
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//         req.user.id, 
//         newUserData, 
//         { new: true, runValidators: true })

    
//     res.status(200).json({
//         success: true
//     })
// })

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (req.body.avatar) {
        // Check if the user already has an avatar
        if (user.avatar.public_id !== "") {
            const imageId = user.avatar.public_id;
            await cloudinary.v2.uploader.destroy(imageId);
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    } else if (!user.avatar || !user.avatar.public_id) {
        // If no avatar was uploaded and user has no existing avatar
        newUserData.avatar = {
            public_id: "",
            url: "",
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        newUserData,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        user: updatedUser,
    });
});


exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body
    
    if(!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if(!user) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }

    sendToken(user, 200, res)

})


exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
})

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    
    if (!user) {
        return next(new ErrorHandler('No user found with that email', 404))
    }

    // get resetPassword token
    const resetToken = await user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })
    
    
    // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`
    
    const message = `You are receiving this temporary email because you (or maybe someone else) has requested a password reset for your account.\n\n Please click on the following link to reset your password: \n${resetPasswordUrl}\n\n If you did not make this request, please ignore this email and no changes will be made.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Ecommerce Password Reset',
            message
        })
        
        res.status(200).json({
            success: true,
            message: `Reset password email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }
})

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }
    
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    
    sendToken(user, 200, res)
})


// get User details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

// update User password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    console.log(req.body);
    const user = await User.findById(req.user.id).select('+password')
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)
    
    if(!isPasswordMatched) {
        return next(new ErrorHandler('Old password is incorrect', 401))
    }

    if(req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400))
    }

    user.password = req.body.newPassword
    await user.save()

    sendToken(user, 200, res)
})



// get all users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

// get single user details -- Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const user= await User.findById(req.params.id)
    if(!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
    })
})


// update user profile -- Admin
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
   
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(
        req.params.id, 
        newUserData, 
        { new: true, runValidators: true })

    
    res.status(200).json({
        success: true,
        user
    })
})

// delete a user -- Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
    
   
    const user = await User.findByIdAndUpdate(req.params.id)
    if(!user) {
        return next(new ErrorHandler(`User does not exists with id: ${req.params.id}`))
    }

    if(user.email === "afzalhamdulay1@gmail.com") {
        return next(new ErrorHandler(`cannot delete the main admin user`))
    }
    

    if(user.avatar?.public_id !== "") {
        const imageId = user.avatar?.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
    }
    

    await user.deleteOne()

    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    })
})



