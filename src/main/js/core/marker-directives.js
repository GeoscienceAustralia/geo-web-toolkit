/* global angular */
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.core.marker-directives',
        [
            'gawebtoolkit.core.map-directives',
            'gawebtoolkit.core.map-services',
            'gawebtoolkit.core.layer-services'
        ]);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.core.marker-directives:gaMapMarker
     * @param {string|@} markerIcon - Marker icon url
     * @param {string|@} markerLat - Latitude for the marker
     * @param {string|@} markerLong - Longitude for the marker
     * @param {string|@} markerWidth - Width set for the marker icon
     * @param {string|@} markerHeight - Height set for the marker icon
     * @param {string|@} layerName - A name allocated to the marker
     * @description
     * A wrapper for a native map marker
     * @scope
     * @restrict E
     * @require gaMap
     * @example
     */
    app.directive('gaMapMarker', ['$log','$timeout','GALayerService', function ($log,$timeout,GALayerService) {
        return {
            restrict: "E",
            require: "^gaMap",
            scope: {
                markerIcon: "@",
                markerLong: "@",
                markerLat: "@",
                markerId: "@",
                markerWidth: "@",
                markerHeight: "@",
                mapMarkerClicked: "&",
                // Default is to create a layer per marker,
                // but layer name can be provided to group all the markers on a single layer
                layerName: "@"
            },
            link: function ($scope, element, attrs, mapController) {
                $scope.framework = mapController.getFrameworkVersion();
                attrs.$observe('markerIcon', function (newVal) {

                });

                attrs.$observe('markerLong', function (newVal) {

                });

                attrs.$observe('markerLat', function (newVal) {

                });

                attrs.$observe('markerId', function (newVal) {

                });

                attrs.$observe('markerWidth', function (newVal) {

                });
                attrs.$observe('markerHeight', function (newVal) {

                });


                function createMapMarker() {
                    var lat,lon,width,height, iconUrl;
                    iconUrl = $scope.markerIcon;


                    if(typeof $scope.markerLong === 'string') {
                        lon = parseFloat($scope.markerLong);
                    }

                    if(typeof $scope.markerLat === 'string') {
                        lat = parseFloat($scope.markerLat);
                    }

                    if(typeof $scope.markerWidth === 'string') {
                        width = parseInt($scope.markerWidth);
                    }

                    if(typeof $scope.markerHeight === 'string') {
                        height = parseInt($scope.markerHeight);
                    }
                    var layer = GALayerService.createLayer({layerType:'markerlayer',layerName: $scope.layerName },$scope.framework);
                    mapController.addMarkerLayer(layer, $scope.layerName).then(function () {
                        //Force digest to process initial async layers in correct order
                        var position = mapController.getPixelFromLonLat(lon, lat);
                        $scope.markerDto = mapController.setMapMarker(position,$scope.layerName,iconUrl,{width:width,height:height});

                    });
                }
                createMapMarker();

                $scope.$on('$destroy', function () {
                    mapController.removeMapMarker($scope.markerDto.id);
                });
            }
        };
    }]);
})();