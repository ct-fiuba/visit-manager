const mongoose = require("mongoose");

let qrSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  m2: {
    type: Number,
    required: true
  },
  exitQR: {
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

const QR = module.exports = mongoose.model('QR', qrSchema);
