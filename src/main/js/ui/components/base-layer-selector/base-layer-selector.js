/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.base-layer-selector', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);


    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaBaseLayerSelector
     * @param {Layer[]} layersData - Layers that the control uses to switch base layers
     * @param {object} mapController - controller instance for the map
     * @param {string} controllerEmitEventName - event that is fired that passes the controller
     * @description
     * This control displays a select box of layers and on change, switches base layers between the proivided
     * list.
     * @scope
     * @restrict E
     * @example
     * <example module="baseLayerSelector">
     * <file name="baseLayerSelector.html">
     * <div ng-controller="ourMapController">
     *     <geo-base-layer-selector
     *        layers-data="baseLayers"
     *        controller-emit-event-name="ourDropDownEvent"
     *        map-controller="mapController">
     *    </geo-base-layer-selector>
     *    <div id="map"></div>
     *    <geo-map
     *        map-element-id="map"
     *        datum-projection='EPSG:102100'
     *        display-projection='EPSG:4326'
     *        center-position='[130, -25]'
     *        zoom-level="4">
     *        <geo-map-layer
     *            layer-name="World Image"
     *            layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
     *            wrap-date-line="true"
     *            layer-type="XYZTileCache"
     *            is-base-layer="true"
     *            visibility="false">
     *        </geo-map-layer>
     *        <geo-map-layer
     *            layer-name="World Political Boundaries"
     *            layer-url="http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer"
     *            wrap-date-line="true"
     *            layer-type="XYZTileCache"
     *            is-base-layer="true"
     *            visibility="false">
     *        </geo-map-layer>
     *        <geo-map-layer
     *            layer-name="Overview World Screen"
     *            layer-type="GoogleStreet"
     *            is-base-layer="true">
     *        </geo-map-layer>
     *        <geo-map-layer
     *            layer-name="Earthquake hazard contours"
     *            layer-type="WMS"
     *            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     *            is-base-layer="false"
     *            layers="hazardContours"
     *            background-color="#ffffff">
     *        </geo-map-layer>
     *     </geo-map>
     * </div>
     *</file>
     *<file name="baseLayerSelector.js">
     *        var app = angular.module('baseLayerSelector',
     *        ['gawebtoolkit.core', 'gawebtoolkit.ui']);
     *        app.controller("ourMapController",["$scope", function($scope) {
 *                $scope.$on("mapControllerReady", function(event, args) {
 *                    $scope.mapController = args;
 *                    $scope.$on("layersReady", function() {
 *                        $scope.layers = $scope.mapController.getLayers();
 *                        $scope.baseLayers = $scope.layers.filter(function(layer) {
 *                            return $scope.mapController.isBaseLayer(layer.id);
 *                        });
 *                    });
 *                });
 *                $scope.$on("ourDropDownEvent", function(event, args) {
 *                    $scope.dropDownController = args;
 *                    $scope.selectedLayerChanged = function(layerId) {
 *                        $scope.mapController.setLayerVisibility(layerId, false);
 *                    };
 *                });
 *            }]);
     *</file>
     *<file name="baseLayerSelector.css">
     *#map {
 *    width: 670px;
 *    height: 500px;
 *    background-color: #21468b;
 *    margin-top: 10px !important;
 *}
     *</file>
     * </example>
     */
    app.directive('geoBaseLayerSelector', ['$timeout', function ($timeout) {
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/base-layer-selector/base-layer-selector.html',
            replace: true,
            scope: {
                layersData: '=',
                mapController: '=',
                controllerEmitEventName: '@'
            },
            controller: ['$scope', function ($scope) {
                var self = this;

                self.selectBaseLayer = function (layerId) {
                    $scope.selectedBaseLayerId = layerId;
                };

                $scope.$emit($scope.controllerEmitEventName, self);

            }],
            link: function ($scope) {
                $scope.$watch('selectedBaseLayerId', function (newVal) {
                    if (newVal != null) {
                        $scope.mapController.setBaseLayer(newVal);
                    }
                });

                $scope.$watch('layersData', function (newVal) {
                    if (newVal) {
                        for (var i = 0; i < newVal.length; i++) {
                            if ($scope.layersData[i].visibility === true) {
                                setSelectedValue($scope.layersData[i]);
                            }
                        }
                    }
                });

                //Timeout is used due to problem with $watch only fires of array changes, not objects inside
                var setSelectedValue = function (layer) {
                    $timeout(function () {
                        $scope.selectedBaseLayerId = layer.id;
                    });
                };
            },
            transclude: true
        };
    }]);
})();