const Establishment = require('../schemas/Establishment');
const mongoose = require('mongoose');
const SpaceHandler = require('./SpaceHandler');

const { getQRInfo } = require('../../utils/qr');

module.exports = function EstablishmentHandler() {
  const findEstablishments = async (query) => {
    return Establishment.find(query);
  };

  const findEstablishmentsByOwner = async (ownerId) => {
    return Establishment.find({ ownerId: ownerId });
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
      address: content.address,
      city: content.city,
      state: content.state,
      zip: content.zip,
      country: content.country,
      ownerId: content.ownerId
    };

    let SpaceIds = [];

    for (const _space of content.spaces) {
      let current_space = {
        _id: new mongoose.Types.ObjectId(),
        name: _space.name,
        m2: _space.m2,
        estimatedVisitDuration: _space.estimatedVisitDuration,
        hasExit: _space.hasExit,
        openSpace: _space.openSpace,
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

  const addSingleSpaceToEstablishment = async (content) => {
    let establishment = await Establishment.findOne({ _id: content.establishmentId });

    let space = {
      _id: new mongoose.Types.ObjectId(),
      name: content.name,
      m2: content.m2,
      estimatedVisitDuration: content.estimatedVisitDuration,
      hasExit: content.hasExit,
      openSpace: content.openSpace,
      establishmentId: content.establishmentId,
      n95Mandatory: content.n95Mandatory
    };

    establishment['spaces'].push(space._id);
    establishment.save();
    return await SpaceHandler().addSpace(space);
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
        PDFInfo.push(getQRInfo(establishment.name, current_space.name, space_id, true, false, current_space.estimatedVisitDuration));
        PDFInfo.push(getQRInfo(establishment.name, current_space.name, space_id, true, true, current_space.estimatedVisitDuration));
      } else {
        PDFInfo.push(getQRInfo(establishment.name, current_space.name, space_id, false, false, current_space.estimatedVisitDuration));
      }
    }
    let PDFData = { filename: `CT_QR_${establishment.name}.pdf`, PDFInfo };
    return PDFData;
  };

  const getPDFDataForSingleSpace = async (establishment_name, space_id) => {
    let PDFInfo = [];
    let current_space = await SpaceHandler().findSpace(space_id);
    if (current_space.hasExit) {
      PDFInfo.push(getQRInfo(establishment_name, current_space.name, space_id, true, false, current_space.estimatedVisitDuration));
      PDFInfo.push(getQRInfo(establishment_name, current_space.name, space_id, true, true, current_space.estimatedVisitDuration));
    } else {
      PDFInfo.push(getQRInfo(establishment_name, current_space.name, space_id, false, false, current_space.estimatedVisitDuration));
    }
    let PDFData = { filename: `CT_QR_${establishment_name}_${current_space.name}.pdf`, PDFInfo };
    return PDFData;
  };


  return {
    findEstablishments,
    findEstablishmentsByOwner,
    findEstablishment,
    establishmentExists,
    addEstablishment,
    addSingleSpaceToEstablishment,
    updateEstablishment,
    deleteEstablishment,
    getPDFData,
    getPDFDataForSingleSpace
  };
};
