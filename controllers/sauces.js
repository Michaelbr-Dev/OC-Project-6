/**
 * @file Manage app.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 */

const fs = require('fs').promises;
const Sauce = require('../models/Sauce');

/**
 * @function getSauce
 * @description Return all the sauces in database.
 *
 * @param {object} _req - Express Request object.
 * @param {object} res  - Express Response object.
 */
exports.getAllSauce = async (_req, res) => {
  const sauces = await Sauce.find().catch((error) => {
    res.status(500).json({ error });
  });
  res.status(200).json(sauces);
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
exports.getOneSauce = async (req, res) => {
  const oneSauce = await Sauce.findOne({ _id: req.params.id }).catch((error) =>
    res.status(500).json({ error }),
  );
  res.status(200).json(oneSauce);
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
exports.createSauce = async (req, res) => {
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
  await sauce.save().catch((error) => res.status(500).json({ error }));
  res.status(201).json({ message: 'Sauce registered !' });
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
exports.modifySauce = async (req, res) => {
  try {
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body };

    // eslint-disable-next-line no-underscore-dangle
    delete sauceObject._userId;
    const sauce = await Sauce.findOne({ _id: req.params.id });
    if (sauce.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const filename = sauce.imageUrl.split('/images/')[1];
    await fs.unlink(`images/${filename}`);
    await Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id });
    return res.status(200).json({ message: 'Sauce updated !' });
  } catch (error) {
    return res.status(500).json({ error });
  }
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
exports.deleteSauce = async (req, res) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });

    if (sauce.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const filename = sauce.imageUrl.split('/images/')[1];
    await fs.unlink(`images/${filename}`);
    await Sauce.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Sauce deleted !' });
  } catch (error) {
    return res.status(500).json({ error });
  }
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
async function like(sauce, userId, res) {
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

  await sauce.save().catch((error) => res.status(500).json({ error }));
  return res.status(201).json({ message: 'Reaction created !' });
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
async function reset(sauce, userId, res) {
  if (sauce.usersLiked.includes(userId)) {
    const index = sauce.usersLiked.indexOf(userId);
    sauce.usersLiked.splice(index, 1);

    await sauce.save().catch((error) => res.status(500).json({ error }));
    return res.status(200).json({ message: 'Reaction deleted !' });
  }
  if (sauce.usersDisliked.includes(userId)) {
    const index = sauce.usersDisliked.indexOf(userId);
    sauce.usersDisliked.splice(index, 1);

    /* eslint-disable no-param-reassign */
    sauce.likes = sauce.usersLiked.length;
    sauce.dislikes = sauce.usersDisliked.length;
    /* eslint-enable no-param-reassign */

    await sauce.save().catch((error) => res.status(500).json({ error }));
    return res.status(200).json({ message: 'Reaction deleted !' });
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
async function dislike(sauce, userId, res) {
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

  await sauce.save().catch((error) => res.status(500).json({ error }));
  return res.status(201).json({ message: 'Reaction created !' });
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
exports.likeDislike = async (req, res) => {
  const { userId } = req.auth;
  // eslint-disable-next-line no-underscore-dangle
  const sauceId = req.params.id;

  const sauce = await Sauce.findOne({ _id: sauceId }).catch((error) =>
    res.status(500).json({ error }),
  );
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
};
