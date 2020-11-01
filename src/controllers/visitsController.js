module.exports = function visitsController(visitHandler) {
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
    return visitHandler.visitExists(req.body)
      .then(visit => {
        if (visit) {
          return res.status(409).json({ reason: 'Visit already registered' });
        }
        return visitHandler.spaceExists(req.body.scanCode)
          .then(space => {
            if (!space) {
              return res.status(404).json({ reason: 'Space linked to the scan code not found' });
            }
            return visitHandler.addVisit(req.body)
              .then(visit => res.status(201).json({ _id: visit._id }))
              .catch(err => errorDB(res, err));
          })
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  return {
    add,
    get
  };
};
