const Establishment = require('../schemas/Establishment');

module.exports = function EstablishmentHandler() {
  const findEstablishments = async (query) => {
    return Establishment.find(query, '-_id -__v');
  };

  const findEstablishment = async (establishmentId) => {
    return Establishment.findOne({ id: establishmentId }, '-_id -__v');
  };

  const establishmentExists = async (content) => {
    return Establishment.findOne({ url: content.url });
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
    findEstablishment,
    findEstablishment,
    establishmentExists,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment
  };
};
