const Visit = require('../schemas/Visit');
const Space = require('../schemas/Space');
const mongoose = require('mongoose');
const SpaceHandler = require('./SpaceHandler');

module.exports = function VisitHandler() {
  const findVisits = async (query) => {
    return Visit.find(query);
  };

  const visitExists = async (content) => {
    return Visit.findOne({ userGeneratedCode: content.userGeneratedCode });
  };

  const spaceExists = async (spaceId) => {
    if (spaceId.substr(spaceId.length - 5) === '_exit') {
      spaceId = spaceId.substr(0, spaceId.length - 5);
    }
    return SpaceHandler().spaceExists(spaceId);
  };

  const addVisit = async (content) => {
    let spaceId = content.spaceId;
    let visitData = {
      _id: new mongoose.Types.ObjectId(),
      spaceId,
      userGeneratedCode: content.userGeneratedCode,
      entranceTimestamp: content.entranceTimestamp,
      vaccinated: content.vaccinated,
      vaccineReceived: content.vaccineReceived,
      vaccinatedDate: content.vaccinatedDate,
      covidRecovered: content.covidRecovered,
      covidRecoveredDate: content.covidRecoveredDate
    };

    let newVisit = new Visit(visitData);
    return newVisit.save();
  };

  const addExitTimestamp = async (content) => {
    let visit = await Visit.findOne({ userGeneratedCode: content.userGeneratedCode });
    if (visit) {
      // visit exists, happy path
      return await Visit.updateOne({ _id: visit._id }, { exitTimestamp: content.exitTimestamp });
    } else {
      // entrance scan not found
      let space = await Space.findOne({ _id: content.spaceId });
      let entranceTimestamp = new Date(content.exitTimestamp);
      entranceTimestamp.setMinutes(entranceTimestamp.getMinutes() - space.estimatedVisitDuration);
      let visitData = {
        _id: new mongoose.Types.ObjectId(),
        spaceId: content.spaceId,
        userGeneratedCode: content.userGeneratedCode,
        entranceTimestamp,
        exitTimestamp: content.exitTimestamp,
        vaccinated: content.vaccinated,
        vaccineReceived: content.vaccineReceived,
        vaccinatedDate: content.vaccinatedDate,
        covidRecovered: content.covidRecovered,
        covidRecoveredDate: content.covidRecoveredDate
      };
      let newVisit = new Visit(visitData);
      return newVisit.save();
    }
  };

  return {
    findVisits,
    visitExists,
    spaceExists,
    addVisit,
    addExitTimestamp
  };
};
