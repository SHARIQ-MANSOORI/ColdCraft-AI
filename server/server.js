const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
require('dotenv').config(); // env config first

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const gmailRoutes = require('./routes/gmailRoutes');
const PORT = process.env.PORT || 3000;

connectDB();  // then connect db 
const app = express(); // then create server
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    "https://coldcraft-ai-1.onrender.com",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json()); // json data parse
app.use(express.urlencoded({extended:true})); // urlencoded data parse
app.use('/api/auth',authRoutes);
app.use('/api/ai',aiRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/google', gmailRoutes);

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({message:"Internal server error"});  // error handling middleware

}); 


app.get("/",(req,res)=>{

    res.send("Hlo this is main route")
    console.log("Main route is working ")
})



app.listen(PORT , ()=>{
    console.log(`Server is runing on port ${PORT}`);
})