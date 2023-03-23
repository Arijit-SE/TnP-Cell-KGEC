const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = mongoose.Schema({
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
    stream: {
        type: String,
        // enum: ['BTech', 'MTech', 'MCA'],
        validate: function () {
            const allowedStream = ['BTech', 'MTech', 'MCA'];
            if (allowedStream.includes(this.stream) || this.stream === null) {
                return true;
            } else {
                return false;
            }
        },
        default: null
    },
    specialization: {
        type: String,
        // enum: ['CSE', 'IT', 'ECE', 'EE', 'ME', 'PE', 'CA'],
        validate: function () {
            const allowedSpecialization = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'PE', 'CA'];
            if (allowedSpecialization.includes(this.specialization) || this.specialization === null) {
                return true;
            } else {
                return false;
            }
        },
        default: null
    },
    passoutYear: {
        type: String,
        match: /^\d{4}$/,
        default: null
    },
    currentPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    secondaryPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    higherSecondaryPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    graduationPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    activeBacklogs: {
        type: Number,
        match: /\d/,
        default: null
    },
    educationGap: {
        type: Number,
        match: /\d/,
        default: null
    }
});

studentSchema.pre("save", async function (next) {
    this.name = this.name ? this.name : null;
    this.address = this.address ? this.address : null;
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("student", studentSchema);