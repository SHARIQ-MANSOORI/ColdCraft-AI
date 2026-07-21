const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); // add salt and hash password

const userSchema = new mongoose.Schema({  // user data schema

    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    username:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,

    },
    otpExpiry:{
        type:Date
    }

})


// when user signUp -- before saving info into db pass get hash
//Before saving a user to the database, run this function first.
// User.save()
//     │
//     ▼
// Wait!!
// Run pre('save')
//     │
//     ▼
// Now save the user
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return                               

    }                                               // Arrow functions (=>) don't have their own this, so you should not use them here.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);

        
});

// when user login -- now that password will get hash and compared with prev-hashed pass

userSchema.methods.comparePassword = async  function(candidatePassword){
    return await  bcrypt.compare(candidatePassword,this.password)
}

 
const User = mongoose.model('User',userSchema);
module.exports = User;