var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var jQuery = jQuery || {};

/**
 *  An object that represents a longitude and latitude position on the map in within the map instance projection.
 *  @typedef {Object} LonLat
 *  @property {Number} lat - Latitude value as a decimal
 *  @property {Number} lon - Longitude value as a decimal
 *
 *  Coordinates object of a geoJson object. This is an array of 2 value arrays representing
 *  lon, lat as [{Number},{Number}].
 *  @typedef {[][]} geoJsonCoordinates
 *
 *  Point geometry
 *  @typedef {Object} Point
 *  @property {Number} x - Value representing an X component of a point
 *  @property {Number} y - Value representing a Y component of a point
 *
 *  Layer
 *  @typedef {Object} Layer
 *  @property {string} id - A unique identifier
 *  @property {string} name - A display friendly name for the layer
 *  @property {string} type - A string indicating the type of layer, eg WMS
 *  @property {Boolean} visibility - A bool indicating if a layer is currently visible for not.
 *
 *  Distance
 *  @typedef {Object} Distance
 *  @property {Number} meansure - The number of units of distance
 *  @property {string} units - The unit type of the distance number, eg 'km'
 * */

angular.module('geowebtoolkit.core',
    [
        'geowebtoolkit.mapservices',
        'geowebtoolkit.core.map-directives',
        'geowebtoolkit.core.map-services',
        'geowebtoolkit.core.layer-directives',
        'geowebtoolkit.vendor-layers',
        'geowebtoolkit.core.layer-services',
        'geowebtoolkit.core.data-services',
        'geowebtoolkit.core.control-directives',
        'geowebtoolkit.core.feature-directives',
        'geowebtoolkit.core.marker-directives',
        'geowebtoolkit.core.map-config',
        'geowebtoolkit.utils'
    ]);