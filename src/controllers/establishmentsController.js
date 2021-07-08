module.exports = function establishmentsController(establishmentHandler, spaceHandler) {
  const PDFGenerator = require('../services/PDFGenerator');

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

  const getEstablishmentsByOwner = async (req, res, next) => {
    let response = [];
    let establishments = await establishmentHandler.findEstablishmentsByOwner(req.params.ownerId);
    if (!establishments) {
      return res.status(404).json({ reason: 'Owner not found' });
    }
    for (let establishment of establishments) {
      let current_establishment = JSON.parse(JSON.stringify(establishment));
      current_establishment['spacesInfo'] = await spaceHandler.findSpaces({
        '_id': { $in: establishment.spaces }
      })
      response.push(current_establishment);
    }
    return res.status(200).json(response);
  };

  const getSingleEstablishment = async (req, res, next) => {
    return establishmentHandler.findEstablishment(req.params.establishmentId)
      .then(establishment => {
        if (!establishment) return res.status(404).json({ reason: 'Establishment not found' });
        return spaceHandler.findSpaces({
          '_id': { $in: establishment.spaces }
        }).then(docs => {
          let extendedEstablishment = JSON.parse(JSON.stringify(establishment));
          extendedEstablishment["spacesInfo"] = docs;
          res.status(200).json(extendedEstablishment);
        }).catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  const getEstablishmentPDF = async (req, res, next) => {
    establishmentId = req.params.establishmentId;
    try {
      let PDFData = await establishmentHandler.getPDFData(establishmentId);
      if (!PDFData || !PDFData.PDFInfo) {
        return res.status(404).json({ reason: 'Establishment not found' });
      }
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${PDFData.filename}`
      });
      return await PDFGenerator().generatePDF(res, PDFData.PDFInfo);
    } catch (err) {
      errorDB(res, err);
    }
  };

  const getSingleSpacePDF = async (req, res, next) => {
    spaceId = req.params.spaceId;
    establishmentId = req.params.establishmentId;
    return establishmentHandler.findEstablishment(establishmentId)
      .then(async (establishment) => {
        if (!establishment) {
          return res.status(404).json({ reason: 'Establishment does not exist' });
        }
        if (!establishment.spaces.includes(spaceId)) {
          return res.status(404).json({ reason: 'Establishment is not the owner of the given space id' });
        }
        let PDFData = await establishmentHandler.getPDFDataForSingleSpace(establishment.name, spaceId);
        if (!PDFData || !PDFData.PDFInfo) {
          return res.status(404).json({ reason: 'Space not found' });
        }
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=${PDFData.filename}`
        });
        return await PDFGenerator().generatePDF(res, PDFData.PDFInfo);
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
          .then(establishment => res.status(201).json({ _id: establishment._id, spaces: establishment.spaces }))
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
  };

  const addSingleSpace = async (req, res, next) => {
    return establishmentHandler.findEstablishment(req.body.establishmentId)
      .then(establishment => {
        if (!establishment) {
          return res.status(409).json({ reason: 'Establishment does not exist' });
        }
        return establishmentHandler.addSingleSpaceToEstablishment(req.body)
          .then(space => res.status(201).json(space))
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
    } catch (err) {
      errorDB(res, err);
    }
  };

  const updateSpace = async (req, res, next) => {
    spaceId = req.params.spaceId;
    establishmentId = req.body.establishmentId;
    return establishmentHandler.findEstablishment(req.body.establishmentId)
      .then(establishment => {
        if (!establishment) {
          return res.status(404).json({ reason: 'Establishment does not exist' });
        }
        if (!establishment.spaces.includes(spaceId)) {
          return res.status(404).json({ reason: 'Establishment is not the owner of the given space id' });
        }
        return spaceHandler.updateSpace(spaceId, req.body)
          .then(space => res.status(201).json(space))
          .catch(err => errorDB(res, err));
      })
      .catch(err => errorDB(res, err));
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
    addSingleSpace,
    get,
    getEstablishmentsByOwner,
    getSingleEstablishment,
    update,
    updateSpace,
    remove,
    getEstablishmentPDF,
    getSingleSpacePDF
  };
};
