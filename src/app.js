const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./static/swagger.json');
const establishmentsRouter = require('./routes/establishmentsRouter');

const config = {
  delta: parseInt(process.env.ENTRY_DELTA),
  defaultDaysSince: parseInt(process.env.DEFAULT_DAYS_SINCE)
}

module.exports = function app() {
  const app = express();
  app.use(cors());

  app.disable('x-powered-by');
  app.use(bodyParser.json());
  app.use(establishmentsRouter());
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  return app;
};
