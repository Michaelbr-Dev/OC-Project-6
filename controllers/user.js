/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const bcrypt = require('bcrypt'); // Need to hash password
const jwt = require('jsonwebtoken'); // Need to manage session token
const validator = require('validator');
const User = require('../models/User');

/**
 * @function signup
 * @description Creating a new user.
 *
 * @param {Express.Request}  req               - Request object.
 * @param {object}           req.body          - Request body.
 * @param {string}           req.body.email    - Email of the new user.
 * @param {string}           req.body.password - Password of the new user.
 *
 * @param {Express.Response} res               - Response object.
 */
exports.signup = async (req, res) => {
  if (
    !validator.isStrongPassword(req.body.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res.status(400).json({
      message:
        'Mot de passe requis : 8 caractères minimum, au moins 1 Majuscule, 1 minuscule, 1 caractère spécial, sans espace.',
    });
  }

  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ message: 'Adresse email invalide' });
  }

  const userEmail = await User.findOne({ email: req.body.email });
  if (userEmail) {
    return res.status(409).json({ message: "L'adresse email est déjà utilisée" });
  }

  const hash = await bcrypt.hash(req.body.password, 15);
  const user = new User({
    email: req.body.email,
    password: hash,
  });

  await user.save().catch((error) => res.status(500).json({ error }));
  return res.status(201).json({ message: 'Utilisateur créé !' });
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
