const mongoose = require('mongoose');
const Company = require('./Company');

const jobSchema = mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Company,
    required: true,
    validate: async function () {
      if (await Company.findById(this.companyId) !== null) {
        return true;
      } else {
        return false;
      }
    }
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  eligibleGenders: {
    type: Array,
    required: true
  },
  eligiblePassoutYear: {
    type: String,
    match: /^\d{4}$/,
    required: true
  },
  eligibleDepartments: {
    type: Array,
    required: true
  },
  eligibleSpecializations: {
    type: Array,
    required: true
  },
  minimumCurrentPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  maximumActiveBacklogs: {
    type: Number,
    min: 0,
    required: true
  },
  minimumSecondaryPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  minimumHigherSecondaryPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  minimumGraduationPercentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  maximumEducationGap: {
    type: Number,
    min: 0,
    required: true
  },
  isHistoric: {
    type: Boolean,
    required: true,
    default: false
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

jobSchema.pre('save', async function (next) {
  this.description = this.description !== '' ? this.description : null;
  if (this.eligibleGenders.length === 0) {
    throw Error();
  }
  if (this.eligibleDepartments.length === 0) {
    throw Error();
  }
  if (this.eligibleSpecializations.length === 0) {
    throw Error();
  }
  // this.notEligibleIfPlacedOn = this.notEligibleIfPlacedOn.length !== 0 ? this.notEligibleIfPlacedOn : null;
  // this.externalApplyLink = this.externalApplyLink !== '' ? this.externalApplyLink : null;
  next();
})

module.exports = mongoose.model('Job', jobSchema);
