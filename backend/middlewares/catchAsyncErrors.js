module.exports = (passedFunc) => (req,res,next) => {
    Promise.resolve(passedFunc(req,res,next)).catch((err)=> next(err))
}   