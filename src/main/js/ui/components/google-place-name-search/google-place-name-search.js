/* global angular, $, google */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.google-place-name-search', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:googlePlaceNameSearch
     * @param {object} mapController - Map controller
     * @param {string} searchIconUrl - Path to an icon used for search
     * @param {number} zoomLevel - Zoom level after selection from autocomplete
     * @param {string} countryCode - Google country code to be used in the search
     * @description
     * Simple control exposing google auto complete search which zooms on selection.
     * @scope
     * @restrict E
     * @example
     */
    app.directive('googlePlaceNameSearch', [function () {
        return {
            restrict: 'E',
            templateUrl: 'geo-web-toolkit/components/google-place-name-search.html',
            scope: {
                mapController: '=',
                searchIconUrl: '@',
                zoomLevel: '@',
                countryCode: '@'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function ($scope, $element) {
                var input = $element.find('input[type="text"]')[0];
                var googleAC = new google.maps.places.Autocomplete(input, {componentRestrictions: {country: $scope.countryCode}});
                google.maps.event.addListener(googleAC, 'place_changed', function () {
                    var place = googleAC.getPlace();
                    if (!place.geometry) {
                        return;
                    }
                    $scope.mapController.zoomTo($scope.zoomLevel);
                    $scope.mapController.setCenter(place.geometry.location.k, place.geometry.location.A, "EPSG:4326");
                });
            }
        };
    }]);
})();