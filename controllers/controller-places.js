const mongoose = require('mongoose')
const { validationResult } = require('express-validator')

const HttpError = require("../models/http-error");
const getCoordsForAddress = require('../utils/location')
const Place = require('../models/place')
const User = require('../models/user')

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
  
  //let places
  let userWithPlaces
  try {
    // places = await Place.find({ creator: userId })
    userWithPlaces = await User.findById(userId).populate('places')
  } catch (err) {
    const error = new HttpError('Something went wrong we couldn\'t find that user\'s places', 500)
    return next(error)
  }

  //if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError("Could not find a place for that user id", 404));
  }

  // Getters true converts the _id to id with type of string rather than object
  // res.json({ places: places.map(place => place.toObject({ getters: true })) });
  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors)
    return next(new HttpError('Invalid inputs, please check your entry.', 422))
  }

  const { title, description, address, creator } = req.body

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }
  
  const newPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided ID", 404));
  }

  console.log(user)
  console.log(newPlace)

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    // Not the same as the usual push to array, mongoose specific
    user.places.push(newPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed for some reason, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ newPlace: newPlace.toObject({ getters: true }) });
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
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  if (!place) {
    return next(new HttpError('Could not find a place with this ID', 404))
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (err) {
      return next(new HttpError("Something went wrong, could not delete the place", 500));
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