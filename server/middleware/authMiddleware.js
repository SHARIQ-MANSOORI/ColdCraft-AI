// without login user cannot access the ai-routes
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req,res,next)=>{
    try {
        const authHeader = req.header('Authorization');
        if(!authHeader){
            return res.status(401).json({message:"No token provided"});
        }
        const token = authHeader.replace('Bearer ',''); // get token from header
        if(!token){
            return res.status(401).json({message:"No token provided"});
        }

        const secret = process.env.JWT_SECRET || 'coldcraft_default_secret_key';
        const decoded = jwt.verify(token, secret); // verify token
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