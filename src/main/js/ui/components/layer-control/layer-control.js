/* global angular, $ */
(function () {
    "use strict";
    var app = angular.module('geowebtoolkit.ui.components.layer-control', ['geowebtoolkit.ui.directives', 'ui.utils', 'geowebtoolkit.utils']);


    /**
     * @ngdoc directive
     * @name geowebtoolkit.ui.directives:geoLayerControl
     * @description
     * A control for turning on/off layers via provided '=mapController' as well as opacity slider
     * @param {Layer[]} layersData - Layers that the toolbar will interact with
     *  structure expected is a minimum of:
     *       {
 *           id: //unique id of the layer
 *           opacity: //value betweeb 0-100 representing the percentage of opacity of the layer
 *           visibility: //boolean representing if layer is visible
 *           name: //friendly name of the layer
 *       }
     * @param {mapController[]} mapController - mapController object
     * @param {string} onVisible - A callback function when user turns on the layer
     * @param {string} onHidden - A callback function when user turns off the layer
     * @param {string} onOpacityChange - A callback function when user changes the opacity of the layer
     * @scope
     * @restrict E
     * @example
     * <example module="mapWithUIController">
     * <file name="mapWithUIController.html">
     * <div ng-controller="ourMapController">
     * <geo-layer-control
     *  layer-data="layers[1]"
     *  map-controller="mapController"
     *  class="alert alert-info"></geo-layer-control>
     * <div id="map"></div>
     * <geo-map
     *   map-element-id="map"
     *   datum-projection='EPSG:102100'
     *   display-projection='EPSG:4326'
     *   center-position='[130, -25]'
     *   zoom-level="4">
     *   <geo-map-layer
     *       layer-name="Overview World Screen"
     *       layer-type="GoogleStreet"
     *       is-base-layer="true">
     *   </geo-map-layer>
     *   <geo-map-layer
     *       layer-name="Earthquake hazard contours"
     *       layer-type="WMS"
     *       layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     *       is-base-layer="false"
     *       layers="hazardContours"
     *       background-color="#ffffff">
     *   </geo-map-layer>
     * </geo-map>
     * </div>
     * </file>
     * <file name="mapWithUIController.js">
     * var app = angular.module('mapWithUIController',['geowebtoolkit.core', 'geowebtoolkit.ui']);
     * app.controller("ourMapController",["$scope", function($scope) {
 *       $scope.$on("mapControllerReady", function(event, args) {
 *           $scope.mapController = args;
 *           $scope.$on("layersReady", function() {
 *               $scope.layers = $scope.mapController.getLayers();
 *           });
 *       });
 *   }]);
     * </file>
     * <file name="mapWithUIController.css">
     * #map {
 * width: 570pcx;
 * height: 530px;
 * display: inline-block;
 * }
     * .alert {
 *   border: 1px solid silver;
 *   color:grey;
 *   position: relative;
 *   float: left;
 *   margin-left: 10px;
 * }
     * .alert label {
 *   margin: 10px;
 * }
     * </file>
     * </example>
     *
     */
    app.directive('geoLayerControl', ['GeoUtils',
        function (GeoUtils) {
            return {
                restrict: "E",
                templateUrl: 'src/main/js/ui/components/layer-control/layer-control.html',
                scope: {
                    layerData: '=',
                    mapController: '=',
                    onVisible: '&',
                    onHidden: '&',
                    onOpacityChange: '&',
                    layerDisabled: '=',
                    onStartLoading: '&',
                    onFinishedLoading: '&'
                },
                controller: ['$scope', function ($scope) {
                    $scope.elementId = GeoUtils.generateUuid();
                }],
                compile: function compile() {
                    return {
                        post: function postLink(scope) {
                            var loadStartEvent = function () {
                                scope.onStartLoading({layerId: scope.layerData.id});
                            };
                            var loadend = function () {
                                scope.onFinishedLoading({layerId: scope.layerData.id});
                            };
                            //Event to be cleaned up on map destruction
                            scope.$watch('layerData', function (newVal) {
                                if (newVal != null) {
                                    //Parse possible coerced value
                                    scope.layerData.visibility = scope.layerData.visibility === true || scope.layerData.visibility === 'true';
                                    if (scope.mapController == null) {
                                        throw new Error("mapController is not available");
                                    }
                                    if (scope.layerData.id != null) {
                                        scope.mapController.registerLayerEvent(
                                            scope.layerData.id,
                                            "loadstart", loadStartEvent);
                                        scope.mapController.registerLayerEvent(
                                            scope.layerData.id,
                                            "loadend", loadend);
                                    }
                                }
                            });
                        },
                        pre: function preLink(scope) {
                            scope.changeOpacity = function (layerId, opacity) {
                                scope.onOpacityChange({
                                    layerId: layerId,
                                    opacity: opacity
                                });
                            };
                            scope.layerClicked = function () {
                                scope.layerData.visibility = !scope.layerData.visibility;
                                scope.mapController.setLayerVisibility(scope.layerData.id, scope.layerData.visibility);
                                if (scope.layerData.visibility) {
                                    scope.onVisible({
                                        layerId: scope.layerData.id
                                    });
                                } else {
                                    scope.onHidden({
                                        layerId: scope.layerData.id
                                    });
                                }
                            };
                        }
                    };
                },
                transclude: true
            };
        }]);
})();