const express = require('express');
const bodyValidator = require('../middlewares/bodyValidatorMiddleware')();

const establishmentHandler = require('../models/handlers/EstablishmentHandler');
const establishmentsController = require('../controllers/establishmentsController')(establishmentHandler());

module.exports = function establishmentsRouter() {
  return express.Router().use(
    '/establishments',
    express.Router()
      .get('/', establishmentsController.get)
      .post('/', bodyValidator.addValidations, bodyValidator.validate, establishmentsController.add)
      .get('/:establishmentId', establishmentsController.getSingleEstablishment)
      .put('/:establishmentId', bodyValidator.updateValidations, bodyValidator.validate, establishmentsController.update)
      .delete('/:establishmentId', establishmentsController.remove)
  );
};
