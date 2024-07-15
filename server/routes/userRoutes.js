const express = require('express');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../middlewares/authmiddleware');
const EmailHelper = require('../utils/emailSender');

const router = express.Router();
require('dotenv').config();


// Function for otp generation
const otpGenerator = function () {
    return Math.floor((Math.random() * 10000) + 90000);
}

// Route for user registration
router.post('/register', async (req, res) => {
    try {
        const userExists = await User.findOne({email : req.body.email});
        if (userExists) {
            res.send({
                success: false,
                message: 'User already exists'
            });
        }
        const salt = await bcrypt.genSalt(10);
        console.log(salt);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(hashedPassword);
        req.body.password = hashedPassword;


        const newUser = await User(req.body);
        await newUser.save();

        res.send({
            success: true,
            message: "You've sucessfully registered, please login now."
        });
    }
    catch (err) {
        console.log(err);
    }
});

// Route for user login

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            res.send({
                success: false,
                message: 'User does not exist Please Register'
            });
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPassword) {
            res.send({
                success: false,
                message: 'Invalid Password'
            });
        }

        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY_JWT, {expiresIn: '1d'});

        res.send({
            success: true,
            message: "You've sucessfully logged in",
            token: token
        });
    }
    catch (err) {
        console.log(err);
    }
});

// Router-level-middleware for user profile
router.get('/get-current-user', authmiddleware, async (req, res) => {
    const user = await User.findById(req.body.userId).select("-password");

    res.send({
        success: true,
        message: "You are authorized to go to the protected route",
        data: user
    })
});

// Route for forgot password
router.patch('/forgetpassword', async function (req, res) {
    try {
        if (req.body.email == undefined) {
            return res.status(401).json({
                status: "failure",
                message: "Please enter the email for forget password"
            })
        }
        // find the user -> going db -> getting it for the server
        let user = await User.findOne({email: req.body.email});
        if (user == null) {
            return res.status(404).json({
                status: "failure",
                message: "User not found"
            })
        }
        // got the user -> on your server
        const otp = otpGenerator();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        // those updates will be send to the db
        await user.save();
        res.status(200).json({
            status: "success",
            message: "otp sent to your email",
        });

        // send the mail to there email -> otp
        await EmailHelper(
            "otp.html", user.email,
            {
                name: user.name,
                otp: otp
            }
        );
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
})

// Route for reset password
router.patch('/resetpassword', async function(req, res) {
    try {
        let resetDetails = req.body;
        // required fields are there or not
        if (!resetDetails.password == true || !resetDetails.otp == true || !resetDetails.email == true) {
            return res.status(401).json({
                status: "failure",
                message: "Invalid request"
            })
        }
        // find the user
        const user = await User.findOne({otp : req.body.otp });
        if (user == null) {
            return res.status(404).json({
              status: "failure",
              message: "user not found"
            })
        }
        // if otp is expired
        if (Date.now() > user.otpExpiry) {
            return res.status(401).json({
            status: "failure",
            message: "otp expired"
        })
        }

        // if otp is correct
        const salt = await bcrypt.genSalt(10);
        const hashPwd = bcrypt.hashSync(req.body.password, salt);
        user.password = hashPwd;
        // remove the otp from the user
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({
        status: "success",
        message: "password reset successfully"
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
})

module.exports = router;
