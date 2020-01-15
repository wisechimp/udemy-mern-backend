const { validationResult } = require('express-validator')

const HttpError = require("../models/http-error");
const geocode = require('../utils/geocode')
const Place = require('../models/place')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place

  // If we wanted a promise we can chain exec() not needed here
  // This catch error occurs if the get request fails
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find a place', 500)
    return next(error)
  }

  // This different error occurs if the place doesn't exist
  if (!place) {
    const error = new HttpError("Could not find that place", 404)
    return next(error)
  }

  // Getters true converts the _id to id with type of string rather than object
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places

  try {
    places = await Place.find( {creator: userId })
  } catch (err) {
    const error = new HttpError('Something went wrong we couldn\'t find that user\'s places', 500)
    return next(error)
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find a place for that user id", 404));
  }

  // Getters true converts the _id to id with type of string rather than object
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors)
    return next(new HttpError('Invalid inputs, please check your entry.', 422))
  }

  const { title, description, address, creator } = req.body
  
  geocode(address, (error, { latitude, longitude }) => {
    if (error) {
      return console.log(error)
    }
    const coordinates = { lat: latitude, lng: longitude }
    // console.log(coordinates)

    const newPlace = new Place({
      title,
      description,
      address,
      location: coordinates,
      image:
        "https://www.filminquiry.com/wp-content/uploads/2017/03/king-kong-1976-dead.jpg",
      creator
    });

    try {
      newPlace.save()
    } catch (err) {
      const error = new HttpError('Creating Place failed, please try again', 500)
      return next(error)
    }

    res.status(201).json({ newPlace: newPlace.toObject({ getters: true }) });
  })
}

const updatePlace = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    return next(new HttpError("Invalid inputs, please check your entry.", 422));
  }
  
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let placeToUpdate

  try {
    placeToUpdate = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  placeToUpdate.title = title
  placeToUpdate.description = description

  try {
    await placeToUpdate.save()
  } catch (err) {
    const error = new HttpError("Updating place failed, please try again", 500);
    return next(error);
  }

  res.json({ placeToUpdate: placeToUpdate.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid
  let place

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

    try {
    await place.remove()
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place",
      500
    );
    return next(error);
  }
  
  res.json({ message: 'Deleted Place.'})
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
}