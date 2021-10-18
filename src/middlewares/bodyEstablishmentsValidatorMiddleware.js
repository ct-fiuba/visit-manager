const { body , validationResult } = require('express-validator');

module.exports = function bodyEstablishmentsValidatorMiddleware() {
  const addValidations = [
    body(['type', 'name', 'address', 'city', 'state', 'zip', 'country', 'spaces'], 'Missing value').exists(),
    body(['spaces']).not().isEmpty()
  ];
  const updateValidations = [
    body(['_id'], 'Missing value').exists()
  ];
  const addSingleSpaceValidations = [
    body(['name', 'm2', 'estimatedVisitDuration', 'hasExit', 'openSpace', 'establishmentId'], 'Missing value').exists(),
  ];
  const updateSpaceValidations = [
    body(['establishmentId'], 'Missing value').exists(),
  ];

  const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let firstError = errors.array()[0];
      return res.status(400).json({ reason: firstError });
    }

    next();
  }

  return {
    addValidations,
    updateValidations,
    addSingleSpaceValidations,
    updateSpaceValidations,
    validate
  };
};
