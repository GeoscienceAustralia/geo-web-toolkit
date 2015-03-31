var angular = angular || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.map-directives', [ 'gawebtoolkit.core.map-services', 'gawebtoolkit.core.layer-services' ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.core.map-directives:gaMap
 * @description
 * ## Overview ##
 * gaMap directive is used to create a map.
 * @param {string|@} mapElementId - The id of the element where the map is to be rendered
 * @param {string|@} datumProjection - A value representing the Datum Projection, eg 'EPSG:4326'
 * @param {string|@} displayProjection - A value representing the Display Projection, eg 'EPSG:4326'
 * @param {string|@=} centerPosition - A comma separated value representing lon/lat of the initial center position.
 * @param {number|@=} zoomLevel - An initial zoom value for the map to start at.
 * @param {geoJsonCoordinates|==} initialExtent - An initial extent is the form of a geoJson array of coordinates.
 *
 * @method addLayer - Adds a layer programmatically
 *
 * @scope
 * @restrict E
 * @example
<example module="simpleMap">
<file name="index.html">
        <div id="map"></div>
        <ga-map map-element-id="map">
            <ga-map-layer layer-name="Simple map layer name"  layer-type="WMS" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true">
                </ga-map-layer>
            <ga-map-control map-control-name="mouseposition"></ga-map-control>
        </ga-map>
</file>
<file name="style.css">#map {width: 650px;height:600px;}</file>
<file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
</example>
 */
app.directive('gaMap', [ '$timeout', '$compile', 'GAMapService', 'GALayerService', '$q','$log',
	function ($timeout, $compile, GAMapService, GALayerService, $q, $log) {
    'use strict';
    return {
        restrict: "E",
        scope: {
            mapElementId: '@',
            datumProjection: '@',
            displayProjection: '@',
            centerPosition: '@',
            zoomLevel: '@',
			initialExtent: '=',
            framework:'@'
        },
        controller: ['$scope',function ($scope) {
			$log.info('map creation started...');
            $('#' + $scope.mapElementId).empty();
            //$scope.asyncLayersDeferred = $q.defer();
            //$scope.waitingForNumberOfLayers = 0;
            $scope.initialPositionSet = false;

            //var waiting = false;
//            var waitForLayersWatch = $scope.$watch('waitingForNumberOfLayers', function (val) {
//                $log.info('layers remaining - ' + val);
//                if (waiting && val === 0) {
//					$scope.asyncLayersDeferred.resolve();
//                    waitForLayersWatch();
//                }
//                if (val > 0) {
//                    waiting = true;
//                }
//            });
            $scope.layerPromises = [];
            $scope.layerDtoPromises = [];
            //TODO Auto fix layer orders to match DOM of ga-map.
            function orderLayers() {
                var domLayers = $('ga-map-layer,ga-feature-layer,ga-marker-layer');
                var allLayers = self.getLayers();
                var relativeLayerIndex = 0;
                for (var i = 0; i < domLayers.length; i++) {
                    var el = domLayers[i];

                    var elementScope = $(el).isolateScope();
                    var elementLayerId = elementScope.layerDto != null ? elementScope.layerDto.id : null;
                    if(elementLayerId != null) {
                        for (var j = 0; j < allLayers.length; j++) {
                            var currentLayer = allLayers[j];
                            if(currentLayer.id === elementLayerId) {
                                if(relativeLayerIndex !== j) {
                                    //raise/lower layer to correct order
//                                    self.raiseLayerDrawOrder(currentLayer.id,relativeLayerIndex - j);
                                }
                            }
                        }
                        relativeLayerIndex++;
                    }
                }
            }
            var self = this;
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#addLayer
             * @description
             * Adds a layer to the underlying mapInstance calling the appropriate implementation specific service.
             * @param {*} layer - An implementation object for a layer, eg an olv2 layer object
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                                var layerDto = GAMapService.addLayer($scope.mapInstance, resultLayer, $scope.framework);
                                deferredLayer.resolve(layerDto);
                                orderLayers();
                                $scope.$emit('layerAdded', layerDto);
                            }
						});
					} else {
						$scope.layerPromises.push(deferredAll);
                        $scope.layerDtoPromises.push(deferredLayer);
					}
				}else {
					if ($scope.layersReady) {
						$log.info(layer);
						var layerDto = GAMapService.addLayer($scope.mapInstance, layer, $scope.framework);
                        deferredLayer.resolve(layerDto);
                        orderLayers();
						$scope.$emit('layerAdded', layerDto);
					} else {
						$scope.layerPromises.push(deferredAll.promise);
                        $scope.layerDtoPromises.push(deferredLayer);
                        //Wait for digest
                        $timeout(function () {
                            deferredAll.resolve(layer);
                        });
					}
				}
                return deferredLayer.promise;
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
                var layerOptions = GALayerService.defaultLayerOptions(layerArgs,$scope.framework);
                return GALayerService.createLayer(layerOptions,$scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomToMaxExtent
             * @description
             * Zooms to the maximum extent of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @example
             * <example module="zoomToMax">
             * <file name="zoomToMax.html">
             * <div ng-controller="zoomToMax">
             * <a class="btn btn-primary" ng-click="mapController.zoomToMaxExtent()">Zoom to Max</a>
             * <div id="zoomToMax"></div>
             * <ga-map map-element-id="zoomToMax" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="zoomToMaxJS.js">
             * angular.module("zoomToMax",['gawebtoolkit.core'])
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
                GAMapService.zoomToMaxExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#currentZoomLevel
             * @description
             * Gets the current zoom level of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {Number} - Zoom level.
             * @example
             * <example module="currentZoomLevel">
             * <file name="currentZoomLevel.html">
             * <div ng-controller="currentZoomLevel">
             * <a class="btn btn-primary" ng-click="currentZoomLevel = mapController.currentZoomLevel()">Get the current zoom level : <span ng-model="currentZoomLevel" class="bg-primary">{{currentZoomLevel}}</span></a>
             * <div id="currentZoomLevel"></div>
             * <ga-map map-element-id="currentZoomLevel" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="currentZoomLevel.js">
             * angular.module("currentZoomLevel",['gawebtoolkit.core'])
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
                return GAMapService.currentZoomLevel($scope.mapInstance, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapMouseMove
             * @description
             * Registers a mouse movement event and calls provided callback.
             * Event details coming back will be implementation specific
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                <ga-map
                    map-element-id="mapMouseMove"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='{"lat":"-3434403","lon":"14517578"}'
                zoom-level="4">
                <ga-map-layer
                    layer-name="Overview World Screen"
                    layer-type="GoogleStreet"
                    is-base-layer="true">
                </ga-map-layer>
                <ga-map-layer
                    layer-name="Topographic" 
                    layer-type="WMS"
                    layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                    is-base-layer="false"
                    layers="hazardContours"
                    background-color="#ffffff">
                </ga-map-layer>
            </ga-map>
            </div>
             * </div>
             * </file>
             * <file name="mapMouseMove.js">
             * var app = angular.module('mapMouseMove', ['gawebtoolkit.core']);
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
                GAMapService.registerMapMouseMove($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapMouseMoveEnd
             * @description
             * Registers an event callback with mapInstance when the mouse stops moving over the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                    <ga-map
                        map-element-id="mapMouseMoveEnd"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='{"lat":"-3434403","lon":"14517578"}'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>

             * </file>
             * 
             * <file name="mapMouseMoveEnd.js">
             * var app = angular.module('mapMouseMoveEnd', ['gawebtoolkit.core']);
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
                GAMapService.registerMapMouseMoveEnd($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapClick
             * @description
             * Registers an event that will fire when the rendered map is clicked.
             * Event details coming back will be implementation specific
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                    <ga-map
                        map-element-id="mouseMapClick"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='{"lat":"-3434403","lon":"14517578"}'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
             * </div>
             * </file>
             * <file name="mouseMapClick.js">
             * var app = angular.module('mouseMapClick', ['gawebtoolkit.core']);
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
                GAMapService.registerMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#unRegisterMapClick
             * @description
             * Unregisters a map click event from the map instance.
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                <ga-map
                    map-element-id="unRegisterMouseMapClick"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='{"lat":"-3434403","lon":"14517578"}'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
            </div>
             * </file>
             * <file name="unRegisterMouseMapClick.js">
             *  var app = angular.module('unRegisterMouseMapClick', ['gawebtoolkit.core']);
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
                GAMapService.unRegisterMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#addControl
             * @description
             * Creates and adds a control to the map instance
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} controlName - the name of the type of control to be created
             * @param {Object} controlOptions - an objet with implementation specific controlOptions
             * @param {string=} elementId - a DOM element to add the control to.
             * @param {string=} controlId - An id to help interact with the control when using 'ById' methods
             * @example
             * <example module="addOurControl">
             * <file name="addOurControl.html">
             * <div ng-controller="addOurControl">
             * <a class="btn btn-primary" ng-click="addOurControl()">Add Control</a>
             * <div id="addOurControl"></div>
             * <ga-map map-element-id="addOurControl" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="addOurControl.js">
             * angular.module("addOurControl",['gawebtoolkit.core'])
             * .controller("addOurControl", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.addOurControl = function() {
             * $scope.mapController.addControl("panzoombar", "", "addOurControl", "ourCustomControl");
             * }
             * })
             * }]);
             * </file>
             * <file name="addOurControl.css">
             * #addOurControl {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.addControl = function (controlName, controlOptions, elementId, controlId) {
                return GAMapService.addControl($scope.mapInstance, controlName, controlOptions, elementId, controlId, self.getMapOptions(), $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLonLatFromPixel
             * @description
             * Gets a latlon object from implementation service
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                <div id="toolbar">
                    <a class="btn btn-primary" ng-click="toggleMouseClickRegistration($event)">{{registerMapClickButton}}</a>
                    <span ng-show="isMapClickRegistered" class="alert alert-danger messagebox">
                        {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                </div>        
                <div id="getLonLat"></div>
                <ga-map
                    map-element-id="getLonLat"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='{"lat":"-3434403","lon":"14517578"}'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
              </div>
             * </file>
             * <file name="getLonLat.js">
             *  var app = angular.module('getLonLat', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.registerMapClickButton = "Register map click";
                        $scope.toggleMouseClickRegistration = function(e) {
                                $scope.isMapClickRegistered = true;
                                $scope.mouseClickStatus = "Map click registered";
                                angular.element(e.target).attr("disabled", "");
                                $scope.mapController.registerMapClick(mapClickCallback);
                            };

                        var mapClickCallback = function(e) {
                            LonLatObj = $scope.mapController.getLonLatFromPixel(e.pageX, e.pageY, $scope.mapController.getProjection());
                            $scope.mouseClickMsg = "Longitude: " + LonLatObj.lon + " | Latitude: " + LonLatObj.lat;
                            $scope.$apply();
                        };
                    });
                }]);
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
                return GAMapService.getLonLatFromPixel($scope.mapInstance, x, y, projection, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getPixelFromLonLat
             * @description
             * Gets a latlon object from implementation service
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Number} lon - The latitude of the location to transform
             * @param {Number} lat - The longitude of the location to transform
             * @return {Point} - An object containing Latitude and Longitude in the projection of the map
             * @example <code><pre>var point = mapController.getPixelFromLonLat(-20,-100);
             * // eg, point equals x: 25, y: 63</pre></code>
             * */
            self.getPixelFromLonLat = function (lon, lat) {
                return GAMapService.getPixelFromLonLat($scope.mapInstance, lon, lat, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getPointFromEvent
             * @description
             * Extracts a point from an event coming from implementation service layer.
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Object} event - An event from implementation, eg OpenLayers,
             * worked out from number of pixels from the left of the div containing the map
             * @return {Point} - A point object extracted from the event.
             * */
            self.getPointFromEvent = function (event) {
                return GAMapService.getPointFromEvent(event, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLayers
             * @description
             * Gets all the layers currently associated with the map instance
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayers">
             * <file name="dumpLayers.html">
             * <div ng-controller="dumpLayers">
             * <a class="btn btn-primary" ng-click="dumpLayers()">Dump layers object to console</a>
             * <div id="dumpLayers"></div>
             * <ga-map map-element-id="dumpLayers" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="dumpLayers.js">
             * angular.module("dumpLayers",['gawebtoolkit.core'])
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
                return GAMapService.getLayers($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLayersByName
             * @description
             * Finds and returns the layer's details by its name
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} LayerName - The name of the layer, which is defined on gaMapLayer directive
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayersByName">
             * <file name="dumpLayersByName.html">
             * <div ng-controller="dumpLayersByName">
             * <a class="btn btn-primary" ng-click="dumpLayersByName()">Dump base layer's details object to console</a>
             * <div id="dumpLayersByName"></div>
             * <ga-map map-element-id="dumpLayersByName" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="dumpLayersByName.js">
             * angular.module("dumpLayersByName",['gawebtoolkit.core'])
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
                return GAMapService.getLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomToLayer
             * @description
             * If possible, performs an action to zoom in on the extent of a layer associated with Id
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer to zoom too.
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="zoomToLayer">
             * <file name="zoomToLayer.html">
             * <div ng-controller="zoomToLayer">
             * <a class="btn btn-primary" ng-click="zoomToLayer()">Zoom to base layer extent</a>
             * <div id="zoomToLayer"></div>
             * <ga-map map-element-id="zoomToLayer" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="zoomToLayer.js">
             * angular.module("zoomToLayer",['gawebtoolkit.core'])
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
                GAMapService.zoomToLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getMapProjection">
             * <file name="getProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getProjection()">Get Projection: {{projection}}</a>
                    </div>
                    <div id="getMapProjection"></div>
                    <ga-map
                        map-element-id="getMapProjection"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='{"lat":"-3434403","lon":"14517578"}'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>
             * </file>
             * <file name="getProjection.js">
             *  var app = angular.module('getMapProjection', ['gawebtoolkit.core']);
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
                return $scope.datumProjection;
            };
            /**
             *
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getDisplayProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getDisplayProjection">
             * <file name="getDisplayProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getDisplayProjection()">Get Display Projection: {{projection}}</a>
                    </div>
                    <div id="getDisplayProjection"></div>
                    <ga-map
                        map-element-id="getDisplayProjection"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='{"lat":"-3434403","lon":"14517578"}'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>
             * </file>
             * <file name="getDisplayProjection.js">
             *  var app = angular.module('getDisplayProjection', ['gawebtoolkit.core']);
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
                return $scope.displayProjection;
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setLayerVisibility
             * @description
             * Changes the associated layerId visibility
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer
             * @param {boolean} visibility - Boolean indicating if the layer should be hidden(false) or shown(true)
             * @example
             * <example module="setVisibility">
             * <file name="setVisibility.html">
             * <div ng-controller="setVisibility">
             * <input type="checkbox" ng-model="layerVisibility" ng-change="setVisibility()" /> Toggle base layer visibility on/off
             * <div id="setVisibility"></div>
             * <ga-map map-element-id="setVisibility" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setVisibility.js">
             * angular.module("setVisibility",['gawebtoolkit.core'])
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
                GAMapService.setLayerVisibility($scope.mapInstance, layerId, visibility, $scope.framework);
            };

            /**
             * Creates a bounding box and returns an implementation specific object
             *
             * @param lonLatArray {geoJsonCoordinates}
             * @return {Object}
             * */
            self.createBoundingBox = function (lonLatArray) {
                return GAMapService.createBoundingBox($scope.mapInstance, lonLatArray, $scope.framework);
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
                return GAMapService.createBounds($scope.mapInstance, geoJsonCoordinates, projection, $scope.framework);
            };
            /**
             * Zooms map to bounds around provided LonLat array
             *
             * @param lonLatArray {LonLat[]} - array of LonLat to build a bounds to zoom too.
             * */
            self.zoomToExtent = function (lonLatArray) {
                GAMapService.zoomToExtent($scope.mapInstance, lonLatArray, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomTo
             * @description
             * Sets the zoom level of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {number} zoomLevel - A number value to be used as zoom level

             * @example
             * <example module="setZoomLevel">
             * <file name="setZoomLevel.html">
             * <div ng-controller="setZoomLevel">
             * <input placeholder="0-19" type="number" ng-model="zoomLevel" style="width: 50px" /><a class="btn btn-primary" ng-click="setZoomLevel()">  Set zoom level to {{zoomLevel}}</a>
             * <div id="setZoomLevel"></div>
             * <ga-map map-element-id="setZoomLevel" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setZoomLevel.js">
             * angular.module("setZoomLevel",['gawebtoolkit.core'])
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
                GAMapService.zoomTo($scope.mapInstance, zoomLevel, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setBaseLayer
             * @description
             * Changes the current base layer to the layer associated with the Id provided
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
                <ga-map
                    map-element-id="setBaseLayer"
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
                        layer-name="World Political Boundaries" 
                        layer-url="http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer" 
                        wrap-date-line="true" 
                        layer-type="XYZTileCache"
                        is-base-layer="true"
                        visibility="false">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Earthquake hazard contours" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
               </div>
             * </file>
             * <file name="setBaseLayer.js">
             * var app = angular.module('setBaseLayer',
                ['gawebtoolkit.core']);
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
                GAMapService.setBaseLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setCenter
             * @description
             * Changes the centred position of the map to the provided lat, lon
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Number} lat - Latitude value to move the view too.
             * @param {Number} lon - Longitude value to move the view too.
             * @param {String} projection - Projection of {LonLat}
             * @example
             * <example module="setCenterPosition">
             * <file name="setCenterPosition.html">
             * <div ng-controller="setCenterPosition">
             * <a class="btn btn-primary" ng-click="setCenterPosition()">Move to Australia</a>
             * <div id="setCenterPosition"></div>
             * <ga-map map-element-id="setCenterPosition" zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setCenterPosition.js">
             * angular.module("setCenterPosition",['gawebtoolkit.core'])
             * .controller("setCenterPosition", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.setCenterPosition = function() {
             * $scope.mapController.setCenter("-3034403", "15017578", "EPSG");
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
                GAMapService.setCenter($scope.mapInstance, lat, lon, projection, $scope.framework);
            };

            self.getInitialExtent = function () {
                return $scope.initialExtent;
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
                if(!$scope.centerPosition) {
                    $scope.centerPosition = {
                        lon: 0,
                        lat: 0
                    };
                }
                if (!$scope.initialPositionSet) {
                    GAMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework);
                }

                $scope.initialPositionSet = true;
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#isBaseLayer
             * @description
             * Returns true if layer with the associated Id is a base layer
             * @param {string} layerId - Id of the layer
             * @methodOf gawebtoolkit.core.map-directives:gaMap
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
             * <ga-map map-element-id="checkBaseLayer" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             *<ga-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="checkBaseLayer.js">
             * angular.module("checkBaseLayer",['gawebtoolkit.core'])
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
                return GAMapService.isBaseLayer($scope.mapInstance, layerId, $scope.framework);
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
             * @name gawebtoolkit.core.map-directives:gaMap#setOpacity
             * @description 
             * Changes the opacity of the associated layer to the value provided (Number between 0 and 1.0
             * <br>This function only works on non-base layers
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer
             * @param {Number} opacity - Value between 0 and 1.0 representing the layer's new opacity.
             * @example
             * <example module="setOpacity">
             * <file name="setOpacity.html">
             * <div ng-controller="setOpacityController">
             * <input placeholder="0-1" type="number" ng-model="opacityLevel" style="width: 50px; height: auto;" /><a class="btn btn-primary" ng-click="setOpacityLevel()">  Set top layer's opacity to {{opacityLevel}}</a>
             * <div id="setOpacity"></div>
             * <ga-map map-element-id="setOpacity" center-position='{"lat":"-3034403","lon":"15017578"}' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             *<ga-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setOpacityLevel.js">
             * angular.module("setOpacity",['gawebtoolkit.core'])
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
                GAMapService.setOpacity($scope.mapInstance, layerId, opacity, $scope.framework);
            };
            /**
             * Returns the map element Id that was originally passed to gaMap
             *
             * @return {string}
             * */
            self.getMapElementId = function () {
                return $scope.mapElementId;
            };
            /**
             * Adds a marker to an existing marker group/layer or creates a new group/layer to add
             * the marker too.
             *
             * @param point {Point} - screen point to place the marker
             * @param markerGroupName {string} - group name associated with the new marker
             * @param iconUrl {string} - A url to the desired icon for the marker
             *
             * */
            self.setMapMarker = function (point, markerGroupName, iconUrl, args) {
                GAMapService.setMapMarker($scope.mapInstance, point, markerGroupName, iconUrl, args, $scope.framework);
            };
            /**
             * Removes the first layer found that matches the name provided
             *
             * @param layerName {string} - Name of a named layer
             *
             * */
            self.removeLayerByName = function (layerName) {
                GALayerService.removeLayerByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes all layers matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * */
            self.removeLayersByName = function (layerName) {
                GALayerService.removeLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes layer by reference to a layer object
             *
             * @deprecated
             * */
            self.removeLayer = function (layerInstance) {
                GALayerService.removeLayer($scope.mapInstance, layerInstance, $scope.framework);
            };

            /**
             * Removed layer by id
             * @param layerId {string} - Id of a layer to remove
             * */
            self.removeLayerById = function (layerId) {
                GALayerService.removeLayerById($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * Gets the count of markers of the first layer matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * @return {Number}
             * */
            self.getMarkerCountForLayerName = function (layerName) {
                return GALayerService.getMarkerCountForLayerName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Draws a polyline on the map provided an array of LatLons on a new layer of the provided name.
             *
             * @param layerName {string} - Name of the new layer to draw on.
             * @param points {LonLat[]} - Array of LonLat to draw.
             * */
            self.drawPolyLine = function (points, layerName) {
                GAMapService.drawPolyLine($scope.mapInstance, points, layerName, $scope.framework);
            };
            
            self.removeSelectedFeature = function (layerName) {
                return GAMapService.removeSelectedFeature($scope.mapInstance, layerName, $scope.framework);
            };
            
            self.removeFeature = function (layerName, feature) {
                return GAMapService.removeFeature($scope.mapInstance, layerName, feature, $scope.framework);
            };
            
            self.drawFeature = function (args) {
                return GAMapService.drawFeature($scope.mapInstance, args, $scope.framework);
            };
            
            self.drawLabel = function (args) {
                return GAMapService.drawLabel($scope.mapInstance, args, $scope.framework);
            };   
            
            self.drawLabelWithPoint = function (args) {
                return GAMapService.drawLabelWithPoint($scope.mapInstance, args, $scope.framework);
            };           

            self.isControlActive = function (controlId) {
                return GAMapService.isControlActive($scope.mapInstance, controlId, $scope.framework);
            };

            /**
             * TBC
             * */
            self.registerFeatureSelected = function (layerId, callback, element) {
                return GALayerService.registerFeatureSelected($scope.mapInstance, layerId, callback, element, $scope.framework);
            };

			self.getFeatureInfo = function (callback,url,featureType, featurePrefix, geometryName, point, tolerance) {
				return GAMapService.getFeatureInfo($scope.mapInstance,callback, url,featureType, featurePrefix, geometryName, point, tolerance, $scope.framework);
			};

			self.getFeatureInfoFromLayer = function (callback,layerId, point,tolerance) {
				return GAMapService.getFeatureInfoFromLayer($scope.mapInstance,callback,layerId, point,tolerance, $scope.framework);
			};

            self.resetMapFired = function () {
                $scope.$emit('resetMapFired');

            };            
            /**
             * TBC
             * */
            self.activateControl = function (controlId) {
                GAMapService.activateControl($scope.mapInstance, controlId, $scope.framework);
            };

            self.deactivateControl = function (controlId) {
                GAMapService.deactivateControl($scope.mapInstance, controlId, $scope.framework);
            };
            /**
             * TBC
             * */
            self.registerControlEvent = function (controlId, eventName, callback) {
                GAMapService.registerControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            /**
             * TBC
             * */
            self.unRegisterControlEvent = function (controlId, eventName, callback) {
                GAMapService.unRegisterControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            self.registerMapEvent = function (eventName, callback) {
                GAMapService.registerMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            self.registerLayerEvent = function (layerId, eventName, callback) {
                GALayerService.registerLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            self.unRegisterLayerEvent = function(layerId,eventName,callback) {
                GALayerService.unRegisterLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            self.unRegisterMapEvent = function (eventName, callback) {
                GAMapService.unRegisterMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            self.getCurrentMapExtent = function () {
                return GAMapService.getCurrentMapExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @private
             *
             * Helper function to ensure all layers are loaded, async or other wise.
             * */
//            self.waitingForAsyncLayer = function () {
//                $scope.waitingForNumberOfLayers++;
//            };

            /**
             * @private
             *
             * Helper function to ensure all layers are loaded, async or other wise.
             * */
//            self.asyncLayerLoaded = function () {
//                $scope.waitingForNumberOfLayers--;
//            };

//            self.asyncLayerError = function (layer) {
//                $scope.waitingForNumberOfLayers--;
//                var index = $scope.layerPromises.indexOf(layer);
//                if (index > -1) {
//                    $scope.layerPromises.splice(index, 1);
//                }
//            };

            self.filterFeatureLayer = function (layerId, filterValue, featureAttributes) {
                GALayerService.filterFeatureLayer($scope.mapInstance, layerId, filterValue, featureAttributes, $scope.framework);
            };

            self.getLayerFeatures = function (layerId) {
                return GALayerService.getLayerFeatures($scope.mapInstance, layerId, $scope.framework);
            };

            self.createFeature = function (geoJson) {
                return GALayerService.createFeature($scope.mapInstance, geoJson, $scope.framework);
            };

            self.addFeatureToLayer = function (layerId, feature) {
                return GALayerService.addFeatureToLayer($scope.mapInstance, layerId, feature, $scope.framework);
            };

            self.createWfsClient = function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                return GAMapService.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid, $scope.framework);
            };

            self.addWfsClient = function (wfsClient) {
                return GAMapService.addWfsClient(wfsClient, $scope.framework);
            };

            self.searchWfs = function (clientId, query, attribute) {
                return GAMapService.searchWfs($scope.mapInstance, clientId, query, attribute, $scope.framework);
            };

            self.getMeasureFromEvent = function (event) {
                return GAMapService.getMeasureFromEvent($scope.mapInstance, event, $scope.framework);
            };

            self.removeFeatureFromLayer = function (layerId, featureId) {
                GALayerService.removeFeatureFromLayer($scope.mapInstance, layerId, featureId, $scope.framework);
            };

            self.raiseLayerDrawOrder = function (layerId, delta) {
                GALayerService.raiseLayerDrawOrder($scope.mapInstance, layerId, delta, $scope.framework);
            };
//            var layersReadyDeferred = $q.defer();
//            self.layersReady = function () {
//                return layersReadyDeferred.promise;
//            };
            self.getFrameworkVersion = function () {
                return $scope.framework;
            };
            $scope.gaMap = self;

            /**
             * @function
             * Default bind to handle window resizing
             * */
            $(window).bind('resize', function () {
                GAMapService.mapResized($scope.mapInstance, $scope.framework);
            });

            //Allowing other directives to get mapInstance from scope could lead
            //to map manipulation outside services and mapcontroller.
            //Though would make things easier.
            /*self.getMapInstance = function() {
             return $scope.mapInstance;
             };*/

            //Initialise map
            $scope.mapInstance = GAMapService.initialiseMap({
                mapElementId: $scope.mapElementId,
                datumProjection: $scope.datumProjection,
                displayProjection: $scope.displayProjection,
                initialExtent: $scope.initialExtent,
                centerPosition: $scope.centerPosition,
                zoomLevel: $scope.zoomLevel
            }, $scope.framework);

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
                    $log.info('removing ' + $scope.gaMap.getLayers().length +' layers...');
                    var allLayers = $scope.gaMap.getLayers();
                    for (var i = 0; i < allLayers.length; i++) {
                        var layer = allLayers[i];
                        $scope.gaMap.removeLayerById(layer.id);
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
            });

            function processLayers(layers) {
                $log.info('resolving all layers');
                var allLayerDtos = [];
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if(typeof layer === 'string') {
                        $log.info(layer);
                        scope.layerDtoPromises[i].reject(layer);
                    } else {
                        var layerDto = GAMapService.addLayer(scope.mapInstance, layer, scope.framework);
                        scope.layerDtoPromises[i].resolve(layerDto);
                        allLayerDtos.push(layerDto);
                    }
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
                scope.gaMap.setInitialPositionAndZoom();
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
