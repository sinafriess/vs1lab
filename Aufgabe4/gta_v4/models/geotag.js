// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** * 
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {
    // TODO: ... your code here ...
    // Statische Felder aus tagging form
    name; //string
    description; //string
    latitude; //number
    longitude; //number
    hashtag; //string

    // Konstruktor zur Erstellung eines neuen GeoTag-Objekts:
    constructor(name, description, latitude, longitude, hashtag) {
        this.name = name;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.hashtag = hashtag;
    }
}

module.exports = GeoTag;
