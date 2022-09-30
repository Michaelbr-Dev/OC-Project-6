/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const express = require('express');
const userCtrl = require('../controllers/user');
const inputValidator = require('../middleware/inputs-validation');

const router = express.Router();

router.post('/signup', inputValidator.userValidation, userCtrl.signup);
router.post('/login', inputValidator.userValidation, userCtrl.login);

module.exports = router;
