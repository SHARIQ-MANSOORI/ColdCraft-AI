// const { text ,to , subject } = require("express");
const User = require("../models/User"); // importing user schema
const sendEmail = require("../utils/sendEmail")
const jwt = require("jsonwebtoken");

const generateAuthToken = (user) => {
    const secret = process.env.JWT_SECRET || 'coldcraft_default_secret_key';
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    return token;
  }


exports.register = async (req,res,next)=>{

     try {
        
        let {username , email , password} = req.body; // post method give req.body data @ should match in schema

        // crediential check logic
        if(!username || !email || !password){
            return res.status(400).json({message:"Invalid username or password or email!!!"})
        }
        //pass length logic
        if(password.length < 6){
            return res.status(400).json({message:"password must be greater than 6 length"})
            
        }

            // email format logic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({
                message:"Incorrect email"
            })
        };

        // this logic check wheather the user already exists or not by email 
        const exsitingUser = await User.findOne({email});
        if(exsitingUser){
            return res.status(400).json({message:"Email already in use"})
        }


     // otp generation logic 
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // otp expiry time logic
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // after checking all above conditons user will create
      
      const user = await User.create({
        username, // all these fields come from the userSchema so all field should match schema
        email,
        password,
        otp,
        otpExpiry
      })
     
      
      // Send OTP verification email
      try {
        await sendEmail({
            to: email,
            subject: "Verification OTP - ColdCraft AI",
            text: `Your OTP verification code is: ${otp}. This code is valid for 10 minutes.`
        });
      } catch (emailError) {
        console.error("Failed to deliver OTP email to user:", emailError.message);
      }
      


     
       return res.status(200).json({
         message: "User Register Successfully",
         email: user.email,
         user: {
           username: user.username,
           email: user.email,
           isVerified: user.isVerified
         }
       })
        
     } catch (error) {
        next(error)
       
     }

};

module.exports.verifyOTP = async (req,res)=>{
    try {
        const {email , otp} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or otp"})
        }
        if(user.otp !== otp){
            return res.status(400).json({message:"Invalid otp"})
        }
        if(user.otpExpiry < Date.now()){
            return res.status(400).json({message:"Otp expired"})
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save(); // finally save the user after verification

        const token = generateAuthToken(user); // generate token for user
        return res.status(200).json({token , message:"Otp verified successfully",user});

    } catch (error) {
        console.log("Error-verifyOTP",error)
    }
}


module.exports.login = async (req,res)=>{
    try {
        const {email , password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"})
        } 
        if(!user.isVerified){
            return res.status(400).json({message:"Please verify your email first"})
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"})
        }
        const token = generateAuthToken(user); // generate token for user
        return res.status(200).json({token, message:"Login successful",user});
    } catch (error) {
        console.log("Error-login",error)
    }
}
