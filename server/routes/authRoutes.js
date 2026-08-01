const express = require('express');
const router = express.Router();  // make help in router
const authController = require('../controller/authController') // import file where auth related logic works

router.post('/register',authController.register)  // /register--->authController.js---->register function click

router.post('/login',authController.login); // /login----->authController.js---->login function click

router.post('/verify-otp',authController.verifyOTP); // /verify-otp------->authcontroller.js------>verify-opt function click

module.exports = router;  // export whole module


