const { body , validationResult } = require('express-validator');

module.exports = function bodyValidatorMiddleware() {
  const addValidations = [
    body(['type', 'name', 'email', 'address', 'city', 'province', 'zip', 'country', 'QRs'], 'Missing value').exists(),
    body(['QRs']).not().isEmpty()
  ];
  const updateValidations = [
    body(['id'], 'Invalid values').not().exists()
  ];

  const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let firstError = errors.array()[0];
      return res.status(400).json({ reason: firstError.msg });
    }

    next();
  }

  return {
    addValidations,
    updateValidations,
    validate
  };
};
