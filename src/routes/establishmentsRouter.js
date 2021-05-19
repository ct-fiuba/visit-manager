const express = require('express');
const bodyEstablishmentsValidator = require('../middlewares/bodyEstablishmentsValidatorMiddleware')();

const establishmentHandler = require('../models/handlers/EstablishmentHandler');
const spaceHandler = require('../models/handlers/SpaceHandler');
const establishmentsController = require('../controllers/establishmentsController')(establishmentHandler(), spaceHandler());

module.exports = function establishmentsRouter() {
  return express.Router().use(
    '/establishments',
    express.Router()
      .get('/', establishmentsController.get)
      .post('/', bodyEstablishmentsValidator.addValidations, bodyEstablishmentsValidator.validate, establishmentsController.add)
      .post('/space', bodyEstablishmentsValidator.addSingleSpaceValidations, bodyEstablishmentsValidator.validate, establishmentsController.addSingleSpace)
      .get('/:establishmentId', establishmentsController.getSingleEstablishment)
      .get('/PDF/:establishmentId', establishmentsController.getEstablishmentPDF)
      .get('/PDF/:establishmentId/space/:spaceId', establishmentsController.getSingleSpacePDF)
      .put('/:establishmentId', bodyEstablishmentsValidator.updateValidations, bodyEstablishmentsValidator.validate, establishmentsController.update)
      .put('/space/:spaceId', bodyEstablishmentsValidator.updateSpaceValidations, bodyEstablishmentsValidator.validate, establishmentsController.updateSpace)
      .delete('/:establishmentId', establishmentsController.remove)
  );
};
