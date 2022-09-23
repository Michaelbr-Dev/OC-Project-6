/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const express = require('express');
const multer = require('multer');

const MINE_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  /**
   * @function destination
   * @description Set the pathfile for sauces images storage.
   *
   * @param {express.Request} req      - Request object.
   * @param {object}          file     - Filedata request.
   * @param {Function}        callback - Function to tell multer about the images storage location.
   */
  destination: (req, file, callback) => {
    callback(null, 'images');
  },

  /**
   * @function filename
   * @description Set the filename for sauces images.
   *
   * @param {express.Request} req      - Request object.
   * @param {object}          file     - Filedata request.
   * @param {Function}        callback - Function to tell multer about the image name.
   */
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MINE_TYPES[file.mimetype];
    callback(null, `${name}${Date.now()}.${extension}`);
  },
});

module.exports = multer({ storage }).single('image');
