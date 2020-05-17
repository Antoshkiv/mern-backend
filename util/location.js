const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyBoWdcw6uqZ-oSd3OJlMZSy8mPCdyqBBk0';

async function getCoordsForAddress(address) {
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = res.data;

  if (!data || data.status === 'ZERO_REZULTS') {
    throw new HttpError(
      'Could not find location for the specified address.',
      422
    );
  }

  return data.results[0].geometry.location;
}

module.exports = getCoordsForAddress;
 