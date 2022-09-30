/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');

const userRoutes = require('./routes/User');
const sauceRoutes = require('./routes/Sauces');

/**
 * @description It's loading the environment variables from the .env file.
 */
require('dotenv').config();

/**
 * @description Mongoose connection using .env file to mask password.
 */
mongoose
  .connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  /* eslint-disable no-console */
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
/* eslint-enable no-console */
const app = express();

/**
 * @description Middleware Header to bypass errors by unblocking certain CORS security systems,
 *              so that everyone can make requests from their browser.
 */
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
