const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

let DUMMY_PACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One pf the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1',
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not find a place.', 500)
    );
  }
  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id', 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (e) {
    return next(
      new HttpError('Could not find a place for the provided user id', 404)
    );
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a places for the provided user id', 404)
    );
  }

  res.json({ place: places.map((place) => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (e) {
    return next(e);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg',
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (e) {
    return next(new HttpError('Creating place failed, please try again.', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  console.log('user', user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    return next(new HttpError('Creating place fail, please try again.', 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (e) {
    return next(
      new HttpError('Something went wrong, could not delete place.', 500)
    );
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    new HttpError('Something went wrong, could not delete place.', 500);
  }

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
