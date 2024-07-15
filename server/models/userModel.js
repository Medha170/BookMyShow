const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'partner'],
        default: 'user',
        required: true
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    }
}, {timestamps: true});

const User = mongoose.model('users', userSchema);

module.exports = User;