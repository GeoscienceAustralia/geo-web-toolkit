/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.geo-place-name-search', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:geoNamesPlaceSearch
     * @param {object} mapController - Map controller
     * @param {string} searchIconUrl - Path to an icon used for search
     * @param {string} geoNamesApiKey - Username to use for geonames.org web service
     * @param {number} zoomLevel - Zoom level after selection from autocomplete
     * @param {string} countryCode - Country code to be used in the search
     * @param {string} resultTemplateUrl - URL for the result template HTML
     * @param {Function} onResults - function called when results are returned
     * @param {Function} onResultsSelected -  function called when a result is selected
     * @param {Function} onPerformSearch - function called when search is performed
     * @param {number} activateKey - key code for activating the search
     * @description
     * Simple control exposing google auto complete search which zooms on selection.
     * @scope
     * @restrict E
     * @example
     */
    app.directive('geoNamesPlaceSearch', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        return {
            restrict: 'E',
            templateUrl:'src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html',
            scope: {
                mapController: '=',
                searchIconUrl: '@',
                geoNamesApiKey: '@',
                zoomLevel: '@',
                countryCode: '@',
                resultTemplateUrl: '@',
                onResults: '&',
                onResultsSelected: '&',
                onPerformSearch: '&',
                activateKey: '@'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function ($scope, $element) {
                var input = $element.find('input[type="text"]')[0];
                $element.bind('keydown', function (args) {
                    if (args.keyCode == $scope.activateKey) {
                        if ($scope.typeAheadSelected) {
                            return;
                        }
                        $scope.searchButtonClicked();
                        $scope.$apply();
                    }
                });
                var searchFunction = function (query, rowCount) {
                    //input box is populated with an object on selection of typeahead
                    if (typeof query === 'object') {
                        query = query.properties.name;
                    }
                    $scope.searchResults = [];
                    var deferred = $q.defer();
                    $scope.waitingForResponse = true;
                    var url = 'http://api.geonames.org/searchJSON?q=' + encodeURIComponent(query).replace("%20", "+") +
                        '&maxRows=' + rowCount + '&country=' + $scope.countryCode.toUpperCase() +
                        '&username=' + $scope.geoNamesApiKey;
                    $http.get(url).success(function (results) {
                        $scope.waitingForResponse = false;
                        var geoJsonResults = [];
                        for (var i = 0; i < results.geonames.length; i++) {
                            var geoName = results.geonames[i];
                            geoJsonResults.push($scope.convertGeoNameToGeoJson(geoName));
                        }
                        deferred.resolve(geoJsonResults);
                    });

                    return deferred.promise;
                };

                $scope.getSearchResults = function (query) {
                    if (!(query != null && query.length >= 3)) {
                        return [];
                    }

                    return searchFunction(query, 10).then(function (data) {
                        if ($scope.searchInProgress) {
                            return [];
                        }
                        $scope.onResults({
                            data: data
                        });
                        return data;
                    });
                };

                $scope.onSelected = function ($item) {
                    $scope.typeAheadSelected = true;
                    //Do not re-run query if activateKey is the same as typeahead selection
                    $timeout(function () {
                        $scope.typeAheadSelected = false;
                    }, 50);
                    $scope.onResultsSelected({
                        item: $item
                    });
                };

                $scope.searchButtonClicked = function () {
                    $scope.searchInProgress = true;
                    if ($scope.query != null) {
                        return searchFunction($scope.query, 50).then(function (data) {
                            $scope.searchInProgress = false;
                            $scope.onPerformSearch({
                                data: data
                            });
                            return data;
                        });
                    }
                };

                $scope.convertGeoNameToGeoJson = function (geoNameResult) {
                    var geoJson = {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [parseFloat(geoNameResult.lng), parseFloat(geoNameResult.lat)]
                        },
                        crs: {
                            type: "name",
                            properties: {
                                name: "EPSG:4326"
                            }
                        }
                    };
                    geoJson.properties = {};
                    for (var prop in geoNameResult) {
                        if (geoNameResult.hasOwnProperty(prop)) {
                            geoJson.properties[prop] = geoNameResult[prop];
                        }
                    }
                    return geoJson;
                };
            }
        };
    }]);
})();