/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.layer-interaction-toggle',['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaLayerInteractionToggle
     * @param {string} toggleIconSource - A string value of toggle button's icon URL
     * @param {object} mapController - controller instance for the map
     * @param {string} controllerEmitEventName - event that is fired that passes the controller
     * @param {function} toggleOffCallback - Callback function to be called when toggle button is turns off
     * @param {function()} toggleOnCallback - Callback function to be called when toggle button turns on
     * @param {function} onLayerClickCallBack - Callback function to be called when the map layer is clicked
     * @param {string} layerInteractionId - ID of the layer that this toggle button will interact with
     * @description
     * This control provides a button to toggle interaction with a layer on/off
     * @scope
     * @restrict E
     * @example
     * <example module="layerInteractionToggle">
     * <file name="layerInteractionToggle.html">
     * <div ng-controller="ourMapController">
     *         <div class="toolber">
     <ga-layer-interaction-toggle
     toggle-icon-source="//np.ga.gov.au/gamaps/resources/img/Layers.png"
     controller-emit-event-name="toggleInteractionEvent"
     map-controller="mapController"
     layer-interaction-id="layers[1].id"
     on-layer-click-callback="clickCallback()"
     class="toggleInteractionButton">Toggle Interaction of "{{layers[1].name}}" layer on/off
     </ga-layer-interaction-toggle>
     <ga-layer-control ng-show="toggleInteractionController.isToggleActive()" layer-data="layers[1]" map-controller="mapController" class="alert alert-info"></ga-layer-control>
     </div>
     <div class="alert alert-danger layerClicked">Layer Clicked</div>
     <div id="map" style="width:90%;height:600px"></div>
     <ga-map
     map-element-id="map"
     datum-projection='EPSG:102100'
     display-projection='EPSG:4326'
     center-position='{"lat":"-3434403","lon":"14517578"}'
     zoom-level="4">
     <ga-map-layer
     layer-name="World Image"
     layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
     wrap-date-line="true"
     layer-type="XYZTileCache"
     is-base-layer="true"
     visibility="false">
     </ga-map-layer>
     <ga-map-layer
     layer-name="Earthquake hazard contours"
     layer-type="WMS"
     layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     is-base-layer="false"
     layers="hazardContours"
     background-color="#ffffff">
     </ga-map-layer>
     <ga-map-control map-control-name="mouseposition"></ga-map-control>
     <ga-map-control map-control-name="OverviewMap"></ga-map-control>
     <ga-map-control map-control-name="Permalink"></ga-map-control>
     <ga-map-control map-control-name="ScaleLine"></ga-map-control>
     <ga-map-control map-control-name="panzoombar"></ga-map-control>
     </ga-map>

     * </div>
     * </file>
     *
     * <file name="layerInteractionToggle.js">
     *      var app = angular.module('layerInteractionToggle',
     ['gawebtoolkit.core', 'gawebtoolkit.ui']);
     app.controller("ourMapController",["$scope", function($scope) {
                $scope.$on("mapControllerReady", function(event, args) {
                    $scope.mapController = args;
                    $scope.$on("layersReady", function() {
                        $scope.layers = $scope.mapController.getLayers();
                    });
                });
                $scope.$on("toggleInteractionEvent", function(event, args) {
                    $scope.toggleInteractionController = args;
                    $scope.clickCallback = function() {
                        $(".layerClicked").fadeIn();
                        setTimeout(function() {
                            $(".layerClicked").fadeOut();
                        }, 1000);
                    };
                });
            }]);

     $(".alert-danger")
     .css({
                    "margin-top": "10px",
                    "margin-left": ( ($("#map").width() - $(".alert-danger").width()) / 2 ) + "px"
        });
     * </file>
     *
     * <file name="layerInteractionToggle.css">
     *             #map {
                background-color: #21468b
            }
     .alert-info {
                float: left;
                clear: both;
                min-height: 80px;
                width: 100%;
            }
     .alert-danger {
                position: absolute;
                display: none;
                z-index: 10000;
            }
     .alert label {
                margin-left: 10px;
            }
     .toggleInteractionButton {
                float: left;
            }
     .toolber {
                display: inline-block;
            }
     * </file>
     * </example>
     */
    app.directive('gaLayerInteractionToggle', [ function () {
        return {
            restrict: "E",
            replace: "true",
            templateUrl: 'src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html',
            transclude: true,
            scope: {
                toggleIconSource: '@',
                controllerEmitEventName: '@',
                toggleOnCallback: '&',
                toggleOffCallback: '&',
                onLayerClickCallback: '&',
                mapController: '=',
                layerInteractionId: '='
            },
            controller: ['$scope', function ($scope) {
                var self = this;

                self.activate = function () {
                    $scope.activate();
                };
                self.deactivate = function () {
                    $scope.deactivate();
                };
                self.isToggleActive = function () {
                    return $scope.isToggleOn;
                };

                $scope.$emit($scope.controllerEmitEventName, self);
            }],
            link: function ($scope, $element) {
                $scope.isToggleOn = false;

                $scope.activate = function () {
                    $scope.mapController.registerMapClick(callback);
                    $element.removeClass('gaUiToggleOff');
                    $element.addClass('gaUiToggleOn');
                    $scope.isToggleOn = true;
                    $scope.toggleOnCallback();

                };
                $scope.deactivate = function () {
                    $scope.mapController.unRegisterMapClick(callback);
                    $element.removeClass('gaUiToggleOn');
                    $element.addClass('gaUiToggleOff');
                    $scope.isToggleOn = false;
                    $scope.toggleOffCallback();
                };
                $scope.toggleClicked = function () {
                    $scope.isToggleOn = !$scope.isToggleOn;
                    if ($scope.isToggleOn) {
                        $scope.activate();
                    } else {
                        $scope.deactivate();
                    }
                };

                var callback = function (e) {
                    var xyPoint = $scope.mapController.getPointFromEvent(e);
                    $scope.onLayerClickCallback({
                        point: xyPoint,
                        interactionId: $scope.layerInteractionId
                    });
                };
            }
        };
    } ]);
})();