module.exports = function establishmentsController(establishmentHandler) {
  const errorDB = (res, err) => {
    console.log(err.message);
    return res.status(500).json({ reason: 'DB Error' });
  };

  const get = async (req, res, next) => {
    let filters = req.query;
    return establishmentHandler.findEstablishments(filters)
      .then(establishments => res.status(200).json(establishments))
      .catch(err => errorDB(res, err));
  };

  const getSingleEstablishment = async (req, res, next) => {
    return establishmentHandler.findEstablishment(req.params.establishmentId)
      .then(establishment => {
        if (!establishment) return res.status(404).json({ reason: 'Establishment not found' });
        return res.status(200).json(establishment);
      })
      .catch(err => errorDB(res, err));
  };

  const add = async (req, res, next) => {
    return establishmentHandler.establishmentExists(req.body)
      .then(establishment => {
        if (establishment) {
          return res.status(409).json({ reason: 'Establishment already registered' });
        }
       return establishmentHandler.addEstablishment(req.body)
          .then(establishment => res.status(201).json({ _id: establishment._id }))
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  const update = async (req, res, next) => {
    establishmentId = req.params.establishmentId;
    try {
      let count = await establishmentHandler.updateEstablishment(establishmentId, req.body);
      if (count.n === 0) {
        return res.status(404).json({ reason: 'Establishment not found' });
      }

      let establishment = await establishmentHandler.findEstablishment(establishmentId);
      return res.status(200).json(establishment);
    } catch(err) {
      errorDB(res, err);
    }
  };

  const remove = async (req, res, next) => {
    return establishmentHandler.deleteEstablishment(req.params.establishmentId)
      .then(info => {
        if (info.deletedCount === 0) return res.status(404).json({ reason: 'Establishment not found' });
        return res.status(204).json(info);
      })
      .catch(err => errorDB(res, err));
  };

  return {
    add,
    get,
    getSingleEstablishment,
    update,
    remove
  };
};
