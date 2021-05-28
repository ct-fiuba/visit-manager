const mongoose = require("mongoose");

let establishmentSchema = mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
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
  state: {
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
  ownerId: {
    type: String,
    required: false
  },
  spaces: [mongoose.Schema.Types.ObjectId]
});

const Establishment = module.exports = mongoose.model('Establishment', establishmentSchema);
