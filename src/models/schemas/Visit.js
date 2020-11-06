const mongoose = require("mongoose");

let visitSchema = mongoose.Schema({
  scanCode: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isExitScan: {
    type: Boolean,
    default: false,
    required: true
  },
  userGeneratedCode: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now(),
    required: true
  }
});

const Visit = module.exports = mongoose.model('Visit', visitSchema);
