/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const fs = require('fs');
const Sauce = require('../models/Sauce');

/**
 * @function getSauce
 * @description Return all the sauces in database.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 */
exports.getAllSauce = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * @function getOneSauce
 * @description Return one sauces in database with his ID.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 */
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
