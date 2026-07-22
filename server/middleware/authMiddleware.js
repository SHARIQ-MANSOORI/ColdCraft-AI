// without login user cannot access the ai-routes
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ',''); // get token from header
        if(!token){
            return res.status(401).json({message:"No token provided"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET); // verify token
        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(401).json({message:"User not found"})
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message:"Invalid token"})
    }
}

module.exports = authMiddleware;