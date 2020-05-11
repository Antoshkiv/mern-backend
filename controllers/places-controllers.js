const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator')

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PACES.find((p) => p.id === placeId);

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id', 404)
    );
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PACES.filter((p) => p.creator === userId);

  if (!places || places.length === 0 ) {
    return next(
      new HttpError('Could not find a places for the provided user id', 404)
    );
  }

  res.json({ places });
};

const createPlace = (req, res, next) => {
  const error = validationResult(req)
  if(!error.isEmpty()) {
    console.log('error', error)
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }
   
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PACES.push(createdPlace);

  res.status(201).json({ place: createdPlace });
};

const updatePlaceById = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PACES = DUMMY_PACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
