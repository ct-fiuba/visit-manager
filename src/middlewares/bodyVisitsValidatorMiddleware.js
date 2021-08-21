const { body , validationResult } = require('express-validator');

module.exports = function bodyVisitsValidatorMiddleware() {
  const addValidations = [
    body(['userGeneratedCode', 'scanCode', 'entranceTimestamp'], 'Missing value').exists(),
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
    validate
  };
};
