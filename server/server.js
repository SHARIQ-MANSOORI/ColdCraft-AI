const express = require('express');

const dotenv = require('dotenv');
require('dotenv').config(); // env config first

const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
// const aiRoutes = require('./routes/aiRoutes')
const PORT = process.env.PORT || 3000;



connectDB();  // then connect db 
const app = express(); // then create server

app.use(express.json()); // json data parse
app.use(express.urlencoded({extended:true})); // urlencoded data parse
app.use('/api/auth',authRoutes);
// app.use('/api/ai',aiRoutes);

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