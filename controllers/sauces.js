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

// TODO: Write function Docs
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  // eslint-disable-next-line no-underscore-dangle
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

// TODO: Write function Docs
exports.modifySauce = (req, res) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  // eslint-disable-next-line no-underscore-dangle
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// TODO: Write function Docs
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        console.log(filename);
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Objet supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
