var angular = angular || {};

var app = angular.module('gawebtoolkit.core.marker-directives',
    [
        'gawebtoolkit.core.map-directives',
        'gawebtoolkit.core.map-services',
        'gawebtoolkit.core.layer-services'
    ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.marker-directives:gaMapMarker
 * @description
 * A wrapper for a native map marker
 * @scope
 * @restrict E
 * @require gaMap
 * @example
 */
app.directive('gaMapMarker', [ function () {
    'use strict';
    return {
        restrict: "E",
        require: "^gaMap",
        scope: {
            markerIcon: "@",
            markerLong: "@",
            markerLat: "@",
            markerId: "@",
            mapMarkerClicked: "&"
        },
        link: function (scope, element, attrs, mapController) {
            element.bind("click", function () {
                scope.mapMarkerClicked({
                    id: scope.markerId
                });
            });


        }
    };
} ]);