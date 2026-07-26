const axios = require('axios');
const EmailHistory = require('../models/emailHistory')
const systemPrompt = require('../prompts/systemPrompt');

exports.generateEmail = async (req,res)=>{
    const {prompt} = req.body;
    if(!prompt){
       return res.status(400).json({message:"Prompt is required!"});
    }
    
    if(prompt.trim().length === 0){
        return res.status(400).json({message:"Prompt cannot be empty!"});
    }
    if(prompt.length > 500){
        return res.status(400).json({message:"Prompt should not exceed 500 characters!"});
    }
                                            
    try {                                            
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions',{
            model: 'llama-3.3-70b-versatile',
            messages:[
                {role:'system' , content:systemPrompt},
                {role:'user' , content:prompt}
            ],
            max_tokens:1000,
            temperature:0.7
        },{
            headers:{
                'Authorization':`Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type':'application/json'
            },
            timeout:30000
        });

        const aiResponse = response.data.choices[0].message.content;

        let parsedResponse;

         try {
            parsedResponse = JSON.parse(aiResponse);
        } catch (err) {
            return res.status(500).json({
                message: "Invalid response received from AI."
            });
        }


        const {subject , emailBody , linkedInDM , followUpEmail} = parsedResponse;
        const emailHistory = await EmailHistory.create({
            user:req.user._id,
            prompt,
            subject,
            emailBody,
            linkedInDM,
            followUpEmail

        })

       return res.status(200).json({
        success: true,
        message: "Email generated successfully.",
        data: emailHistory})

    } catch (error) {
        console.log('Error Gneratiing email:',error.message);
        return res.status(500).json({
            message:'Error generation email',
            error:error.message
        })
        
    }

}


exports.getHistory = async (req,res)=>{
    try {
        const emailHistories = await EmailHistory.find({user:req.user._id}).sort({createdAt:-1});  
        return res.status(200).json(emailHistories);
    } catch (error) {
        console.log('Error retrieving email history:', error.message);
        return res.status(500).json({
            message: 'Error retrieving email history',
            error: error.message
        });
    }
};