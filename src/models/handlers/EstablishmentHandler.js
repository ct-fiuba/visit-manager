const Establishment = require('../schemas/Establishment');
const mongoose = require('mongoose');
const SpaceHandler = require('./SpaceHandler');

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

    let SpaceIds = [];

    for (const _space of content.spaces) {
      let current_space = {
        _id: new mongoose.Types.ObjectId(),
        name: _space.name,
        m2: _space.m2,
        estimatedVisitDuration: _space.estimatedVisitDuration,
        hasExit: _space.hasExit,
        openPlace: _space.openPlace,
        establishmentId: establishmentData._id,
        n95Mandatory: _space.n95Mandatory
      };
      SpaceIds.push(current_space._id);
      await SpaceHandler().addSpace(current_space);
    }
    establishmentData['spaces'] = SpaceIds;
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

  const getPDFData = async (establishmentId) => {
    let establishment = await Establishment.findOne({ _id: establishmentId });
    let PDFInfo = [];
    for (const space_id of establishment.spaces) {
      let current_space = await SpaceHandler().findSpace(space_id);
      if (current_space.hasExit) {
        PDFInfo.push({name: `${current_space.name} Entrada`, id: space_id.toString(), isExit: false});
        PDFInfo.push({name: `${current_space.name} Salida`, id: space_id.toString(), isExit: true});
      } else {
        PDFInfo.push({name: current_space.name, id: space_id.toString()});
      }
    }
    return PDFInfo;
  };


  return {
    findEstablishments,
    findEstablishment,
    establishmentExists,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment,
    getPDFData
  };
};
