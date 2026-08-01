const mongoose = require('mongoose');
const User = require('./User');

const emailHistorySchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    prompt:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    emailBody:{
        type:String,
        required:true
    },
    linkedInDM:{
        type:String,
        required:true
    },
    followUpEmail:{
        type:String,
        required:true
    },
    tone:{
        type:String,
        default:'Professional'
    },
    length:{
        type:String,
        default:'Medium'
    }
} , {timestamps:true});

const EmailHistory = mongoose.model('EmailHistory', emailHistorySchema);
module.exports = EmailHistory;