const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["Female", "Male"]
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /\d{10}/
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    isRejected: {
        type: Boolean,
        required: true,
        default: false
    }
});

adminSchema.pre("save", async function (next) {
    this.name = this.name ? this.name : null;
    this.address = this.address ? this.address : null;
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("admin", adminSchema);