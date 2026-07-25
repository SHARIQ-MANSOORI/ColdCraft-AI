const axios = require('axios');
const EmailHistory = require('../models/emailHistory')

exports.generateEmail = async (req,res)=>{
    const {prompt} = req.body;
    if(!prompt){
       return res.status(400).json({message:"Prompt is required!"});
    }

    try {
        
    } catch (error) {
        console.log()
        
    }

}