const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactPersonName: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true,
        enum: ['IT & Software', 'Engineering,Construction', 'Electronics,Electrical equipment', 'Industrial Machinery', 'Chemical', 'Others']
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
    website: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
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
    },
    supportingDocumentFileId: {
        type: String,
        required: true
    },
});

companySchema.pre("save", async function (next) {
    this.name = this.name ? this.name : null;
    this.contactPersonName = this.contactPersonName ? this.contactPersonName : null;
    this.website = this.website ? this.website : null;
    this.address = this.address ? this.address : null;
    this.email = this.email.toLowerCase()
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('Company', companySchema);