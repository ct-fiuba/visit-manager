const Visit = require('../schemas/Visit');
const mongoose = require('mongoose');
const SpaceHandler = require('./SpaceHandler');

module.exports = function VisitHandler() {
  const findVisits = async (query) => {
    return Visit.find(query);
  };

  const visitExists = async (content) => {
    return Visit.findOne({ userGeneratedCode: content.userGeneratedCode });
  };

  const spaceExists = async (scanCode) => {
    let spaceId = scanCode;
    if (scanCode.substr(scanCode.length - 5) === '_exit') {
      spaceId = scanCode.substr(0, scanCode.length - 5);
    }
    return SpaceHandler().spaceExists(spaceId);
  };

  const addVisit = async (content) => {
    let scanCode = content.scanCode;
    let isExitScan = false;
    if (scanCode.substr(scanCode.length - 5) === '_exit') {
      scanCode = scanCode.substr(0, scanCode.length - 5);
      isExitScan = true;
    }
    let visitData = {
      _id: new mongoose.Types.ObjectId(),
      scanCode,
      isExitScan,
      userGeneratedCode: content.userGeneratedCode,
      timestamp: content.timestamp,
      vaccinated: content.vaccinated,
      vaccineReceived: content.vaccineReceived,
      vaccinatedDate: content.vaccinatedDate,
      covidRecovered: content.covidRecovered,
      covidRecoveredDate: content.covidRecoveredDate
    };

    let newVisit = new Visit(visitData);
    return newVisit.save();
  };

  return {
    findVisits,
    visitExists,
    spaceExists,
    addVisit
  };
};
