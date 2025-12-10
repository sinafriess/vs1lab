// File origin: VS1LAB A3

const express = require('express');
const router = express.Router();

const GeoTag = require('../models/geotag');
const GeoTagStore = require('../models/geotag-store');

const store = new GeoTagStore();

// GET /
router.get('/', (req, res) => {
  res.render('index', { taglist: [], latitude: "", longitude: "" });
});

// POST /tagging
router.post('/tagging', (req, res) => {
  const name = req.body.tagName;
  const desc = req.body.tagDescription;
  const lat  = parseFloat(req.body.tagLatitude);
  const lon  = parseFloat(req.body.tagLongitude);
  const hashtag = req.body.tagHashtag;

  const newTag = new GeoTag(name, desc, lat, lon, hashtag);
  store.addGeoTag(newTag);

  const location = { latitude: lat, longitude: lon };

  // WICHTIG: richtige Methode + richtiger Parameter
  const resultList = store.getNearbyGeoTags(location, 5);

  res.render('index', {
    taglist: resultList,
    latitude: lat,
    longitude: lon
  });
});

// POST /discovery
router.post('/discovery', (req, res) => {
  const lat  = parseFloat(req.body.discLatitude);
  const lon  = parseFloat(req.body.discLongitude);
  const radius  = parseFloat(req.body.searchRadius) || 5;
  const keyword = (req.body.searchKeyword || "").trim();

  const location = { latitude: lat, longitude: lon };

  let results;
  if (keyword !== "") {
    // WICHTIG: hier die Suchmethode verwenden
    results = store.searchNearbyGeoTags(location, radius, keyword);
  } else {
    results = store.getNearbyGeoTags(location, radius);
  }

  res.render('index', {
    taglist: results,
    latitude: lat,
    longitude: lon
  });
});

module.exports = router;
