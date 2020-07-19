const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

let establishmentSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  QRs: [String]
});
establishmentSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Establishment = module.exports = mongoose.model('Establishment', establishmentSchema);
