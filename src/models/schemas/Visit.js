const mongoose = require("mongoose");

let visitSchema = mongoose.Schema({
  scanCode: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userGeneratedCode: {
    type: String,
    required: true,
    unique: true
  },
  entranceTimestamp: {
    type: Date,
    default: Date.now(),
    required: true
  },
  exitTimestamp: {
    type: Date,
    required: false
  },
  vaccinated: {
    type: Number,
    default: 0,
    required: true
  },
  vaccineReceived: {
    type: String,
    required: false
  },
  vaccinatedDate: {
    type: Date,
    required: false
  },
  covidRecovered: {
    type: Boolean,
    default: false,
    required: true
  },
  covidRecoveredDate: {
    type: Date,
    required: false
  }
});

const Visit = module.exports = mongoose.model('Visit', visitSchema);
