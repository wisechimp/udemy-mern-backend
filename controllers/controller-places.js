const HttpError = require("../models/http-error");
const uuid = require('uuid/v4')

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id", 404)
    );
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(place => {
    return place.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find a place for that user id", 404));
  }

  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body
  const newPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(newPlace)
  res.status(201).json({ place: newPlace })
}

const updatePlace = (req, res, next) => {
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