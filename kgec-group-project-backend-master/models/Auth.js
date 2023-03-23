const mongoose = require('mongoose');

const authSchema = mongoose.Schema({
    email: {
        type: String,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        required: true,
        unique: true
    },
    otp: {
        type: Number,
        match: /\d{6}/,
        required: true
    }
});

module.exports = mongoose.model('Auth', authSchema);