/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 *
 * @module Middleware/Auth
 */

const jwt = require('jsonwebtoken');
const express = require('express');

/**
 * @function auth
 * @description It checks if the user is authenticated by checking if the token is valid.
 *
 * @param   {express.Request}  req                       - The request object.
 * @param   {object}           req.headers               - Headers.
 * @param   {object}           req.headers.authorization - Get the bearer token in header.
 *
 * @param   {express.Response} res                       - The response object.
 *
 * @param   {express.Next}     next                      - A function that we call when we're done with our middleware.
 *
 * @returns {undefined}
 */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.SEC_TOK);
    const { userId } = decodedToken;
    req.auth = { userId };
    return next();
  } catch (error) {
    return res.status(401).json({ error });
  }
};

module.exports = auth;
