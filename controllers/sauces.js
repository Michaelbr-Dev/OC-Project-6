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
 * @param {object} req - Express Request object.
 * @param {object} res - Express Response object.
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
 * @param {object} req          - Express request object.
 * @param {string} req.param.id - Sauce Id in URL.
 *
 * @param {object} res          - Express response object.
 */
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

/**
 * @function createSauce
 * @description Function that create a new sauce object in database.
 *
 * @param {object} req            - Express request object.
 * @param {object} req.body       - Request body object.
 * @param {object} req.body.sauce - Request sauce object.
 *
 * @param {object} res            - Express response object.
 */
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
    .then(() => res.status(201).json({ message: 'Sauce registered !' }))
    .catch((error) => res.status(400).json({ error }));
};

/**
 * @function modifySauce
 * @description Function to modifying the sauce object.
 *
 * @param {object} req            - Express Request object.
 * @param {object} req.file       - Request file object.
 * @param {object} req.body       - Request body object.
 * @param {object} req.body.sauce - Request sauce object.
 *
 * @param {object} res            - Express Response object.
 */
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
        res.status(401).json({ error: 'Unauthorised' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce updated !' }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/**
 * @function deleteSauce
 * @description Function that remove the sauce object from the database.
 *
 * @param {object} req             - Express request object.
 * @param {object} req.params      - Request parameters.
 * @param {object} req.params.id   - Sauce Id in URL.
 * @param {object} req.auth        - Authenticated user's token informations.
 * @param {object} req.auth.userId - Authenticated user's Id.
 *
 * @param {object} res             - Express response object.
 */
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ error: 'Unauthorised' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Objet deleted !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/**
 * @function like
 * @description It checks if the user has already liked the sauce, if not, it adds the user to the
 * list of users who liked the sauce, and updates the number of likes and dislikes.
 *
 * @param   {object} sauce  - The sauce object that we want to update.
 *
 * @param   {string} userId - The id of the user who liked the sauce.
 *
 * @param   {object} res    - Express response object.
 *
 * @returns {object}        - The return object.
 */
function like(sauce, userId, res) {
  if (sauce.usersLiked.includes(userId)) {
    return res.status(409).json({ error: 'User already liked' });
  }
  if (sauce.usersDisliked.includes(userId)) {
    return res.status(400).json({ error: 'User must remove dislike before liking' });
  }
  sauce.usersLiked.push(userId);

  /* eslint-disable no-param-reassign */
  sauce.likes = sauce.usersLiked.length;
  sauce.dislikes = sauce.usersDisliked.length;
  /* eslint-enable no-param-reassign */

  return sauce
    .save()
    .then(() => res.status(201).json({ message: 'Reaction created !' }))
    .catch((error) => res.status(400).json({ error }));
}

/**
 * @function reset
 * @description It deletes the user's reaction to a sauce, and updates the number of likes and dislikes.
 *
 * @param   {object} sauce  - The sauce object that we want to update.
 *
 * @param   {string} userId - The id of the user who liked the sauce.
 *
 * @param   {object} res    - Express response object.
 *
 * @returns {object}        - The return object.
 */
function reset(sauce, userId, res) {
  if (sauce.usersLiked.includes(userId)) {
    const index = sauce.usersLiked.indexOf(userId);
    sauce.usersLiked.splice(index, 1);

    return sauce
      .save()
      .then(() => res.status(200).json({ message: 'Reaction deleted !' }))
      .catch((error) => res.status(400).json({ error }));
  }
  if (sauce.usersDisliked.includes(userId)) {
    const index = sauce.usersDisliked.indexOf(userId);
    sauce.usersDisliked.splice(index, 1);

    /* eslint-disable no-param-reassign */
    sauce.likes = sauce.usersLiked.length;
    sauce.dislikes = sauce.usersDisliked.length;
    /* eslint-enable no-param-reassign */

    return sauce
      .save()
      .then(() => res.status(200).json({ message: 'Reaction deleted !' }))
      .catch((error) => res.status(400).json({ error }));
  }
  return res.status(404).json({ error: 'Nothing to suppress' });
}

/**
 * @function dislike
 * @description It checks if the user has already liked or disliked the sauce, and if not, it adds
 * the user to the list of users who disliked the sauce.
 *
 * @param   {object} sauce  - The sauce object that we want to update.
 *
 * @param   {string} userId - The id of the user who liked the sauce.
 *
 * @param   {object} res    - Express response object.
 *
 * @returns {object}        - The return object.
 */
function dislike(sauce, userId, res) {
  if (sauce.usersLiked.includes(userId)) {
    return res.status(400).json({ error: 'User must remove like before disliking' });
  }
  if (sauce.usersDisliked.includes(userId)) {
    return res.status(409).json({ error: 'User already disliked' });
  }
  sauce.usersDisliked.push(userId);

  /* eslint-disable no-param-reassign */
  sauce.likes = sauce.usersLiked.length;
  sauce.dislikes = sauce.usersDisliked.length;
  /* eslint-enable no-param-reassign */

  return sauce
    .save()
    .then(() => res.status(201).json({ message: 'Reaction created !' }))
    .catch((error) => res.status(400).json({ error }));
}

/**
 * @function likeDislike
 * @description A function that is called when a user likes or dislikes a sauce.
 *
 * @param {object} req             - Express request object.
 * @param {object} req.params      - Request parameters.
 * @param {object} req.params.id   - Sauce Id in URL.
 * @param {object} req.auth        - Authenticated user's token informations.
 * @param {object} req.auth.userId - Authenticated user's Id.
 *
 * @param {object} res             - Express response object.
 */
exports.likeDislike = (req, res) => {
  const { userId } = req.auth;
  // eslint-disable-next-line no-underscore-dangle
  const sauceId = req.params.id;

  Sauce.findOne({ _id: sauceId }).then((sauce) => {
    switch (req.body.like) {
      case 1:
        like(sauce, userId, res);
        break;

      case 0:
        reset(sauce, userId, res);
        break;

      case -1:
        dislike(sauce, userId, res);
        break;

      default:
        res.status(400).json({ message: 'Unknow reaction type' });
        break;
    }
  });
};
