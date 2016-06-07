var angular = angular || {};
var $ = $ || {};
var ol = ol || {};
var OpenLayers = OpenLayers || {};

var app = angular.module('geowebtoolkit.core.map-directives', [ 'geowebtoolkit.core.map-services', 'geowebtoolkit.core.layer-services' ]);
/**
 * @ngdoc directive
 * @name geowebtoolkit.core.map-directives:geoMap
 * @description
 * ## Overview ##
 * geoMap directive is used to create a map.
 * @param {string|@} mapElementId - The id of the element where the map is to be rendered
 * @param {string|@} datumProjection - A value representing the Datum Projection, eg 'EPSG:4326'
 * @param {string|@} displayProjection - A value representing the Display Projection, eg 'EPSG:4326'
 * @param {string|@=} centerPosition - A lat/lon value in the form of an array, eg [-55,110].
 * @param {number|@=} zoomLevel - An initial zoom value for the map to start at.
 * @param {geoJsonCoordinates|==} initialExtent - An initial extent is the form of a geoJson array of coordinates.
 * @param {string|@} framework - Optional. Default 'olv2'. Specifies which underlying mapping framework to use.
 * @param {bool|@} isStaticMap - Optional. Default to false. Creates the map without navigation/interaction controls.
 * @method addLayer - Adds a layer programmatically
 *
 * @scope
 * @restrict E
 * @example
<example module="simpleMap">
<file name="index.html">
        <style>
            .ol-scale-line {
                left:inherit;
                right:8px;
            }
        </style>
        <h3>OpenLayers v2 with geo-web-toolkit<h3>
        <div id="mapv2"></div>
        <geo-map map-element-id="mapv2" center-position='[130, -25]' zoom-level="4"
                framework="olv2">
            <geo-osm-layer></geo-osm-layer>
            <geo-map-layer
                            layer-name="Australian Topography 2014"
                            layer-type="ArcGISCache"
                            layer-url="http://www.ga.gov.au/gis/rest/services/topography/Australian_Topography_2014_WM/MapServer"
                            is-base-layer="false"
                            visibility="true">
            </geo-map-layer>
            <geo-map-control map-control-name="mouseposition"></geo-map-control>
            <geo-map-control map-control-name="panzoombar"></geo-map-control>
            <geo-map-control map-control-name="OverviewMap"></geo-map-control>
            <geo-map-control map-control-name="ScaleLine"></geo-map-control>
        </geo-map>
        <h3>OpenLayers v3.5.0 with geo-web-toolkit<h3>
        <div id="mapv3"></div>
        <geo-map map-element-id="mapv3" center-position='[130, -25]' zoom-level="4"
                framework="olv3">
            <geo-osm-layer></geo-osm-layer>
            <geo-map-layer
                             layer-name="Australian Topography 2014"
                             layer-type="ArcGISCache"
                             layer-url="http://www.ga.gov.au/gis/rest/services/topography/Australian_Topography_2014_WM/MapServer"
                             is-base-layer="false"
                             visibility="true">
            </geo-map-layer>
            <geo-map-control map-control-name="mouseposition"></geo-map-control>
            <geo-map-control map-control-name="panzoombar"></geo-map-control>
            <geo-map-control map-control-name="OverviewMap"></geo-map-control>
            <geo-map-control map-control-name="ScaleLine"></geo-map-control>
        </geo-map>
</file>
<file name="style.css">
 #mapv2 {width: 650px;height:600px;}
 #mapv3 {width: 650px;height:600px;}
 </file>
<file name="script.js">var app = angular.module('simpleMap',['geowebtoolkit.core']);</file>
</example>
 */
app.directive('geoMap', [ '$timeout', '$compile', 'GeoMapService', 'GeoLayerService', 'GeoDataService', '$q','$log',
	function ($timeout, $compile, GeoMapService, GeoLayerService, GeoDataService, $q, $log) {
    'use strict';
    return {
        restrict: "E",
        scope: {
            mapElementId: '@',
            datumProjection: '@',
            displayProjection: '@',
            centerPosition: '@',
            zoomLevel: '@',
            isStaticMap:'@',
			initialExtent: '=',
            framework:'@',
            existingMapInstance: '='
        },
        controller: ['$scope',function ($scope) {
			$log.info('map creation started...');
            $('#' + $scope.mapElementId).empty();
            //$scope.asyncLayersDeferred = $q.defer();
            //$scope.waitingForNumberOfLayers = 0;
            $scope.initialPositionSet = false;

            $scope.layerPromises = [];
            $scope.layerDtoPromises = [];
            var self = this;
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#addLayer
             * @description
             * Adds a layer to the underlying mapInstance calling the appropriate implementation specific service.
             * @param {*} layer - An implementation object for a layer, eg an olv2 layer object
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @return {Layer} - layer object representing implementation.
             * @example
             * <code><pre>
             *     var args {
             *      layerName: 'foo',
             *      layerUrl: 'http://wmsserver/wmsaddress',
             *		layers: 'comma, separated, list of, layers',
             *		layerType: 'WMS'
             * }
             * var layer = $scope.mapController.createLayer(args);
             * var dto = $scope.mapController.addLayer(layer);</pre></code>
             * */
            self.addLayer = function (layer) {
                var deferredAll = $q.defer();
                var deferredLayer = $q.defer();
				if(layer.then !== null && typeof layer.then === 'function') {
                    deferredAll = layer;
					if ($scope.layersReady) {
                        layer.then(function (resultLayer) {
                            if(resultLayer == null) {
                                //Failed to load, skip
                                //Lower layer throws error with data
                                $log.info("failed to load layer");
                            } else {
                                var layerDto = GeoMapService.addLayer($scope.mapInstance, resultLayer, $scope.framework);
                                deferredLayer.resolve(layerDto);
                                //Layers added late in the cycle take care of updating order of layers.
                                $scope.$emit('layerAdded', layerDto);
                            }
						});
					} else {
						$scope.layerPromises.push(deferredAll);
                        $scope.layerDtoPromises.push(deferredLayer);
					}
				}else {
					if ($scope.layersReady) {
						//$log.info(layer);
						var layerDto = GeoMapService.addLayer($scope.mapInstance, layer, $scope.framework);
                        deferredLayer.resolve(layerDto);
						$scope.$emit('layerAdded', layerDto);
					} else {

						$scope.layerPromises.push(deferredAll.promise);
                        $scope.layerDtoPromises.push(deferredLayer);
                        //Wait for digest
                        deferredAll.resolve(layer);
					}
				}
                return deferredLayer.promise;
            };

            var initialMarkerLayers = [];
            $scope.deferredMarkers = [];

            self.addMarkerLayer = function(layer, groupName) {
                  if(!groupName) {
                      return self.addLayer(layer);
                  } else {
                      initialMarkerLayers.push(groupName);
                      var foundExistingGroup = false;
                      var markerLayer;
                      for (var i = 0; i < initialMarkerLayers.length; i++) {
                          markerLayer = initialMarkerLayers[i];
                          if(markerLayer === groupName) {
                              foundExistingGroup = true;
                              break;
                          }
                      }

                      if(!foundExistingGroup) {
                          return self.addLayer(layer);
                      } else {
                          if (!$scope.layersReady) {
                              var initDeferred = $q.defer();
                              $scope.deferredMarkers.push(initDeferred);
                              return initDeferred.promise;
                          } else {
                              var deferred = $q.defer();
                              deferred.resolve();
                              return deferred.promise;
                          }

                      }
                  }
            };

            self.getMapOptions = function () {
                return  {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
            };

            self.createLayer = function(layerArgs) {
                var layerOptions = GeoLayerService.defaultLayerOptions(layerArgs,$scope.framework);
                return GeoLayerService.createLayer(layerOptions,$scope.framework);
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#zoomToMaxExtent
             * @description
             * Zooms to the maximum extent of the map
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @example
             * <example module="zoomToMax">
             * <file name="zoomToMax.html">
             * <div ng-controller="zoomToMax">
             * <a class="btn btn-primary" ng-click="mapController.zoomToMaxExtent()">Zoom to Max</a>
             * <div id="zoomToMax"></div>
             * <geo-map map-element-id="zoomToMax" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer></geo-osm-layer>
             * <geo-map-control map-control-name="mouseposition"></geo-map-control>
             * </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="zoomToMaxJS.js">
             * angular.module("zoomToMax",['geowebtoolkit.core'])
             * .controller("zoomToMax", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * })
             * }]);
             * </file>
             * <file name="zooToMax.css">
             * #zoomToMax {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.zoomToMaxExtent = function () {
                GeoMapService.zoomToMaxExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#currentZoomLevel
             * @description
             * Gets the current zoom level of the map
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @return {Number} - Zoom level.
             * @example
             * <example module="currentZoomLevel">
             * <file name="currentZoomLevel.html">
             * <div ng-controller="currentZoomLevel">
             * <a class="btn btn-primary" ng-click="currentZoomLevel = mapController.currentZoomLevel()">Get the current zoom level : <span ng-model="currentZoomLevel" class="bg-primary">{{currentZoomLevel}}</span></a>
             * <div id="currentZoomLevel"></div>
             * <geo-map map-element-id="currentZoomLevel" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer></geo-osm-layer>
             * <geo-map-control map-control-name="mouseposition"></geo-map-control>
             * </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="currentZoomLevel.js">
             * angular.module("currentZoomLevel",['geowebtoolkit.core'])
             * .controller("currentZoomLevel", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * })
             * }]);
             * </file>
             * <file name="currentZoomLevel.css">
             * #currentZoomLevel {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.currentZoomLevel = function () {
                return GeoMapService.currentZoomLevel($scope.mapInstance, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#registerMapMouseMove
             * @description
             * Registers a mouse movement event and calls provided callback.
             * Event details coming back will be implementation specific
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {function} callback - callback function that fires when the mouse move event occurs.
             * @example
             * <example module="mapMouseMove">
             * <file name="mapMouseMove.html">
             * <div ng-controller="ourMapController">
                <div id="toolbar">
                    <a class="btn btn-primary" ng-click="toggleMouseMoveRegistration($event)">{{registerMouseMapMoveButton}}</a>
                    <span class="alert alert-danger messagebox">
                        {{mouseMoveStatus}}</span>
                </div>

                <div id="mapMouseMove"></div>
                <geo-map
                    map-element-id="mapMouseMove"
                    center-position='[130, -25]'
                zoom-level="4">
                <geo-osm-layer></geo-osm-layer>
                <geo-map-layer
                    layer-name="Topographic" 
                    layer-type="WMS"
                    layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                    is-base-layer="false"
                    layers="hazardContours"
                    background-color="#ffffff">
                </geo-map-layer>
            </geo-map>
            </div>
             * </div>
             * </file>
             * <file name="mapMouseMove.js">
             * var app = angular.module('mapMouseMove', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.registerMouseMapMoveButton = "Register mouse move"
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseMoveStatus = "mouseMoveStatus";
                        $scope.toggleMouseMoveRegistration = function(e) {
                            $scope.mouseMoveRegistered = true;
                            $scope.mapController.registerMapMouseMove(function() {
                                $scope.mouseMoveStatus = "Mouse moving";
                                $scope.$apply();
                            });
                            angular.element(e.target).attr("disabled", true);
                        };
                    });
                }]);
             * </file>
             * <file name="ourMapController.css">
             *  #mapMouseMove {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.registerMapMouseMove = function (callback) {
                GeoMapService.registerMapMouseMove($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#registerMapMouseMoveEnd
             * @description
             * Registers an event callback with mapInstance when the mouse stops moving over the map
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {function} callback - callback function that fires when the mouse move end event occurs.
             * @example
             * <example module="mapMouseMoveEnd">
             * <file name="mapMouseMoveEnd.html">
             * <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="toggleMouseMoveRegistration($event)">Enable mouse move end track</a>
                        <span class="alert alert-danger messagebox">
                            {{registrationStatus + " | " + mouseMoveStatus}}</span>
                    </div>

                    <div id="mapMouseMoveEnd"></div>
                    <geo-map
                        map-element-id="mapMouseMoveEnd"
                        center-position='[130, -25]'
                        zoom-level="4">
                        <geo-osm-layer></geo-osm-layer>
                        <geo-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </geo-map-layer>
                    </geo-map>
                </div>

             * </file>
             * 
             * <file name="mapMouseMoveEnd.js">
             * var app = angular.module('mapMouseMoveEnd', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.registrationStatus = "Click on the button";
                        $scope.mouseMoveStatus = "mouseMoveStatus";
                        $scope.toggleMouseMoveRegistration = function(e) {
                            $scope.registrationStatus = "Click and drag the map";
                            $scope.mapController.registerMapMouseMoveEnd(function() {
                                $scope.mouseMoveStatus = "Mouse move end";
                                setTimeout(function () {
                                    $scope.mouseMoveStatus = "mouseMoveStatus";
                                    $scope.$apply();
                                }, 1000);
                                $scope.$apply();
                            });
                            angular.element(e.target).attr("disabled", true);
                        };
                    });
                }]);
             * </file>
             * 
             * <file name="mapMouseMoveEnd.css">
             *  #mapMouseMoveEnd {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }

             * </file>
             * 
             * </example>
             * */
            self.registerMapMouseMoveEnd = function (callback) {
                GeoMapService.registerMapMouseMoveEnd($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#registerMapClick
             * @description
             * Registers an event that will fire when the rendered map is clicked.
             * Event details coming back will be implementation specific
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {function} callback - callback function that fires when the map is clicked.
             * @example
             * <example module="mouseMapClick">
             * <file name="mouseMapClick.html">
             * <div ng-controller="ourMapController">
             *      <div id="toolbar">
                        <a class="btn btn-primary" ng-click="toggleMouseClickRegistration($event)">{{mouseMapClickButton}}</a>
                        <span class="alert alert-danger messagebox">
                            {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                    </div>
            
                    <div id="mouseMapClick"></div>
                    <geo-map
                        map-element-id="mouseMapClick"
                        center-position='[130, -25]'
                        zoom-level="4">
                    <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
                    <geo-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </geo-map-layer>
                </geo-map>
             * </div>
             * </file>
             * <file name="mouseMapClick.js">
             * var app = angular.module('mouseMapClick', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.mouseMapClickButton = "Register mouse click";
                        $scope.toggleMouseClickRegistration = function(e) {
                                $scope.mouseClickStatus = "Map click registered";
                                angular.element(e.target).attr("disabled", "");
                                $scope.mapController.registerMapClick(mapClickCallback);
                            };

                        var mapClickCallback = function() {
                            $scope.mouseClickMsg = "Map Clicked";
                            setTimeout(function() {
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.$apply();
                            }, 1000);
                            $scope.$apply();
                        };
                    });
                }]);
             * </file>
             * <file name="mouseMapClick.css">
             *  #mouseMapClick {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.registerMapClick = function (callback) {
                GeoMapService.registerMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#unRegisterMapClick
             * @description
             * Unregisters a map click event from the map instance.
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {function} callback - callback function that was originally registered.
             * @example
             * <example module="unRegisterMouseMapClick">
             * <file name="unRegisterMouseMapClick.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="unRegisterMouseClickRegistration($event)">{{registerMapClickButton}}</a>
                        <span class="alert alert-danger messagebox">
                            {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                    </div>
                    <div id="unRegisterMouseMapClick"></div>
                <geo-map
                    map-element-id="unRegisterMouseMapClick"
                    center-position='[130, -25]'
                    zoom-level="4">
                    <geo-osm-layer></geo-osm-layer>
                    <geo-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </geo-map-layer>
                </geo-map>
            </div>
             * </file>
             * <file name="unRegisterMouseMapClick.js">
             *  var app = angular.module('unRegisterMouseMapClick', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.registerMapClickButton = "Register map click";
                        $scope.unRegisterMouseClickRegistration = function() {
                            if(!$scope.mouseClickRegistered) {
                                $scope.mouseClickStatus = "Map click registered";
                                $scope.mouseClickRegistered = true;
                                $scope.registerMapClickButton = "Unregister Map Click";
                                $scope.mapController.registerMapClick(unRegisterMapClickCallback);
                            }

                            else {
                                $scope.mouseClickStatus = "Map click not registered";
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.mouseClickRegistered = false;
                                $scope.registerMapClickButton = "Register Map Click";
                                $scope.mapController.unRegisterMapClick(unRegisterMapClickCallback);
                            }
                        };
                        var unRegisterMapClickCallback = function() {
                            $scope.mouseClickMsg = "Map Clicked";
                            setTimeout(function() {
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.$apply();
                            }, 1000)
                            $scope.$apply();
                        };
                    });
                }]);
             * </file>
             * <file name="unRegisterMouseMapClick.css">
             * #unRegisterMouseMapClick {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.unRegisterMapClick = function (callback) {
                GeoMapService.unRegisterMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#addControl
             * @description
             * Creates and adds a control to the map instance
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} controlName - the name of the type of control to be created
             * @param {Object} controlOptions - an objet with implementation specific controlOptions
             * @param {string=} elementId - a DOM element to add the control to.
             * @param {string=} controlId - An id to help interact with the control when using 'ById' methods
             * @example
             * <example module="addOurControl">
             * <file name="addOurControl.html">
             * <div ng-controller="addOurControl">
             *      <a class="btn btn-primary" ng-click="addOurControl()">Add Control</a>
             *      <div id="addOurControl"></div>
             *      <geo-map map-element-id="addOurControl"
             *              center-position='[130, -25]'
             *              zoom-level="4">
             *          <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             *      </geo-map>
             * </div>
             * </file>
             * <file name="addOurControl.js">
             * angular.module("addOurControl",['geowebtoolkit.core'])
             *  .controller("addOurControl", ["$scope", function($scope) {
             *      $scope.$on("mapControllerReady", function(event, args) {
             *          $scope.mapController = args;
             *          $scope.addOurControl = function() {
             *          $scope.mapController.addControl("panzoombar");
             *      }
             *  })
             * }]);
             * </file>
             * <file name="addOurControl.css">
             * #addOurControl {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.addControl = function (controlName, controlOptions, elementId, controlId) {
                return GeoMapService.addControl($scope.mapInstance, controlName, controlOptions, elementId, controlId, self.getMapOptions(), $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getLonLatFromPixel
             * @description
             * Gets a latlon object from implementation service
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {Number} x - number of pixels from the left of the div containing the map
             * @param {Number} y - number of pixels from the top of the div containing the map
             * @param {string} projection - a projection to convert to from the maps projection
             * @return {LonLat} An object containing Latitude and Longitude in the projection of the map
             * @example
             * <code><pre>var lonLat = mapController.getLonLatFromPixel(200,500)
             * // eg, lonLat equals lat: -30.967, lon: 108.552</pre></code>
             * <example module="getLonLat">
             * <file name="getLonLat.html">
             * <div ng-controller="ourMapController">
             *   <div id="toolbar">
             *       <a class="btn btn-primary" ng-click="toggleMouseClickRegistration($event)">{{registerMapClickButton}}</a>
             *       <span ng-show="isMapClickRegistered" class="alert alert-danger messagebox">
             *           {{mouseClickStatus + " | " + mouseClickMsg}}</span>
             *   </div>
             *   <div id="getLonLat"></div>
             *   <geo-map
             *       map-element-id="getLonLat"
             *       center-position='[130, -25]'
             *       zoom-level="4">
             *       <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             *       <geo-map-layer
             *           layer-name="Topographic"
             *           layer-type="WMS"
             *           layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
             *           is-base-layer="false"
             *           layers="hazardContours">
             *       </geo-map-layer>
             *   </geo-map>
             * </div>
             * </file>
             * <file name="getLonLat.js">
             *  var app = angular.module('getLonLat', ['geowebtoolkit.core']);
             *   app.controller('ourMapController',['$scope', function ($scope) {
             *       $scope.mouseMoveRegistered = false;
             *       $scope.$on('mapControllerReady', function(event,args) {
             *           $scope.mapController = args;
             *           $scope.mouseClickStatus = "mouseClickStatus";
             *           $scope.mouseClickMsg = "mouseClickMsg";
             *           $scope.registerMapClickButton = "Register map click";
             *           $scope.toggleMouseClickRegistration = function(e) {
             *                   $scope.isMapClickRegistered = true;
             *                   $scope.mouseClickStatus = "Map click registered";
             *                   angular.element(e.target).attr("disabled", "");
             *                   $scope.mapController.registerMapClick(mapClickCallback);
             *               };
             *
             *           var mapClickCallback = function(e) {
             *               var x = e.pageX - $('#getLonLat').offset().left
             *               var y = e.pageY - $('#getLonLat').offset().top
             *               var LonLatObj = $scope.mapController.getLonLatFromPixel(x, y);
             *               $scope.mouseClickMsg = "Longitude: " + LonLatObj.lon + " | Latitude: " + LonLatObj.lat;
             *               $scope.$apply();
             *           };
             *       });
             *   }]);
             * </file>
             * <file name="getLonLat.css">
             *  #getLonLat {
                    width:600px;
                    height:500px;
                    display: inline-block
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.getLonLatFromPixel = function (x, y, projection) {
                return GeoMapService.getLonLatFromPixel($scope.mapInstance, x, y, projection, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getPixelFromLonLat
             * @description
             * Gets a latlon object from implementation service
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {Number} lon - The latitude of the location to transform
             * @param {Number} lat - The longitude of the location to transform
             * @return {Point} - An object containing Latitude and Longitude in the projection of the map
             * @example <code><pre>var point = mapController.getPixelFromLonLat(-20,-100);
             * // eg, point equals x: 25, y: 63</pre></code>
             * */
            self.getPixelFromLonLat = function (lon, lat) {
                return GeoMapService.getPixelFromLonLat($scope.mapInstance, lon, lat, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getPointFromEvent
             * @description
             * Extracts a point from an event coming from implementation service layer.
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {Object} event - An event from implementation, eg OpenLayers,
             * worked out from number of pixels from the left of the div containing the map
             * @return {Point} - A point object extracted from the event.
             * */
            self.getPointFromEvent = function (event) {
                return GeoMapService.getPointFromEvent(event, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getLayers
             * @description
             * Gets all the layers currently associated with the map instance
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayers">
             * <file name="dumpLayers.html">
             * <div ng-controller="dumpLayers">
             *      <a class="btn btn-primary" ng-click="dumpLayers()">Dump layers object to console</a>
             *      <div id="dumpLayers"></div>
             *      <geo-map map-element-id="dumpLayers" center-position='[130, -25]' zoom-level="4">
             *              <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             *      </geo-map-layer>
             *      </geo-map>
             * </div>
             * </file>
             * <file name="dumpLayers.js">
             * angular.module("dumpLayers",['geowebtoolkit.core'])
             * .controller("dumpLayers", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.dumpLayers = function() {
             * console.log( $scope.mapController.getLayers() );
             * }
             * })
             * }]);
             * </file>
             * <file name="dumpLayers.css">
             * #dumpLayers {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.getLayers = function () {
                return GeoMapService.getLayers($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getLayersByName
             * @description
             * Finds and returns the layer's details by its name
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} LayerName - The name of the layer, which is defined on geoMapLayer directive
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayersByName">
             * <file name="dumpLayersByName.html">
             * <div ng-controller="dumpLayersByName">
             * <a class="btn btn-primary" ng-click="dumpLayersByName()">Dump base layer's details object to console</a>
             * <div id="dumpLayersByName"></div>
             * <geo-map map-element-id="dumpLayersByName" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             * </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="dumpLayersByName.js">
             * angular.module("dumpLayersByName",['geowebtoolkit.core'])
             * .controller("dumpLayersByName", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.dumpLayersByName = function() {
             * console.log( $scope.mapController.getLayersByName("Simple map layer name") );
             * }
             * })
             * }]);
             * </file>
             * <file name="dumpLayersByName.css">
             * #dumpLayersByName {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.getLayersByName = function (layerName) {
                return GeoMapService.getLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#zoomToLayer
             * @description
             * If possible, performs an action to zoom in on the extent of a layer associated with Id
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} layerId - Id of the layer to zoom too.
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="zoomToLayer">
             * <file name="zoomToLayer.html">
             * <div ng-controller="zoomToLayer">
             * <a class="btn btn-primary" ng-click="zoomToLayer()">Zoom to base layer extent</a>
             * <div id="zoomToLayer"></div>
             * <geo-map map-element-id="zoomToLayer" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             * </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="zoomToLayer.js">
             * angular.module("zoomToLayer",['geowebtoolkit.core'])
             * .controller("zoomToLayer", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.zoomToLayer = function() {
             * var baseLayerId = $scope.mapController.getLayers()[0].id;
             * $scope.mapController.zoomToLayer( baseLayerId );
             * }
             * })
             * }]);
             * </file>
             * <file name="zoomToLayer.css">
             * #zoomToLayer {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.zoomToLayer = function (layerId) {
                GeoMapService.zoomToLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getMapProjection">
             * <file name="getProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getProjection()">Get Projection: {{projection}}</a>
                    </div>
                    <div id="getMapProjection"></div>
                    <geo-map
                        map-element-id="getMapProjection"
                        center-position='[130, -25]'
                        zoom-level="4">
                        <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
                        <geo-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </geo-map-layer>
                    </geo-map>
                </div>
             * </file>
             * <file name="getProjection.js">
             *  var app = angular.module('getMapProjection', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                    });
                }]);
             * </file>
             * <file name="getProjection.css">
             *  #getMapProjection {
                    width: 600px;
                    height:500px;
                    display: inline-block;
                }
                #toolbar {
                   padding: 0;
                   float: left;
                }
                #toolbar > * {
                   float: left;
                }
                .btn {
                   margin: 5px 20px;
                }
             * </file>
             * </example>
             * */
            self.getProjection = function () {
                return GeoMapService.getProjection($scope.mapInstance,self.getFrameworkVersion());
            };
            /**
             *
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#getDisplayProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getDisplayProjection">
             * <file name="getDisplayProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getDisplayProjection()">Get Display Projection: {{projection}}</a>
                    </div>
                    <div id="getDisplayProjection"></div>
                    <geo-map
                        map-element-id="getDisplayProjection"
                        center-position='[130, -25]'
                        zoom-level="4">
                        <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
                        <geo-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </geo-map-layer>
                    </geo-map>
                </div>
             * </file>
             * <file name="getDisplayProjection.js">
             *  var app = angular.module('getDisplayProjection', ['geowebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                    });
                }]);
             * </file>
             * <file name="getProjection.css">
             *  #getDisplayProjection {
                    width: 600px;
                    height:500px;
                    display: inline-block;
                }
                #toolbar {
                   padding: 0;
                   float: left;
                }
                #toolbar > * {
                   float: left;
                }
                .btn {
                   margin: 5px 20px;
                }
             * </file>
             * </example>
             * */
            self.getDisplayProjection = function () {
                return GeoMapService.getDisplayProjection($scope.mapInstance, self.getFrameworkVersion());
            };

            self.getSize = function () {
                return GeoMapService.getSize($scope.mapInstance, self.getFrameworkVersion());
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#setLayerVisibility
             * @description
             * Changes the associated layerId visibility
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} layerId - Id of the layer
             * @param {boolean} visibility - Boolean indicating if the layer should be hidden(false) or shown(true)
             * @example
             * <example module="setVisibility">
             * <file name="setVisibility.html">
             * <div ng-controller="setVisibility">
             * <input type="checkbox" ng-model="layerVisibility" ng-change="setVisibility()" /> Toggle base layer visibility on/off
             * <div id="setVisibility"></div>
             * <geo-map map-element-id="setVisibility" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             * <geo-map-control map-control-name="mouseposition"></geo-map-control>
             * </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="setVisibility.js">
             * angular.module("setVisibility",['geowebtoolkit.core'])
             * .controller("setVisibility", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.$on('layersReady', function() {
             * $scope.layerVisibility = $scope.mapController.getLayers()[0].visibility;
             * });
             * $scope.setVisibility = function() {
             * $scope.mapController.setLayerVisibility($scope.mapController.getLayers()[0].id, $scope.layerVisibility);
             * }
             * })
             * }]);
             * </file>
             * <file name="setVisibility.css">
             * #setVisibility {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.setLayerVisibility = function (layerId, visibility) {
                GeoMapService.setLayerVisibility($scope.mapInstance, layerId, visibility, $scope.framework);
            };

            /**
             * Creates a bounding box and returns an implementation specific object
             *
             * @param lonLatArray {geoJsonCoordinates}
             * @return {Object}
             * */
            self.createBoundingBox = function (lonLatArray) {
                return GeoMapService.createBoundingBox($scope.mapInstance, lonLatArray, $scope.framework);
            };
            /**
             * Creates a bounding object and returns an implementation specific object
             * Implementation to extend bounding box to encompass all LonLat's provided.
             *
             * @param geoJsonCoordinates {geoJsonCoordinates}
             * @param projection {string}
             * @return {Object}
             * */
            self.createBounds = function (geoJsonCoordinates, projection) {
                return GeoMapService.createBounds($scope.mapInstance, geoJsonCoordinates, projection, $scope.framework);
            };
            /**
             * Zooms map to bounds around provided LonLat array
             *
             * @param lonLatArray {LonLat[]} - array of LonLat to build a bounds to zoom too.
             * */
            self.zoomToExtent = function (lonLatArray) {
                GeoMapService.zoomToExtent($scope.mapInstance, lonLatArray, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#zoomTo
             * @description
             * Sets the zoom level of the map
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {number} zoomLevel - A number value to be used as zoom level

             * @example
             * <example module="setZoomLevel">
             * <file name="setZoomLevel.html">
             * <div ng-controller="setZoomLevel">
             * <input placeholder="0-19" type="number" ng-model="zoomLevel" style="width: 50px" /><a class="btn btn-primary" ng-click="setZoomLevel()">  Set zoom level to {{zoomLevel}}</a>
             * <div id="setZoomLevel"></div>
             * <geo-map map-element-id="setZoomLevel" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="setZoomLevel.js">
             * angular.module("setZoomLevel",['geowebtoolkit.core'])
             * .controller("setZoomLevel", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.setZoomLevel = function() {
             * $scope.mapController.zoomTo($scope.zoomLevel);
             * }
             * })
             * }]);
             * </file>
             * <file name="setZoomLevel.css">
             * #setZoomLevel {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.zoomTo = function (zoomLevel) {
                GeoMapService.zoomTo($scope.mapInstance, zoomLevel, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#setBaseLayer
             * @description
             * Changes the current base layer to the layer associated with the Id provided
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} layerId - id of the new base layer.
             * @example
             * <example module="setBaseLayer">
             * <file name="setBaseLayer.html">
             * <div ng-controller="ourMapController">
                <select
                    id="selectBaseLayer"
                    ng-model="selectedBaseLayer"
                    ng-change="mapController.setBaseLayer(selectedBaseLayer)"
                    ng-options="baseLayer.id as baseLayer.name for baseLayer in baseLayers"></select>
                <div id="setBaseLayer"></div>
                <geo-map
                    map-element-id="setBaseLayer"
                    center-position='[130, -25]'
                    zoom-level="4">
                    <geo-map-layer
                        layer-name="World Image"
                        layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
                        wrap-date-line="true"
                        layer-type="XYZTileCache"
                        is-base-layer="true"
                        visibility="false">
                    </geo-map-layer>
                    <geo-map-layer
                        layer-name="World Political Boundaries" 
                        layer-url="http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer" 
                        wrap-date-line="true" 
                        layer-type="XYZTileCache"
                        is-base-layer="true"
                        visibility="false">
                    </geo-map-layer>
                    <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
                    </geo-map-layer>
                    <geo-map-layer
                        layer-name="Earthquake hazard contours" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </geo-map-layer>
                </geo-map>
               </div>
             * </file>
             * <file name="setBaseLayer.js">
             * var app = angular.module('setBaseLayer',
                ['geowebtoolkit.core']);
                app.controller("ourMapController",["$scope", function($scope) {
                    $scope.$on("mapControllerReady", function(event, args) {
                        $scope.mapController = args;
                        $scope.$on("layersReady", function() {
                            $scope.layers = $scope.mapController.getLayers();
                            $scope.baseLayers = $scope.layers.filter(function(layer) {
                                return $scope.mapController.isBaseLayer(layer.id);
                            });
                            $scope.selectedBaseLayer = $scope.baseLayers[0].id;
                        });
                    });
                }]);
             * </file>
             * <file name="setBaseLayer.css">
             *  #setBaseLayer {
                    background-color: #21468b;
                    margin-top: 10px !important;
                    width: 600px;
                    height: 500px;
                }
             * </file>
             * </example>
             * */
            self.setBaseLayer = function (layerId) {
                GeoMapService.setBaseLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#setCenter
             * @description
             * Changes the centred position of the map to the provided lat, lon
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {Number} lat - Latitude value to move the view too.
             * @param {Number} lon - Longitude value to move the view too.
             * @param {String} projection - Projection of {LonLat}
             * @example
             * <example module="setCenterPosition">
             * <file name="setCenterPosition.html">
             * <div ng-controller="setCenterPosition">
             * <a class="btn btn-primary" ng-click="setCenterPosition()">Move to Australia</a>
             * <div id="setCenterPosition"></div>
             * <geo-map map-element-id="setCenterPosition" zoom-level="4" display-projection="EPSG:4326" datum-project="EPSG:3857" framework="olv3">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="setCenterPosition.js">
             * angular.module("setCenterPosition",['geowebtoolkit.core'])
             * .controller("setCenterPosition", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.setCenterPosition = function() {
             * $scope.mapController.setCenter(-25, 130);
             * $scope.mapController.zoomTo(4);
             * }
             * })
             * }]);
             * </file>
             * <file name="setCenterPosition.css">
             * #setCenterPosition {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.setCenter = function (lat, lon, projection) {
                GeoMapService.setCenter($scope.mapInstance, lat, lon, projection, $scope.framework);
            };

            self.getInitialExtent = function () {
                return $scope.initialExtent;
            };

            self.resetInitialExtent = function () {
                var args = {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };

                GeoMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework);
            };

            self.setInitialPositionAndZoom = function () {

                var args = {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
                if (!$scope.centerPosition) {
                    $scope.centerPosition = {
                        lon: 0,
                        lat: 0
                    };
                }
                if (!$scope.initialPositionSet) {
                    GeoMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework);
                }

                $scope.initialPositionSet = true;
            };

            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#isBaseLayer
             * @description
             * Returns true if layer with the associated Id is a base layer
             * @param {string} layerId - Id of the layer
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @example
             * <code><pre>anogular.module("ourMapApp", ["geowebtoolkit.core"])
             * .controller("ourAppController",["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function (event, args) {
             * $scope.mapController = args;
             * var layerId = $scope.mapController.getLayers[0].id;
             * isLayerBaseLayer = $scope.mapController(layerId);
             * });
             * }]);</pre></code>
             * <example module="checkBaseLayer">
             * <file name="checkBaseLayer.html">
             * <div ng-controller="checkBaseLayerController">
             * <a class="btn btn-primary" ng-click="chklayer1 = checklayer(0)">  Check base layer : {{chklayer1}}</a>
             * <a class="btn btn-primary" ng-click="chklayer2 = checklayer(1)">  Check base layer : {{chklayer2}}</a>
             * <div id="checkBaseLayer"></div>
             * <geo-map map-element-id="checkBaseLayer" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             *<geo-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="checkBaseLayer.js">
             * angular.module("checkBaseLayer",['geowebtoolkit.core'])
             * .controller("checkBaseLayerController", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.checklayer = function(layerNumber) {
             * layerId = $scope.mapController.getLayers()[layerNumber].id;
             * chklayer = $scope.mapController.isBaseLayer(layerId);
             * return chklayer;
             * }
             * })
             * }]);
             * </file>
             * <file name="checkBaseLayer.css">
             * #checkBaseLayer {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.isBaseLayer = function (layerId) {
                return GeoMapService.isBaseLayer($scope.mapInstance, layerId, $scope.framework);
            };

            /**
             * @deprecated
             * Returns the map instance
             *
             * @return {Object}
             * */
            self.getMapInstance = function () {
                return $scope.mapInstance;
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#setOpacity
             * @description 
             * Changes the opacity of the associated layer to the value provided (Number between 0 and 1.0
             * <br>This function only works on non-base layers
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             * @param {string} layerId - Id of the layer
             * @param {Number} opacity - Value between 0 and 1.0 representing the layer's new opacity.
             * @example
             * <example module="setOpacity">
             * <file name="setOpacity.html">
             * <div ng-controller="setOpacityController">
             * <input placeholder="0-1" type="number" ng-model="opacityLevel" style="width: 50px; height: auto;" /><a class="btn btn-primary" ng-click="setOpacityLevel()">  Set top layer's opacity to {{opacityLevel}}</a>
             * <div id="setOpacity"></div>
             * <geo-map map-element-id="setOpacity" center-position='[130, -25]' zoom-level="4">
             * <geo-osm-layer layer-name="Simple map layer name"></geo-osm-layer>
             *<geo-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </geo-map-layer>
             * </geo-map>
             * </div>
             * </file>
             * <file name="setOpacityLevel.js">
             * angular.module("setOpacity",['geowebtoolkit.core'])
             * .controller("setOpacityController", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.$on("layersReady", function() {
             * $scope.baseLayerId = $scope.mapController.getLayers()[1].id;
             * })
             * $scope.setOpacityLevel = function() {
             * $scope.mapController.setOpacity($scope.baseLayerId, $scope.opacityLevel);
             * }
             * })
             * }]);
             * </file>
             * <file name="setOpacity.css">
             * #setOpacity {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>             
             * */
            self.setOpacity = function (layerId, opacity) {
                GeoMapService.setOpacity($scope.mapInstance, layerId, opacity, $scope.framework);
            };
            /**
             * Returns the map element Id that was originally passed to geoMap
             *
             * @return {string}
             * */
            self.getMapElementId = function () {
                return GeoMapService.getMapElementId($scope.mapInstance,$scope.framework);
            };
            /**
             * @ngdoc method
             * @name geowebtoolkit.core.map-directives:geoMap#setMapMarker
             * @description
             * Adds a marker to an existing marker group/layer or creates a new group/layer to add
             * the marker too.
             * @methodOf geowebtoolkit.core.map-directives:geoMap
             *
             * @param {Point} point - screen point to place the marker
             * @param {string} markerGroupName - group name associated with the new marker
             * @param {string} iconUrl - A url to the desired icon for the marker
             * @param {Object} args - Contains properties 'width' and 'height' for deinfining the size of a the marker
             * @returns {Object} Marker ID and group name.
             * */
            self.setMapMarker = function (point, markerGroupName, iconUrl, args) {
                return GeoMapService.setMapMarker($scope.mapInstance, point, markerGroupName, iconUrl, args, $scope.framework);
            };

            self.removeMapMarker = function(markerId) {
                GeoMapService.removeMapMarker($scope.mapInstance, markerId, $scope.framework);
            };

            /**
             * Removes the first layer found that matches the name provided
             *
             * @param layerName {string} - Name of a named layer
             *
             * */
            self.removeLayerByName = function (layerName) {
                GeoLayerService.removeLayerByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes all layers matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * */
            self.removeLayersByName = function (layerName) {
                GeoLayerService.removeLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes layer by reference to a layer object
             *
             * @deprecated
             * */
            self.removeLayer = function (layerInstance) {
                GeoLayerService.removeLayer($scope.mapInstance, layerInstance, $scope.framework);
            };

            /**
             * Removed layer by id
             * @param layerId {string} - Id of a layer to remove
             * */
            self.removeLayerById = function (layerId) {
                GeoLayerService.removeLayerById($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * Gets the count of markers of the first layer matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * @return {Number}
             * */
            self.getMarkerCountForLayerName = function (layerName) {
                return GeoLayerService.getMarkerCountForLayerName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Draws a polyline on the map provided an array of LatLons on a new layer of the provided name.
             *
             * @param layerName {string} - Name of the new layer to draw on.
             * @param points {LonLat[]} - Array of LonLat to draw.
             * */
            self.drawPolyLine = function (points, layerName) {
                GeoMapService.drawPolyLine($scope.mapInstance, points, layerName, $scope.framework);
            };
            
            self.startRemoveSelectedFeature = function (layerName) {
                return GeoMapService.startRemoveSelectedFeature($scope.mapInstance, layerName, $scope.framework);
            };

            self.stopRemoveSelectedFeature = function () {
                return GeoMapService.stopRemoveSelectedFeature($scope.mapInstance, $scope.framework);
            };
            
            self.removeFeature = function (layerName, feature) {
                return GeoMapService.removeFeature($scope.mapInstance, layerName, feature, $scope.framework);
            };

            self.startDrawingOnLayer = function (layerName, args) {
                return GeoMapService.startDrawingOnLayer($scope.mapInstance,layerName, args,$scope.framework);
            };

            self.stopDrawing = function () {
                return GeoMapService.stopDrawing($scope.mapInstance,$scope.framework);
            };
            
            self.drawLabel = function (layerName, args) {
                return GeoMapService.drawLabel($scope.mapInstance, layerName, args, $scope.framework);
            };   
            
            self.drawLabelWithPoint = function (layerName, args) {
                return GeoMapService.drawLabelWithPoint($scope.mapInstance, layerName, args, $scope.framework);
            };           

            self.isControlActive = function (controlId, controlName) {
                return GeoMapService.isControlActive($scope.mapInstance, controlId,controlName, $scope.framework);
            };

            self.getLayersByWMSCapabilities = function(url) {
                return GeoDataService.getLayersByWMSCapabilities(url, $scope.framework);
            };

            self.getWMSFeatures = function (url, layerNames, wmsVersion, pointEvent, contentType) {
                return GeoDataService.getWMSFeatures($scope.mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, $scope.framework);
            };

            self.getWMSFeaturesByLayerId = function (url, layerId, pointEvent) {
                return GeoDataService.getWMSFeaturesByLayerId($scope.mapInstance,url, layerId, pointEvent,$scope.framework);
            };

            /**
             * TBC
             * */
            self.registerFeatureSelected = function (layerId, callback, element) {
                return GeoLayerService.registerFeatureSelected($scope.mapInstance, layerId, callback, element, $scope.framework);
            };

			self.getFeatureInfo = function (url,featureType, featurePrefix, geometryName, point, tolerance) {
				return GeoMapService.getFeatureInfo($scope.mapInstance, url,featureType, featurePrefix, geometryName, point, tolerance, $scope.framework);
			};

			self.getFeatureInfoFromLayer = function (layerId, point,tolerance) {
				return GeoMapService.getFeatureInfoFromLayer($scope.mapInstance,layerId, point,tolerance, $scope.framework);
			};

            self.resetMapFired = function () {
                $scope.$emit('resetMapFired');

            };            
            /**
             * TBC
             * */
            self.activateControl = function (controlId) {
                GeoMapService.activateControl($scope.mapInstance, controlId, $scope.framework);
            };

            self.deactivateControl = function (controlId) {
                GeoMapService.deactivateControl($scope.mapInstance, controlId, $scope.framework);
            };
            /**
             * TBC
             * */
            self.registerControlEvent = function (controlId, eventName, callback) {
                GeoMapService.registerControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            /**
             * TBC
             * */
            self.unRegisterControlEvent = function (controlId, eventName, callback) {
                GeoMapService.unRegisterControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            self.registerMapEvent = function (eventName, callback) {
                GeoMapService.registerMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            /**
             * */
            self.registerLayerEvent = function (layerId, eventName, callback) {
                GeoLayerService.registerLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            /**
             * @function
             * Un-registers a registered layer event callback
             * @param {String} layerId - ID of a specific layer.
             * @param {String} eventName - Name of the event to un-register.
             * @param {function} callback - Callback function previously registered.
             * */
            self.unRegisterLayerEvent = function(layerId,eventName,callback) {
                GeoLayerService.unRegisterLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            /**
             * @function
             * Un-registers a registered map event callback
             * @param {String} eventName - Name of the event to un-register.
             * @param {function} callback - Callback function previously registered.
             * */
            self.unRegisterMapEvent = function (eventName, callback) {
                GeoMapService.unRegisterMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            /**
             * @function
             * Gets the current map extent value
             * @return {Object}
             * */
            self.getCurrentMapExtent = function () {
                return GeoMapService.getCurrentMapExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @function
             * Gets the current map scale
             * @return {Object}
             * */
            self.getMapScale = function () {
                return GeoMapService.getMapScale($scope.mapInstance, $scope.framework);
            };

            /**
             * @function
             * Gets the coordinates for the center of the map
             * @return {Object}
             * */
            self.getMapCenter = function () {
                return GeoMapService.getMapCenter($scope.mapInstance, $scope.framework);
            };

            /**
             * @function
             * Switches the map between 2D and 3D if the specified framework supports it, eg olv3.
             * */
            self.switch3d = function () {
                if(!GeoMapService.is3dSupported($scope.mapInstance,$scope.framework)) {
                    return;
                }
                if(!GeoMapService.is3d($scope.mapInstance,$scope.framework)) {
                    GeoMapService.switchTo3dView($scope.mapInstance,$scope.framework);
                } else {
                    GeoMapService.switchTo2dView($scope.mapInstance,$scope.framework);
                }
            };

            /**
             * @function
             * Queries the map instance and returns if currently viewing in 3D mode.
             * @return {Boolean}
             * */
            self.is3d = function () {
                if(!GeoMapService.is3dSupported($scope.mapInstance,$scope.framework)) {
                    return false;
                }
                return GeoMapService.is3d($scope.mapInstance,$scope.framework);
            };

            self.filterFeatureLayer = function (layerId, filterValue, featureAttributes) {
                GeoLayerService.filterFeatureLayer($scope.mapInstance, layerId, filterValue, featureAttributes, $scope.framework);
            };

            /**
             * @function
             * Gets all features from a specific layer
             * @param {String} layerId - ID of a specific layer
             * @return {GeoJSON[]}
             * */
            self.getLayerFeatures = function (layerId) {
                return GeoLayerService.getLayerFeatures($scope.mapInstance, layerId, $scope.framework);
            };


            /**
             * @function
             * Creates the framework specific feature object, then can be passed to 'addFeatureToLayer' to add.
             * These functions are separated to allow incremental migration easier.
             * @param {GeoJSON} geoJson - GeoJSON object to create the feature from.
             * */
            self.createFeature = function (geoJson) {
                return GeoLayerService.createFeature($scope.mapInstance, geoJson, $scope.framework);
            };

            /**
             * @function
             * Adds the provided GeoJSON feature to the specified layerId
             * @param {String} layerId - ID of the specific layer
             * @param {Object} feature - Framework specific object, use 'createFeature' using GeoJSON to create.
             * @return {GeoJSON}
             * */
            self.addFeatureToLayer = function (layerId, feature) {
                return GeoLayerService.addFeatureToLayer($scope.mapInstance, layerId, feature, $scope.framework);
            };

            self.createWfsClient = function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                return GeoMapService.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid, $scope.framework);
            };

            self.addWfsClient = function (wfsClient) {
                return GeoMapService.addWfsClient(wfsClient, $scope.framework);
            };

            self.searchWfs = function (clientId, query, attribute) {
                return GeoMapService.searchWfs($scope.mapInstance, clientId, query, attribute, $scope.framework);
            };

            /**
             * @function
             * Parses event from measure event to extract distance and units
             * @param {Object} event - Event object used in registered callbacks. This will be the native event object of the underlying framework, eg OpenLayers 2.
             * */
            self.getMeasureFromEvent = function (event) {
                return GeoMapService.getMeasureFromEvent($scope.mapInstance, event, $scope.framework);
            };

            /**
             * @function
             * Remove single feature from existing layer
             * @param {String} layerId - ID of the layer to remove a feature from
             * @param {String} featureId - ID of the feature that needs to be removed
             * */
            self.removeFeatureFromLayer = function (layerId, featureId) {
                GeoLayerService.removeFeatureFromLayer($scope.mapInstance, layerId, featureId, $scope.framework);
            };

            /**
             * @function
             * Raises the draw order of the specified layer
             * @param {String} layerId - ID of the layer to raise
             * @param {Number} delta - Change in layer order
             * */
            self.raiseLayerDrawOrder = function (layerId, delta) {
                GeoLayerService.raiseLayerDrawOrder($scope.mapInstance, layerId, delta, $scope.framework);
            };

            /**
             * @function
             * Gets the current framework ID
            * */
            self.getFrameworkVersion = function () {
                if(window.OpenLayers != null && window.OpenLayers.Map != null && $scope.mapInstance instanceof window.OpenLayers.Map) {
                    return 'olv2';
                }
                if(window.ol != null && window.ol.Map != null && $scope.mapInstance instanceof window.ol.Map) {
                    return 'olv3';
                }
            };
            $scope.geoMap = self;

            /**
             * @function
             * Default bind to handle window resizing
             * */
            $(window).bind('resize', function () {
                GeoMapService.mapResized($scope.mapInstance, $scope.framework);
            });

            //Allowing other directives to get mapInstance from scope could lead
            //to map manipulation outside services and mapcontroller.
            //Though would make things easier.
            /*self.getMapInstance = function() {
             return $scope.mapInstance;
             };*/

            if($scope.existingMapInstance) {
                $scope.mapInstance = $scope.existingMapInstance;
            } else {
                //Initialise map
                $scope.mapInstance = GeoMapService.initialiseMap({
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    initialExtent: $scope.initialExtent,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    isStaticMap: $scope.isStaticMap
                }, $scope.framework);
            }


            /**
             * Sends an instance of the map to any parent listens
             * @eventType emit
             * @event mapInstanceReady
             * */
            $scope.$emit('mapInstanceReady', $scope.mapInstance);
            /**
             * Sends an instance of the map controller to any parent listens
             * @eventType emit
             * @event mapControllerReady
             * */
            $scope.$emit('mapControllerReady', self);
            /**
             * Sends an instance of the map controller to any child listens
             * @eventType broadcast
             * @event mapControllerReady
             * */
            $scope.$broadcast('mapControllerReady', self);

            $scope.$on('$destroy', function () {
				$log.info('map destruction started...');
                //clean up resources
                $(window).off("resize.Viewport");
				//Wait for digestion
				$timeout(function () {
                    $log.info('map destruction finishing...');
                    $log.info('removing ' + $scope.geoMap.getLayers().length +' layers...');
                    var allLayers = $scope.geoMap.getLayers();
                    for (var i = 0; i < allLayers.length; i++) {
                        var layer = allLayers[i];
                        $scope.geoMap.removeLayerById(layer.id);
                    }
				});
            });
        }],
        link: function (scope,element,attrs) {
			//Wait for full digestion
            $timeout(function () {
                $q.allSettled(scope.layerPromises).then(function(layers) {
                    processLayers(layers);
                }, function (layersWithErrors) {
                    processLayers(layersWithErrors);
                });
                //scope.layersReady = true;
            });

            function processLayers(layers) {
                $log.info('resolving all layers');
                var allLayerDtos = [];
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if(typeof layer === 'string') {
                        //$log.info(layer);
                        scope.layerDtoPromises[i].reject(layer);
                    } else {
                        var layerDto = GeoMapService.addLayer(scope.mapInstance, layer, scope.framework);
                        scope.layerDtoPromises[i].resolve(layerDto);
                        allLayerDtos.push(layerDto);
                    }
                }
                for (var deferredMarkerIndex = 0; deferredMarkerIndex < scope.deferredMarkers.length; deferredMarkerIndex++) {
                    scope.deferredMarkers[deferredMarkerIndex].resolve();
                }
                /**
                 * Sends an instance of all map layers when they are all loaded to parent listeners
                 * @eventType emit
                 * @event layersReady
                 * */
                scope.$emit('layersReady', allLayerDtos);
                /**
                 * Sends an instance of all map layers when they are all loaded to child listeners
                 * @eventType broadcast
                 * @event layersReady
                 * */
                scope.$broadcast('layersReady', allLayerDtos);
                //layersReadyDeferred.resolve(allLayerDtos);

                scope.layersReady = true;
                if(!scope.existingMapInstance) {
                    scope.geoMap.setInitialPositionAndZoom();
                }
            }
		},
        transclude: false
    };
} ]);

app.config(['$provide', function ($provide) {
    $provide.decorator('$q', ['$delegate', function ($delegate) {
        var $q = $delegate;

        // Extention for q
        $q.allSettled = $q.allSettled || function (promises) {
            var deferred = $q.defer();
            if (angular.isArray(promises)) {
                var states = [];
                var results = [];
                var didAPromiseFail = false;

                // First create an array for all promises with their state
                angular.forEach(promises, function (promise, key) {
                    states[key] = false;
                });

                // Helper to check if all states are finished
                var checkStates = function (states, results, deferred, failed) {
                    var allFinished = true;
                    angular.forEach(states, function (state) {
                        if (!state) {
                            allFinished = false;
                        }
                    });
                    if (allFinished) {
                        if (failed) {
                            deferred.reject(results);
                        } else {
                            deferred.resolve(results);
                        }
                    }
                };

                // Loop through the promises
                // a second loop to be sure that checkStates is called when all states are set to false first
                angular.forEach(promises, function (promise, key) {
                    $q.when(promise).then(function (result) {
                        states[key] = true;
                        results[key] = result;
                        checkStates(states, results, deferred, didAPromiseFail);
                    }, function (reason) {
                        states[key] = true;
                        results[key] = reason;
                        didAPromiseFail = true;
                        checkStates(states, results, deferred, didAPromiseFail);
                    });
                });
            } else {
                throw 'allSettled can only handle an array of promises (for now)';
            }

            return deferred.promise;
        };

        return $q;
    }]);
}]);
