const Establishment = require('../schemas/Establishment');

module.exports = function EstablishmentHandler() {
  const findEstablishments = async (query) => {
    return Establishment.find(query);
  };

  const findEstablishment = async (establishmentId) => {
    return Establishment.findOne({ id: establishmentId });
  };

  const establishmentExists = async (content) => {
    return Establishment.findOne({ id: content.id });
  };

  const addEstablishment = async (content) => {
    let newEstablishment = new Establishment(content);
    return newEstablishment.save();
  };

  const updateEstablishment = async (establishmentId, content) => {
    let modifiedEstablishment = Establishment.updateOne({ id: establishmentId }, content);
    return modifiedEstablishment;
  };

  const deleteEstablishment = async (establishmentId) => {
    return Establishment.deleteOne({ id: establishmentId });
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
