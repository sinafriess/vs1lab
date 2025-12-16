// File origin: VS1LAB A2.

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
  * A class to help using the HTML5 Geolocation API.
  * ! ausgelagert in location-helper.js !
  */

/**
 * A class to help using the Leaflet map service.
 * ! ausgelagert in map-manager.js !
 */


const mapManager = new MapManager();
/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
// ... your code here ...
function updateLocation() {
    // A3.2: Abfrage, ob schon Koordinaten drinnenstehen, um Latenz zu vermeiden
    // Eingabefelder lesen
    const tagLatQuery = document.getElementById("tagLatitude");
    const tagLonQuery = document.getElementById("tagLongitude");
    const discLatQuery = document.getElementById("discLatitude");
    const discLonQuery = document.getElementById("discLongitude");

    // Konstante für gesetzte Koordinaten festlegen für Test
    const coordsAlreadySet =
        tagLatQuery.value.trim() !== "" &&
        tagLonQuery.value.trim() !== "" &&
        discLatQuery.value.trim() !== "" &&
        discLonQuery.value.trim() !== "";

    const applyLocation = (lat, lon) => {
        tagLatQuery.value = lat;
        tagLonQuery.value = lon;
        discLatQuery.value = lat;
        discLonQuery.value = lon;

        mapManager.initMap(lat, lon); //Leaflet Karte erstellen

        
        const mapContainer = document.getElementById("map"); // alle tags mit map aus html lesen, array erstellen
        let tags = [];

        if (mapContainer && mapContainer.dataset && mapContainer.dataset.tags) { //damit programm nicht abstürzt
            try {
                tags = JSON.parse(mapContainer.dataset.tags);
            } catch (e) {
                console.error("Fehler beim Parsen von Data-Tags:", e);
            }
        }

        mapManager.updateMarkers(lat, lon, tags);

        if (mapContainer) {
            const placeholderImg = mapContainer.querySelector("img");
            if (placeholderImg) {
                placeholderImg.remove(); // Platzhalter Map Bild löschen 
            }

            const caption = mapContainer.querySelector("span");
            if (caption) {
                caption.remove(); // Platzhalter Text löschen 
            }
        }
    };
    

    // Test, ob Koordinaten schon gesetzt sind
    if (coordsAlreadySet) {
        const lat = tagLatQuery.value.trim(); //vorhandene Koordinaten verwenden
        const lon = tagLonQuery.value.trim();
        applyLocation(lat, lon);
        return;
    }

    // Statische Methode von LocationHelper aufrufen
    LocationHelper.findLocation(function(locationHelper){
        const lat = locationHelper.latitude;  // Getter verwenden
        const lon = locationHelper.longitude;

        applyLocation(lat, lon);
    });
}

// Wait for the page to fully load its DOM content, then call updateLocation

document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});