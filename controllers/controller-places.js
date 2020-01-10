const HttpError = require("../models/http-error");

//This is temporary - will be replaced by the database
const DUMMY_PLACES = [
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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find(u => {
    return u.creator === userId;
  });

  if (!place) {
    return next(new HttpError("Could not find a place for that user id", 404));
  }

  res.json({ place });
};

module.exports = {
    getPlaceById,
    getPlaceByUserId
}