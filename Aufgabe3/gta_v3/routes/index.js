// File origin: VS1LAB A3

const express = require('express');
const router = express.Router();

const GeoTag = require('../models/geotag');
const GeoTagStore = require('../models/geotag-store');

const store = new GeoTagStore();


// GET /
router.get('/', (req, res) => {
  //Auf globalen Store zugreifen (siehe app.js, alle Tags, die schon drin  sind)
  const geoTagStore = req.app.locals.geoTagStore;

  //Alle Tags abrufen
  const allTags = geoTagStore.getAllGeoTags();


 res.render('index', { 
      taglist: allTags, 
      latitude: "", 
      longitude: "",
      searchTerm: "" 
  });
});

// POST /tagging
router.post('/tagging', (req, res) => {
  const store = req.app.locals.geoTagStore;

  const name = req.body.tagName;
  const desc = req.body.tagDescription;
  const lat  = parseFloat(req.body.tagLatitude);
  const lon  = parseFloat(req.body.tagLongitude);
  const hashtag = req.body.tagHashtag;

  const newTag = new GeoTag(name, desc, lat, lon, hashtag);
  store.addGeoTag(newTag);

  const allTags = store.getAllGeoTags();

  const location = { latitude: lat, longitude: lon };

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
