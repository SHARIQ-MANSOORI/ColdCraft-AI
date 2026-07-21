const mongoose = require('mongoose');

const connectDB = async ()=>{
    try {
       await  mongoose.connect(process.env.MONGO_URL);
        console.log("Mongo connect success")
        
        
    } catch (error) {
        console.log('MONGO CONNECTION ERROR',error);
        process.exit();
        
    }
}

module.exports = connectDB;