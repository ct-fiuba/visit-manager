const mongoose = require("mongoose");

let spaceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  m2: {
    type: Number,
    required: true
  },
  estimatedVisitDuration: {
    type: Number,
    required: false
  },
  hasExit: {
    type: Boolean,
    required: true
  },
  openPlace: {
    type: Boolean,
    required: true
  },
  establishmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  n95Mandatory: {
    type: Boolean,
    default: false,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true
  }
});

const Space = module.exports = mongoose.model('Space', spaceSchema);
