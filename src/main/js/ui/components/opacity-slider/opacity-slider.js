/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('geowebtoolkit.ui.components.opacity-slider', ['geowebtoolkit.ui.directives', 'ui.utils', 'geowebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name geowebtoolkit.ui.directives:geoLayerOpacitySlider
     * @description
     * Adds an opacity slider to the map and attaches it to selected layer
     * @param {string} layersId - The ID of the layer
     * @param {string} layersOpacity - reference to opacity value of the layer
     * @param {mapController[]} mapController - mapController object
     * @scope
     * @restrict E
     * @example
     * <example module="mapWithUISlider">
     * <file name="mapWithUISlider.html">
     * <div ng-controller="ourMapController">
     * <div class="opaictySlider">
     * <geo-layer-opacity-slider
     *  layer-id="{{layers[1].id}}"
     *  layer-opacity="layers[1].opacity"
     *  map-controller="mapController"></geo-layer-opacity-slider>
     *  </div>
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
     * <file name="mapWithUISlider.js">
     * var app = angular.module('mapWithUISlider',['geowebtoolkit.core', 'geowebtoolkit.ui']);
     * app.controller("ourMapController",["$scope", function($scope) {
 *       $scope.$on("mapControllerReady", function(event, args) {
 *           $scope.mapController = args;
 *           $scope.$on("layersReady", function() {
 *               $scope.layers = $scope.mapController.getLayers();
 *           });
 *       });
 *   }]);
     * </file>
     * <file name="mapWithUISlider.css">
     * #map {
 * width: 570pcx;
 * height: 530px;
 * }
     * .opaictySlider {
 * width: 200px;
 * margin-bottom: 20px;
 * }
     * </file>
     * </example>
     *
     */
    app.directive('geoLayerOpacitySlider', ['$timeout', function ($timeout) {
        //'<input type="range"  min="0" max="1.0" step="0.01" ng-model="layerOpacity"/>';
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/opacity-slider/opacity-slider.html',
            replace: true,
            scope: {
                layerId: '@',
                layerOpacity: '=',
                mapController: '=',
                layerDisabled: '=',
                titleText: '@',
                onOpacityChange: '&',
                fillSlider: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.changeOpacitySlide = function (e, ui) {
                    $scope.layerOpacity = ui.value;
                    //This timeout is needed to avoid $digest cycle issues and to keep jquery UI in sync.
                    //This is a performance hit, but unable to get a reliable update with out.
                    $timeout(function () {
                        $scope.$apply();
                        $scope.onOpacityChange({layerId: $scope.layerId, opacity: $scope.layerOpacity});
                    });
                };
                $scope.getSliderOptions = function () {
                    return {
                        min: 0.0,
                        max: 1.0,
                        range: $scope.fillSlider || false,
                        step: 0.01,
                        slide: $scope.changeOpacitySlide,
                        value: $scope.layerOpacity,
                        disabled: $scope.layerDisabled
                    };
                };

            }],
            link: function ($scope, $element) {
                $scope.$watch('layerOpacity', function (newVal, oldVal) {
                    if (newVal && oldVal !== newVal) {
                        $($element).slider($scope.getSliderOptions());
                        if ($scope.layerId) {
                            $scope.mapController.setOpacity($scope.layerId, newVal);
                        }
                    }
                });
                //HACK to give jquery ui slider title text.
                $timeout(function () {
                    $element.find('.ui-slider-handle').attr('title', $scope.titleText);
                });

            },
            transclude: true
        };
    } ]);
})();