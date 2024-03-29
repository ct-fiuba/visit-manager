module.exports = function visitsService(visitHandler) {
  const errorDB = (res, err) => {
    console.log(err.message);
    return res.status(500).json({ reason: 'DB Error' });
  };

  const registerVisit = async (req, res) => {
    return visitHandler.visitExists(req.body)
      .then(visit => {
        if (visit) {
          return res.status(409).json({ reason: 'Visit already registered' });
        }
        return visitHandler.spaceExists(req.body.spaceId)
          .then(space => {
            if (!space) {
              return res.status(404).json({ reason: 'Space linked to the space id not found' });
            }
            if (!space.enabled) {
              return res.status(404).json({ reason: 'Space linked to the space id is disabled' });
            }
            return visitHandler.addVisit(req.body)
              .then(visit => res.status(201).json({ _id: visit._id }))
              .catch(err => errorDB(res, err));
          })
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  const addExitTimestamp = async (req, res) => {
    return visitHandler.spaceExists(req.body.spaceId)
      .then(space => {
        if (!space) {
          return res.status(404).json({ reason: 'Space linked to the space id not found' });
        }
        if (!space.enabled) {
          return res.status(404).json({ reason: 'Space linked to the space id is disabled' });
        }
        return visitHandler.addExitTimestamp(req.body)
          .then(visit => res.status(201).json({ _id: visit._id, exitTimestamp: visit.exitTimestamp }))
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  return {
    registerVisit,
    addExitTimestamp
  };
};
