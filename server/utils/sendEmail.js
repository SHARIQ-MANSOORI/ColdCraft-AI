const nodemailer  = require('nodemailer');

const sendEmail = async (options)=>{

   try{
     if(!process.env.EMAIL_USER || process.env.EMAIL_PASS){
        throw new Error('Email credientials are not set in environment variables');

    }

    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from:process.env.EMAIL_USER,
        to:options.to,
        subject:options.subject,
        text:options.text,
        html:`<p>${options.text}</p> `
    };

    await transporter.sendMail(mailOptions);
    console.log('email sent successfully')

   }catch(error){
    console.log('ERROR SENDING MAIL',error.message);
    throw error;
   }
}

module.exports = sendEmail;