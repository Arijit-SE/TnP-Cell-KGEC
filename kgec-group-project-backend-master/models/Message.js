const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    time: {
        type: Date,
        required: true,
        default: Date.now()
    },
    message: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Message', messageSchema);