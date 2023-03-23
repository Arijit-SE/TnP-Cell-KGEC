const mongoose = require('mongoose');
const Job = require('../models/Job');
const Student = require('../models/Student');

const applySchema = mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Job,
        required: true,
        validate: async function () {
            if (await Job.findById(this.jobId)) {
                return true;
            } else {
                return false;
            }
        }
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Student,
        required: true,
        validate: async function () {
            if (await Student.findById(this.studentId)) {
                return true;
            } else {
                return false;
            }
        }
    }
});

applySchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Apply', applySchema);