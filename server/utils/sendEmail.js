const nodemailer  = require('nodemailer');

const sendEmail = async (options)=>{

   try {
     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[DEV MODE] Email credentials not configured. Email content for ${options.to}:\nSubject: ${options.subject}\nBody: ${options.text}`);
        return;
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
     console.log('email sent successfully');

   } catch(error) {
     console.log('ERROR SENDING MAIL:', error.message);
     // In local development, log the email details so registration flow continues
     console.log(`[DEV FALLBACK] Notification for ${options.to}: ${options.text}`);
   }
}

module.exports = sendEmail;