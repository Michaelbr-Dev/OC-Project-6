/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 *
 * @module Middleware/Validator
 */

const validator = require('validator');

/**
 * @function validPassword
 * @description Checks if the password is strong enough.
 *
 * @param   {string}  password - Password from req.body.
 *
 * @returns {boolean}          - True if the password is strong enough.
 */
const validPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

/**
 * @function validMail
 * @description Checks if the email is valid.
 *
 * @param   {string}  email - Email to validate.
 *
 * @returns {boolean}       - True if the email is valid.
 */
const validMail = (email) => {
  return validator.isEmail(email);
};

/**
 * @function validSauceName
 * @description Checks if the sauce name is in valid form.
 *
 * @param   {string}  name - Sauce name to validate.
 *
 * @returns {boolean}      - True if the sauce name is in valid form.
 */
const validSauceName = (name) => {
  const regexInput = /^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ' -]{2,}$/i;
  return regexInput.test(name);
};

/**
 * @function validSauceManufacturer
 * @description Checks if the sauce manufacturer is in valid form.
 *
 * @param   {string}  manufacturer - Sauce manufacturer to validate.
 *
 * @returns {boolean}              - True if the sauce manufacturer is in valid form.
 */
const validSauceManufacturer = (manufacturer) => {
  const regexInput = /^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ' -]{2,}$/i;
  return regexInput.test(manufacturer);
};

/**
 * @function validSauceDescription
 * @description Checks if the sauce description is in valid form.
 *
 * @param   {string}  description - Sauce description to validate.
 *
 * @returns {boolean}             - True if the sauce description is in valid form.
 */
const validSauceDescription = (description) => {
  const regexInput = /^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ:@#!?' -]{2,}$/i;
  return regexInput.test(description);
};

/**
 * @function validSauceMainPepper
 * @description Checks if the sauce main pepper is in valid form.
 *
 * @param   {string}  mainPepper - Express request object.
 *
 * @returns {boolean}            - True if the sauce main pepper is in valid form.
 */
const validSauceMainPepper = (mainPepper) => {
  const regexInput = /^[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ' -]{2,}$/i;
  return regexInput.test(mainPepper);
};

/**
 * @function validSauceImgExtension
 * @description Checking the image extension.
 *
 * @param   {string}  filename - Filename extension to validate.
 *
 * @returns {boolean}          - True if the extension is valid.
 */
const validSauceImgExtension = (filename) => {
  const regexImg = /\.(jpe?g|png)$/i;
  return regexImg.test(filename);
};

/**
 * @function validSauceHeat
 * @description Checking the image extension.
 *
 * @param   {number}  heat - Heat number to validate.
 *
 * @returns {boolean}      - True if the number is in range.
 */
const validSauceHeat = (heat) => {
  return typeof heat === 'number' && heat >= 1 && heat <= 10;
};

/**
 * @function userValidation
 * @description Validate all user informations.
 *
 * @param   {object}   req               - Express request object.
 * @param   {object}   req.body          - Request Object.
 * @param   {object}   req.body.password - Password.
 *
 * @param   {object}   res               - Express response object.
 *
 * @param   {Function} next              - Express next function.
 *
 * @returns {boolean}                    - True if the user informations are valid.
 */
exports.userValidation = (req, res, next) => {
  if (!validPassword(req.body.password)) {
    return res.status(400).json({
      message:
        'Password required: 8 characters minimum, at least 1 uppercase, 1 lowercase, 1 special character, no spaces.',
    });
  }
  if (!validMail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  return next();
};

/**
 * @function sauceValidation
 * @description Validating the sauce data that is being sent to the server.
 *
 * @param   {object}    req            - Express request object.
 * @param   {object}    req.body       - Request body object.
 * @param   {object}    req.body.sauce - Request sauce object.
 * @param   {object}    req.file       - Request file object.
 *
 * @param   {object}    res            - Express response object.
 *
 * @param   {Function}  next           - Express next function.
 *
 * @returns {undefined}
 */
exports.sauceValidation = (req, res, next) => {
  const sauce = req.file ? JSON.parse(req.body.sauce) : req.body;
  if (!validSauceName(sauce.name)) {
    return res.status(400).json({ message: 'Invalid sauce name' });
  }
  if (!validSauceManufacturer(sauce.manufacturer)) {
    return res.status(400).json({ message: 'Invalid sauce manufacturer' });
  }
  if (!validSauceDescription(sauce.description)) {
    return res.status(400).json({ message: 'Invalid sauce description' });
  }
  if (!validSauceMainPepper(sauce.mainPepper)) {
    return res.status(400).json({ message: 'Invalid sauce main pepper' });
  }
  if (req.file && !validSauceImgExtension(req.file.filename)) {
    return res.status(400).json({ message: 'Invalid sauce image extension' });
  }
  if (!validSauceHeat(sauce.heat)) {
    return res.status(400).json({ message: 'Invalid sauce heat' });
  }
  return next();
};
