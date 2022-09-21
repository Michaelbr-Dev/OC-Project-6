/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Database connection
mongoose
  .connect(
    'mongodb+srv://OC-P6:tZASAmtoXIdkKPD1@cluster0.wvucmfo.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

module.exports = app;
