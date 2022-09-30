/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const inputValidator = require('../middleware/inputs-validation');

const router = express.Router();

const sauceCtrl = require('../controllers/sauces');

router.get('/', auth, sauceCtrl.getAllSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, inputValidator.sauceValidation, sauceCtrl.createSauce);
router.put('/:id', auth, multer, inputValidator.sauceValidation, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeDislike);

module.exports = router;
