require("dotenv").config();
const axios = require('axios');

const HttpError = require('../models/http-error');

async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(address) +
      ".json?access_token=" +
      process.env.MAPBOXTOKEN +
      "&limit=1"
  );

  const { data } = response
  console.log(data.features)

  if (data.features.length === 0) {
    return next(new HttpError(
      'Could not find location for the specified address.',
      422))
  }

  const coordinates = {
    lat: data.features[0].center[1],
    lng: data.features[0].center[0]
  };
  console.log(coordinates)

  return coordinates;
}

module.exports = getCoordsForAddress;
