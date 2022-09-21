/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const bcrypt = require('bcrypt'); // Need to hash password
const jwt = require('jsonwebtoken'); // Need to manage session token
const User = require('../models/User');

/**
 * @function signup
 * @description Creating a new user.
 *
 * @param {express.Request}  req               - Request object.
 * @param {object}           req.body          - Request body.
 * @param {string}           req.body.email    - Email of the new user.
 * @param {string}           req.body.password - Password of the new user.
 *
 * @param {express.Response} res               - Response object.
 */
exports.signup = (req, res) => {
  bcrypt
    .hash(req.body.password, 15)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

/**
 * @function login
 * @description The code is checking if the user exists in the database
 * and if the password is correct. If the user exists and the password is correct, it returns the
 * userId and a token.
 *
 * @param {express.Request}  req               - Request object.
 * @param {object}           req.body          - Request body.
 * @param {string}           req.body.email    - Email of the user.
 * @param {string}           req.body.password - Password of the user.
 *
 * @param {express.Response} res               - Response object.
 */
exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).catch((error) =>
    res.status(500).json({ error }),
  );
  if (!user) {
    return res.status(401).json({ message: 'Login/Mot de passe incorrecte' });
  }
  const valid = await bcrypt
    .compare(req.body.password, user.password)
    .catch((error) => res.status(500).json({ error }));
  if (!valid) {
    return res.status(401).json({ message: 'Login/Mot de passe incorrecte' });
  }
  /* eslint-disable no-underscore-dangle */
  return res.status(200).json({
    userId: user._id,
    token: jwt.sign({ userId: user._id }, process.env.SEC_TOK, { expiresIn: '24h' }),
  });
  /* eslint-enable no-underscore-dangle */
};
