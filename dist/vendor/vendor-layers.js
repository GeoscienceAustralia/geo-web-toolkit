/* global angular */
(function () {
    "use strict";
    angular.module('geowebtoolkit.vendor-layers',
        [
            'geowebtoolkit.vendor.google-layers',
            'geowebtoolkit.vendor.bing-layers',
            'geowebtoolkit.vendor.osm-layers'
        ]);
})();
