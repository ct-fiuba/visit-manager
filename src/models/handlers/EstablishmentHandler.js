const Establishment = require('../schemas/Establishment');
const mongoose = require('mongoose');
const QRHandler = require('./QRHandler');

module.exports = function EstablishmentHandler() {
  const findEstablishments = async (query) => {
    return Establishment.find(query);
  };

  const findEstablishment = async (establishmentId) => {
    return Establishment.findOne({ _id: establishmentId });
  };

  const establishmentExists = async (content) => {
    return Establishment.findOne({ _id: content.id });
  };

  const addEstablishment = async (content) => {
    let establishmentData = {
      _id: new mongoose.Types.ObjectId(),
      type: content.type,
      name: content.name,
      email: content.email,
      address: content.address,
      city: content.city,
      state: content.state,
      zip: content.zip,
      country: content.country
    };

    let QRIds = [];
    let QRs = [];

    for (const _qr of content.QRs) {
      let current_qr = {
        _id: new mongoose.Types.ObjectId(),
        name: _qr.name,
        m2: _qr.m2,
        exitQR: _qr.exitQR,
        openPlace: _qr.openPlace,
        establishmentId: establishmentData._id
      };
      QRIds.push(current_qr._id);
      QRs.push(current_qr);
    }
    establishmentData['QRs'] = QRIds;
    for (const _qr of QRs) {
      await QRHandler().addQR(_qr);
    }
    let newEstablishment = new Establishment(establishmentData);
    return newEstablishment.save();
  };

  const updateEstablishment = async (establishmentId, content) => {
    let modifiedEstablishment = Establishment.updateOne({ _id: establishmentId }, content);
    return modifiedEstablishment;
  };

  const deleteEstablishment = async (establishmentId) => {
    return Establishment.deleteOne({ _id: establishmentId });
  };

  return {
    findEstablishments,
    findEstablishment,
    establishmentExists,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment
  };
};
