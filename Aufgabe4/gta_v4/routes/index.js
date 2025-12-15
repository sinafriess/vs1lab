// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

// App routes (A3)
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

  // WICHTIG: richtige Methode + richtiger Parameter
  const resultList = store.getNearbyGeoTags(location, 5);

  res.render('index', {
    taglist: resultList,
    latitude: lat,
    longitude: lon
  });
});

// POST /discovery (A3)
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

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', { taglist: [] })
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */
//also: Filtert nach Suchbegriff und Location (Radius), falls vorhanden
// TODO: ... your code here ...

router.get('/api/geotags', (req,res) => {
  const geoTagStore = req.app.locals.geoTagStore;   //Zugriff auf globalen Speicher (store)
  const term = req.query.searchTerm || ""; //liest suchbegriff aus der url, wenn keiner da: leer
  const lat = req.query.latitude; //liest Latitude aus url
  const lon = req.query.longitude; // "" Longitude
  const radius = parseFloat(req.query.radius) || 10; //radius auslesem, oder falls keiner angeeben: auf standardwert 10 setzen
  //              ^stellt sicher, dass es eine Zahl ist

  let results = []; //initialisiert Ergebnisliste als leeres Array
  //^Wert kann sich später noch ändern

  //1. Fall: Lat und Lon vorhanden
  if (lat && lon){
    //erstellt location objekt mit Koordinaten (string-> float)
    const location = {latitude: parseFloat(lat), longitude: parseFloat(lon) };
    
    //Unterfall: Wenn zusätzlich ein term (suchbegriff)
    if(term){
      //sucht geotags in der Nähe nach suchbegriff
      results = geoTagStore.getNearbyGeoTags(location, radius, term);
    } else {
      //sucht in der nähe ohne suchbegriff
      results = geoTagStore.getNearbyGeoTags(location, radius);
    }
  } else {  //2.Fall: keine Koord., dann globale Liste zurückgeben
    results = geoTagStore.getAllGeoTags();
  }
  
  //Sendet Antworrt mit HTTP Status 200 (OK) und ergebnis im json Format
  res.status(200).json(results);


});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */
//erstellt neuen Geotag
// TODO: ... your code here ...

router.post('/api/geotags',(req, res) => {
  const geoTagStore = req.app.locals.geoTagStore;   //Zugriff auf globalen Speicher (store)
  //Daten aus Body lesen (json)
  const { name, description, latitude, longitude, hashtag } = req.body;

  //neuer Tag:
  const newTag = new GeoTag(name, description, latitude, longitude, hashtag);

  //Store fügt Tag hinzu, bekommt ID
  geoTagStore.addGeoTag(newTag);

  //URL der neuen Ressource in den Haeder setzen, wenn es eine id hat
  if (newTag.id) {
    res.location('/api/geotags/${newTag.id}');
  }

  res.status(201).json(newTag); // 201: created

});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */
//liefert einzelnen Tag
// TODO: ... your code here ...
 router.get('/api/geotags/:id', (req, res) =>{
  const geoTagStore = req.app.locals.geoTagStore;  //Zugriff auf globalen Speicher (store)
  const id = req.params.id;

  const tag = geoTagStore.getGeoTagById(id);

  if (tag) {  //wenn es einen tag mit der ID gibt:
    res.status(200).json(tag);
  } else {
    res.status(404).json({ error: "GeoTag not found"});
  }
 });


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */
//aktualisiert Tag
// TODO: ... your code here ...
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

module.exports = router;
