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
  }
});

const Space = module.exports = mongoose.model('Space', spaceSchema);
