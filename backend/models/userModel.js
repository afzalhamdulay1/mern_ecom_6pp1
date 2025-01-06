const mongoose = require('mongoose'); 
const validator = require('validator');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [30, "Name cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            // required: [true, "Please choose an avatar"],
        },
        url: {
            type: String,
            // required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},{timestamps: true})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
}

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

// generating password reset token
userSchema.methods.getResetPasswordToken = async function() {

    // generating token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hashing and adding to resetPasswordToken field in userSchema
    this.resetPasswordToken = crypto
       .createHash('sha256')
       .update(resetToken)
       .digest('hex');

    // setting expiration time for resetPasswordToken
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    
    return resetToken;
}

module.exports = mongoose.model('User', userSchema)