const { validationResult } = require('express-validator')

const HttpError = require("../models/http-error");
const geocode = require('../utils/geocode')
const Place = require('../models/place')

//This is temporary - will be replaced by the database
let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'Scene of a heinous murder!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    }
]

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

    res.status(201).json({ place: newPlace });
  })
}

const updatePlace = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    throw new HttpError("Invalid inputs, please check your entry.", 422);
  }
  
  const { title, description } = req.body;
  const placeId = req.params.pid;

  const placeToUpdate = { ...DUMMY_PLACES.find(p => p.id === placeId) }
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  // It looks like you're changing a constant! In fact the const is a reference
  // to an object and we changing the data in the object
  placeToUpdate.title = title
  placeToUpdate.description = description

  DUMMY_PLACES[placeIndex] = placeToUpdate

  res.json({ placeToUpdate })
}

const deletePlace = (req, res, next) => {
  const placeId = req.body.pid
  if (DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find a place with that ID.')
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)
  res.json({ message: 'Deleted Place.'})
}

module.exports = {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
}