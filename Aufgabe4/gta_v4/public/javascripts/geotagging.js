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

let currentLatitude = null; //am anfang kien standort bekannt 
let currentLongitude = null;
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
        tagLatQuery.value  = lat;
        tagLonQuery.value  = lon;
        discLatQuery.value = lat;
        discLonQuery.value = lon;

        currentLatitude = parseFloat(lat); //string in zahl umwandeln
        currentLongitude = parseFloat(lon);

        mapManager.initMap(lat, lon); //Leaflet Karte erstellen

        
        const mapContainer = document.getElementById("map"); // alle tags mit map aus html lesen, array erstellen
        let tags = [];

        if (mapContainer && mapContainer.dataset && mapContainer.dataset.tags) { //damit programm nicht abstürzt
            try {
                tags = JSON.parse(mapContainer.dataset.tags);
            } catch (e) {
                console.error("Fehler beim Parsen von data-tags:", e);
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


function updateDiscoveryView(tags) {
    const list = document.getElementById("discoveryResults"); //liste aus html holen
    list.innerHTML = ""; // alle bisherigen <li> löschen 

    tags.forEach(tag => {
        const li = document.createElement("li"); //neues listenelement erzeugen
        li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`; //textinhalt
        list.appendChild(li); //in liste einfügen
    });

    if (currentLatitude !== null && currentLongitude !== null) {
        mapManager.updateMarkers(currentLatitude, currentLongitude, tags); //marker setzen
    }
}

async function performDiscoverySearch() {
    const keyword = document.getElementById("searchKeyword").value; //sucher angaben auslesen
    const radius  = document.getElementById("searchRadius").value;
    const lat     = document.getElementById("discLatitude").value;
    const lon     = document.getElementById("discLongitude").value;

    const params = new URLSearchParams({
        latitude: lat, //url parameter
        longitude: lon,
        radius: radius,
        searchTerm: keyword
    });

    const response = await fetch(`/api/geotags?${params.toString()}`); //http get anfrage an server
    const tags = await response.json(); //in json umwandeln

    updateDiscoveryView(tags); //aktualisiert marker auf karte 
}

async function handleTaggingSubmit(event) {
    event.preventDefault(); //damit seite nicht neu lädt 

    const geoTag = {
        name: document.getElementById("tagName").value, //json objekt bauen und eingaben auslesen
        description: document.getElementById("tagDescription").value,
        latitude: parseFloat(document.getElementById("tagLatitude").value),
        longitude: parseFloat(document.getElementById("tagLongitude").value),
        hashtag: document.getElementById("tagHashtag").value
    };

    await fetch("/api/geotags", { //post request senden
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geoTag)
    });

    await performDiscoverySearch(); //discovery liste automatisch aktualisieren
}

async function handleDiscoverySubmit(event) { //wenn user auf suchen klickt im discovery formular
    event.preventDefault();
    await performDiscoverySearch();
}
// Wait for the page to fully load its DOM content, then call updateLocation

document.addEventListener("DOMContentLoaded", () => {
    updateLocation();

    document
        .getElementById("tag-form")
        .addEventListener("submit", handleTaggingSubmit); //wird bei event aufgerufen 

    document
        .getElementById("discoveryFilterForm")
        .addEventListener("submit", handleDiscoverySubmit);

});