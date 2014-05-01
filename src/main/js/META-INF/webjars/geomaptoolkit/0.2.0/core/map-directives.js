var angular = angular || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.map-directives', [ 'gawebtoolkit.core.map-services', 'gawebtoolkit.core.layer-services' ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.core.map-directives:gaMap
 * @description
 * ## Overview ##
 * gaMapConfig Is a directive to fetch config from a url or method and store it on an isolated scope
 *
 * @property {string} mapElementId - The id of the element where the map is to be rendered
 * @property {string} datumProjection - A value representing the Datum Projection, eg 'EPSG:4326'
 * @property {string} displayProjection - A value representing the Display Projection, eg 'EPSG:4326'
 *
 * @method addLayer
 *
 * @scope
 * @restrict E
 * @example
 <ga-map-config ga-config-path="some/where/config"
 static-config="true"
 ga-config-method="myMethodThatReturnsConfigObject">
 </ga-map-config>
 */
app.directive('gaMap', [ '$timeout', '$compile', 'GAMapService', 'GALayerService', '$q', function($timeout, $compile, GAMapService, GALayerService, $q) {
   'use strict';
   return {
      restrict : "E",
      scope : {
         mapElementId : '@',
         datumProjection : '@',
         displayProjection : '@',
         centerPosition : '@',
         zoomLevel : '@',
         initialExtent : '='
      },
      controller : function($scope) {
         var asyncLayersDeferred;
         $scope.waitingForNumberOfLayers = 0;
         var waiting = false;
         var waitForLayersWatch = $scope.$watch('waitingForNumberOfLayers', function(val) {
            if (waiting && val === 0) {
               asyncLayersDeferred.resolve();
               waitForLayersWatch();
            }
            if (val > 0) {
               waiting = true;
            }
         });
         var self = this;
         /**
          * Adds a layer to the underlying mapInstance calling the appropriate implementation specific service.
          * @param {*} layer - An implementation object for a layer, eg an olv2 layer object
          * @return {Layer} - layer object representing implementation.
          * */
         self.addLayer = function(layer) {
            //If the data bound to layers changes and layers are re-generated
            //UI components will want to listen for 'layerAdded' to update
            //list of current layers for UI

            var layerDto = GAMapService.addLayer($scope.mapInstance, layer);
            if ($scope.layersReady) {
               $scope.$emit('layerAdded', layer);
            }
            return layerDto;
         };
         /**
          * Zooms to the maximum extent of the map
          * */
         self.zoomToMaxExtent = function() {
            GAMapService.zoomToMaxExtent($scope.mapInstance);
         };

         self.currentZoomLevel = function() {
            return GAMapService.currentZoomLevel($scope.mapInstance);
         };
         /**
          * Registers a mouse movement event and calls provided callback.
          * Event details coming back will be implementation specific
          * @callback callback
          * */
         self.registerMapMouseMove = function(callback) {
            GAMapService.registerMapMouseMove($scope.mapInstance, callback);
         };
         /**
          * Registers an event callback with mapInstance when the mouse stops moving over the map
          *
          * @callback callback
          * */
         self.registerMapMouseMoveEnd = function(callback) {
            GAMapService.registerMapMouseMoveEnd($scope.mapInstance, callback);
         };
         /**
          * Registers an event that will fire when the rendered map is clicked.
          * Event details coming back will be implementation specific
          * @callback callback
          * */
         self.registerMapClick = function(callback) {
            GAMapService.registerMapClick($scope.mapInstance, callback);
         };
         /**
          * Unregisters a map click event from the map instance.
          * @callback callback
          * */
         self.unRegisterMapClick = function(callback) {
            GAMapService.unRegisterMapClick($scope.mapInstance, callback);
         };
         /**
          * Creates and adds a control to the map instance
          * @param {string} controlName - the name of the type of control to be created
          * @param {Object} controlOptions - an objet with implementation specific controlOptions
          * @param {String} elementId - a DOM element to add the control to.
          * @param {string} controlId - An id to help interact with the control when using 'ById' methods
          * */
         self.addControl = function(controlName, controlOptions, elementId, controlId) {
            GAMapService.addControl($scope.mapInstance, controlName, controlOptions, elementId, controlId);
         };
         /**
          * Gets a latlon object from implementation service
          * @param {Number} x - number of pixels from the left of the div containing the map
          * @param {Number} y - number of pixels from the top of the div containing the map
          * @returns {LonLat} An object containing Latitude and Longitude in the projection of the map
          * @example
          * mapController.getLonLatFromPixel(200,500)
          * // returns { lat: -30.967, lon: 108.552},
          * */
         self.getLonLatFromPixel = function(x, y) {
            return GAMapService.getLonLatFromPixel($scope.mapInstance, x, y);
         };
         /**
          * Gets a latlon object from implementation service
          * @param {Number} lon -
          * @param {Number} lat -
          * @returns {LonLat} An object containing Latitude and Longitude in the projection of the map
          * @example
          * mapController.getLonLatFromPixel(200,500)
          * // returns { lat: -30.967, lon: 108.552},
          * */
         self.getPixelFromLonLat = function(lon, lat) {
            return GAMapService.getPixelFromLonLat($scope.mapInstance, lon, lat);
         };
         /**
          * Extracts a point from an event coming from implementation service layer.
          *
          * @param {Object} e - number of pixels from the left of the div containing the map
          * @returns {Point}
          * */
         self.getPointFromEvent = function(e) {
            return GAMapService.getPointFromEvent(e);
         };
         /**
          * Gets all the layers currently associated with the map instance
          * @returns {Layer[]}
          * */
         self.getLayers = function() {
            return GAMapService.getLayers($scope.mapInstance);
         };

         self.getLayersByName = function(layerName) {
            return GAMapService.getLayersByName($scope.mapInstance, layerName);
         };

         /**
          * If possible, performs an action to zoom in on the extent of a layer associated with Id
          *
          * @param {string} layerId - Id of the layer to zoom too.
          * */
         self.zoomToLayer = function(layerId) {
            GAMapService.zoomToLayer($scope.mapInstance, layerId);
         };
         /**
          * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
          *
          * return {string}
          * */
         self.getProjection = function() {
            return $scope.datumProjection;
         };
         /**
          * Get original display projection provided to the map on initialisation, eg $scope.displayProjection
          *
          * return {string}
          * */
         self.getDisplayProjection = function() {
            return $scope.displayProjection;
         };

         /**
          * Changes the associated layerId visibility
          *
          * @param layerId {string} - An id of the layer
          * @param visibility {Boolean} - Boolean indicating if the layer should be hidden(false) or shown(true)
          * */
         self.setLayerVisibility = function(layerId, visibility) {
            GAMapService.setLayerVisibility($scope.mapInstance, layerId, visibility);
         };

         /**
          * Creates a bounding box and returns an implementation specific object
          *
          * @param lonLatArray {geoJsonCoordinates}
          * @return {Object}
          * */
         self.createBoundingBox = function(lonLatArray) {
            return GAMapService.createBoundingBox($scope.mapInstance, lonLatArray);
         };
         /**
          * Creates a bounding object and returns an implementation specific object
          * Implementation to extend bounding box to encompass all LonLat's provided.
          *
          * @param geoJsonCoordinates {geoJsonCoordinates}
          * @param projection {String}
          * @return {Object}
          * */
         self.createBounds = function(geoJsonCoordinates, projection) {
            return GAMapService.createBounds($scope.mapInstance, geoJsonCoordinates, projection);
         };
         /**
          * Zooms map to bounds around provided LonLat array
          *
          * @param lonLatArray {LonLat[]} - array of LonLat to build a bounds to zoom too.
          * */
         self.zoomToExtent = function(lonLatArray) {
            GAMapService.zoomToExtent($scope.mapInstance, lonLatArray);
         };
         /**
          * Sets the zoom level of the map
          *
          * @param zoomLevel {Number}
          * */
         self.zoomTo = function(zoomLevel) {
            GAMapService.zoomTo($scope.mapInstance, zoomLevel);
         };
         /**
          * Changes the current base layer to the layer associated with the Id provided
          *
          * @param layerId {string} - id of the new base layer.
          * */
         self.setBaseLayer = function(layerId) {
            GAMapService.setBaseLayer($scope.mapInstance, layerId);
         };
         /**
          * Changes the centred position of the map to the provided lat, lon
          *
          * @param lat {Number} - Latitude value to move the view too.
          * @param lon {Number} - Longitude value to move the view too.
          * @param projection {String} - Projection of {LonLat}
          * */
         self.setCenter = function(lat, lon, projection) {
            GAMapService.setCenter($scope.mapInstance, lat, lon, projection);
         };

         self.setInitialPositionAndZoom = function() {

            var args = {
               mapElementId : $scope.mapElementId,
               datumProjection : $scope.datumProjection,
               displayProjection : $scope.displayProjection,
               centerPosition : $scope.centerPosition,
               zoomLevel : $scope.zoomLevel,
               initialExtent : $scope.initialExtent
            };
            if (!$scope.initialPositionSet) {
               GAMapService.setInitialPositionAndZoom($scope.mapInstance, args);
            }

            $scope.initialPositionSet = true;
         };

         /**
          * Returns true if layer with the associated Id is a base layer
          *
          * @param layerId {string} - Id of the layer
          * @return {Boolean}
          * */
         self.isBaseLayer = function(layerId) {
            return GAMapService.isBaseLayer($scope.mapInstance, layerId);
         };

         /**
          * @deprecated
          * Returns the map instance
          *
          * @return {Object}
          * */
         self.getMapInstance = function() {
            return $scope.mapInstance;
         };
         /**
          * Changes the opacity of the associated layer to the value provided (Number between 0 and 1.0
          *
          * @param layerId {string} - Id of the layer
          * @param opacity {Number} - Value between 0 and 1.0 representing the layer's new opacity.
          * */
         self.setOpacity = function(layerId, opacity) {
            GAMapService.setOpacity($scope.mapInstance, layerId, opacity);
         };
         /**
          * Returns the map element Id that was originally passed to gaMap
          *
          * @return {string}
          * */
         self.getMapElementId = function() {
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
         self.setMapMarker = function(point, markerGroupName, iconUrl) {
            GAMapService.setMapMarker($scope.mapInstance, point, markerGroupName, iconUrl);
         };
         /**
          * Removes the first layer found that matches the name provided
          *
          * @param layerName {string} - Name of a named layer
          *
          * */
         self.removeLayerByName = function(layerName) {
            GALayerService.removeLayerByName($scope.mapInstance, layerName);
         };
         /**
          * Removes all layers matching the name provided
          *
          * @param layerName {string} - Name of the named layer
          * */
         self.removeLayersByName = function(layerName) {
            GALayerService.removeLayersByName($scope.mapInstance, layerName);
         };
         /**
          * Removes layer by reference to a layer object
          *
          * @deprecated
          * */
         self.removeLayer = function(layerInstance) {
            GALayerService.removeLayer($scope.mapInstance, layerInstance);
         };

         /**
          * Removed layer by id
          * @param layerId {string} - Id of a layer to remove
          * */
         self.removeLayerById = function(layerId) {
            GALayerService.removeLayerById($scope.mapInstance, layerId);
         };
         /**
          * Gets the count of markers of the first layer matching the name provided
          *
          * @param layerName {string} - Name of the named layer
          * @return {Number}
          * */
         self.getMarkerCountForLayerName = function(layerName) {
            return GALayerService.getMarkerCountForLayerName($scope.mapInstance, layerName);
         };
         /**
          * Draws a polyline on the map provided an array of LatLons on a new layer of the provided name.
          *
          * @param layerName {string} - Name of the new layer to draw on.
          * @param points {LonLat[]} - Array of LonLat to draw.
          * */
         self.drawPolyLine = function(points, layerName) {
            GAMapService.drawPolyLine($scope.mapInstance, points, layerName);
         };

         self.isControlActive = function(controlId) {
            return GAMapService.isControlActive($scope.mapInstance, controlId);
         };

         /**
          * TBD
          * */
         self.registerFeatureSelected = function(layerId, callback, element) {
            return GALayerService.registerFeatureSelected($scope.mapInstance, layerId, callback, element);
         };

         self.resetMapFired = function() {
            $scope.$emit('resetMapFired');

         };

         /**
          * TBD
          * */
         self.activateControl = function(controlId) {
            GAMapService.activateControl($scope.mapInstance, controlId);
         };

         self.deactivateControl = function(controlId) {
            GAMapService.deactivateControl($scope.mapInstance, controlId);
         };
         /**
          * TBD
          * */
         self.registerControlEvent = function(controlId, eventName, callback) {
            GAMapService.registerControlEvent($scope.mapInstance, controlId, eventName, callback);
         };

         /**
          * TBD
          * */
         self.unRegisterControlEvent = function(controlId, eventName, callback) {
            GAMapService.unRegisterControlEvent($scope.mapInstance, controlId, eventName, callback);
         };

         self.registerMapEvent = function(eventName, callback) {
            GAMapService.registerMapEvent($scope.mapInstance, eventName, callback);
         };

         self.unRegisterMapEvent = function(eventName, callback) {
            GAMapService.unRegisterMapEvent($scope.mapInstance, eventName, callback);
         };

         self.getCurrentMapExtent = function() {
            return GAMapService.getCurrentMapExtent($scope.mapInstance);
         };

         /**
          * @private
          *
          * Helper function to ensure all layers are loaded, async or other wise.
          * */
         self.waitingForAsyncLayer = function() {
            $scope.waitingForNumberOfLayers++;
         };

         /**
          * @private
          *
          * Helper function to ensure all layers are loaded, async or other wise.
          * */
         self.asyncLayerLoaded = function() {
            $scope.waitingForNumberOfLayers--;
         };

         self.filterFeatureLayer = function(layerId, filterValue, featureAttributes) {
            GALayerService.filterFeatureLayer($scope.mapInstance, layerId, filterValue, featureAttributes);
         };

         self.getLayerFeatures = function(layerId) {
            return GALayerService.getLayerFeatures($scope.mapInstance, layerId);
         };

         self.createFeature = function(layerId, geoJson) {
            return GALayerService.createFeature($scope.mapInstance, layerId, geoJson);
         };

         self.addFeatureToLayer = function(layerId, feature) {
            return GALayerService.addFeatureToLayer($scope.mapInstance, layerId, feature);
         };

         self.createWfsClient = function(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
            return GAMapService.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid);
         };

         self.addWfsClient = function(wfsClient) {
            return GAMapService.addWfsClient(wfsClient);
         };

         self.searchWfs = function(clientId, query, attribute) {
            return GAMapService.searchWfs($scope.mapInstance, clientId, query, attribute);
         };

         self.getMeasureFromEvent = function(event) {
            return GAMapService.getMeasureFromEvent($scope.mapInstance, event);
         };

         self.removeFeatureFromLayer = function(layerId, featureId) {
            GALayerService.removeFeatureFromLayer($scope.mapInstance, layerId, featureId);
         };

         self.raiseLayerDrawOrder = function(layerId, delta) {
            GALayerService.raiseLayerDrawOrder($scope.mapInstance, layerId, delta);
         };

         $scope.gaMap = self;

         /**
          * @function
          * Default bind to handle window resizing
          * */
         $(window).bind('resize', function() {
            GAMapService.mapResized($scope.mapInstance);
         });

         //Allowing other directives to get mapInstance from scope could lead
         //to map manipulation outside services and mapcontroller.
         //Though would make things easier.
         /*self.getMapInstance = function() {
          return $scope.mapInstance;
          };*/

         //Initialise map
         $scope.mapInstance = GAMapService.initialiseMap({
            mapElementId : $scope.mapElementId,
            datumProjection : $scope.datumProjection,
            displayProjection : $scope.displayProjection
         });

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

         $scope.$on('$destroy', function() {
            $('#' + $scope.mapElementId).empty();
         });

         $timeout(function() {
            asyncLayersDeferred = $q.defer();
            asyncLayersDeferred.promise.then(function() {
               /**
                * Sends an instance of all map layers when they are all loaded to parent listeners
                * @eventType emit
                * @event layersReady
                * */
               $scope.$emit('layersReady', self.getLayers());
               /**
                * Sends an instance of all map layers when they are all loaded to child listeners
                * @eventType broadcast
                * @event layersReady
                * */
               $scope.$broadcast('layersReady', self.getLayers());
               $scope.layersReady = true;
            });
            if ($scope.waitingForNumberOfLayers === 0) {
               asyncLayersDeferred.resolve();
            }
         });
      },
      compile : function compile() {
         return {
            post : function postLink(scope, element, attributes) {

            }
         };
      },
      transclude : false
   };
} ]);
