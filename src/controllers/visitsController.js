module.exports = function visitsController(visitHandler) {
  const visitRegistration = require('../services/visitRegistration');

  const errorDB = (res, err) => {
    console.log(err.message);
    return res.status(500).json({ reason: 'DB Error' });
  };

  const get = async (req, res, next) => {
    let filters = req.query;
    return visitHandler.findVisits(filters)
      .then(visits => res.status(200).json(visits))
      .catch(err => errorDB(res, err));
  };

  const add = async (req, res, next) => {
    return await visitRegistration(visitHandler).registerVisit(req, res);
  };

  return {
    add,
    get
  };
};
