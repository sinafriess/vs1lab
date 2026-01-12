// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.DONE
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name. DONE
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */


const GeoTag = require('./geotag'); //GeoTag KLasse importieren
const GeoTagExamples = require('./geotag-examples'); //Beispieldaten importieren

//Hilfsmethode für getNearbyGeoTags()
const getDistanceSquared = (lat1, lon1, lat2, lon2) => {
    const dLat = lat1 - lat2;
    const dLon = lon1 - lon2;
    return dLat * dLat + dLon * dLon;
};


class InMemoryGeoTagStore{
    // TODO: ... your code here ...

    //1. Array zur Speicherung der Geotags, muss nicht ausserhalb zugänglich sein (#)
    #geoTags = [];  

    constructor() {
        this.populateGeoTags();
    }

    //Methode zum Hinzufügen von GeoTags zum Store
    addGeoTag(geoTag){
        if(geoTag instanceof GeoTag){   
            this.#geoTags.push(geoTag);     //hinzufügen des GeoTags(, wenn er einer ist)
        } else{
            console.error("Objekt ist kein GeoTag")
        }
    }

    //Methode zum Einlesen der Beispieldaten (Populate)
    populateGeoTags(){
        const exampleList = GeoTagExamples.tagList;

        exampleList.forEach((data) =>{
            const name = data[0];
            const latitude = data[1];
            const longitude = data[2];
            const hashtag = data[3];
            //Beispiele haben keine description

            const tag = new GeoTag(name, "", latitude, longitude, hashtag);
            this.addGeoTag(tag);
        });
    }

    //Methode zum Löschen von Geotags aus dem Store durch ihren Namen
    removeGeoTag(name){
        if(!name) return;   //wenn es kein Name ist, kann nichts getan werden
        
        //neues Array ohne den GeoTag, der gelöscht werden soll:
        this.#geoTags = this.#geoTags.filter(function(tag){     //filter erstellt neuen Array, der jetzt bedingung erfüllt
            return tag.name !== name;   //Alle Elemente behalten, außer die mit dem name
        })  //-> alter Array wird also mit neuem überschrieben
    }

    //Alle gespeicherte GeoTags zurückgeben => dass beim starten der seite alle da sind
    getAllGeoTags() {
        return this.#geoTags;
    }

    //alle Geotags in der Nähe einer Location zurück (in einem Radius)
    getNearbyGeoTags(location, radius){
        if (!location || !radius) return [];

        const radiusSq = radius * radius;

        return this.#geoTags.filter(function(tag){
             const distanceSq = getDistanceSquared(
                location.latitude,
                location.longitude,
                tag.latitude,
                tag.longitude
            );
            // Liegt quatrierte Distanz im Umkreis?
            return distanceSq <= radiusSq;
        })  //Alle Geotags, auf die das zutrifft, werden returned
    }

    getTagsNearby(lat, lon, radius) {
        if (lat == null || lon == null || !radius) return [];
        const location = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        };
        return this.getNearbyGeoTags(location, radius);
    }

    //alle Geotags in einem Umkreis, die ein Stichwort im Namen oder im Hashtag enthalten.
    searchNearbyGeoTags(location, radius, keyword){
        if (!location || !radius || !keyword) return[];

        const term = keyword.toLowerCase();
        const nearbyTags = this.getNearbyGeoTags(location, radius);

       return nearbyTags.filter(function(tag){  //Filtert alle, die keyword enthalten
        const nameMatches = (tag.name || "").toLowerCase().includes(term);  //Match mit dem Namen?
        const hashtagMatches = (tag.hashtag || "").toLowerCase().includes(term); //Match mit dem Hashtag?
        return nameMatches || hashtagMatches; //wenn eins zustrifft
       })
}

// A4: Tag aktualisieren (für API PUT /:id)
    updateGeoTag(id, newTagData) {
        const tag = this.getGeoTagById(id);
        if (tag) {
            // Nur Felder aktualisieren, die neu gesendet wurden
            if (newTagData.name) tag.name = newTagData.name;
            if (newTagData.latitude) tag.latitude = newTagData.latitude;
            if (newTagData.longitude) tag.longitude = newTagData.longitude;
            if (newTagData.hashtag) tag.hashtag = newTagData.hashtag;
            if (newTagData.description) tag.description = newTagData.description;
            return tag;
        }
        return null;
    }

}

module.exports = InMemoryGeoTagStore
