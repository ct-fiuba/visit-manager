const express = require('express');
const bodyVisitsValidator = require('../middlewares/bodyVisitsValidatorMiddleware')();

const visitHandler = require('../models/handlers/VisitHandler');
const visitsController = require('../controllers/visitsController')(visitHandler());

module.exports = function visitsRouter() {
  return express.Router().use(
    '/visits',
    express.Router()
      .get('/', visitsController.get)
      .post('/', bodyVisitsValidator.addValidations, bodyVisitsValidator.validate, visitsController.add)
      .post('/addExitTimestamp', bodyVisitsValidator.addExitTimestampValidations, bodyVisitsValidator.validate, visitsController.addExitTimestamp)
  );
};
