/* global describe, beforeEach, module, angular, inject, it, expect, jasmine */
(function () {
    "use strict";

    describe(
        'OpenLayers v3 "ga-map-marker" implementation tests',
        function () {
            var $compile, $scope, $timeout, element, listener, preload;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                $scope.overviewOptions = {};
                listener = jasmine.createSpy('listener');
                preload = jasmine.createSpy('preload');
                $scope.dynamicMarkers = [];
                $scope.$on('mapControllerReady', function (event, args) {
                    listener(args);
                    $scope.mapController = args;
                    //Mock 'getLayerPxFromLonLat' due to reliance on screen coords
                    $scope.mapController.getMapInstance().getPixelFromCoordinate = function(coord) { return [123,456]; };
                    ol.geom.Point.prototype.computeExtent = function(extent) {
                        return ol.extent.createOrUpdateFromCoordinate([12,34], extent);
                    };

                });
                element = angular
                    .element(
                    '<ga-map map-element-id="gamap" framework="olv3" zoom-level="4" center-position="[130, -25]">' +
                    '<ga-osm-layer></ga-osm-layer>' +
                    '<ga-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<ga-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<ga-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<ga-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<ga-map-marker ng-repeat="marker in dynamicMarkers" ' +
                    'layer-name="{{marker.name}}" ' +
                    'marker-lat="{{marker.lat}}" ' +
                    'marker-long="{{marker.lon}}" ' +
                    'marker-icon="{{marker.url}}" ' +
                    'marker-height="{{marker.height}}" ' +
                    'marker-width="{{marker.width}}" />' +
                    '</ga-map><div id="gamap"></div>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            //Tests
            it('Should have called event "mapControllerReady" with mapController', function () {
                expect($scope.mapController !== null);
                expect(listener).toHaveBeenCalledWith($scope.mapController);
            });


            it('Should create markers, reusing the same same layer', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.getLayers().getLength()).toBe(2);

            });

            it('Should create markers via mapController, reusing the same same layer', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.getLayers().getLength()).toBe(2);
                $scope.mapController.setMapMarker({lat:-20,lon:130},'foo','/test/foo.png',{width:'50',height:'50'});
                $scope.mapController.setMapMarker({lat:-20,lon:130},'foo','/test/foo.png',{width:'50',height:'50'});
                $scope.mapController.setMapMarker({lat:-20,lon:130},'foo','/test/foo.png',{width:'50',height:'50'});

                expect(mapInstance.getLayers().getLength()).toBe(3);

            });


            it('Should be able to create markers dynamically from an ng-repeat', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.getLayers().getLength()).toBe(2);
                expect(mapInstance.getLayers().item(1).getSource().getFeatures() != null).toBe(true);
                expect(mapInstance.getLayers().item(1).getSource().getFeatures().length).toBe(4);

                $scope.dynamicMarkers.push({
                    name: 'myMarkerLayer',
                    lat: -20,
                    lon: 130,
                    url: '/dummy/path.png',
                    height: '50px',
                    width: '50px'
                });

                $scope.$digest();

                expect(mapInstance.getLayers().item(1).getSource().getFeatures().length).toBe(5);

            });

            it('Should be able to destroy markers dynamically from an ng-repeat', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.getLayers().getLength()).toBe(2);
                expect(mapInstance.getLayers().item(1).getSource().getFeatures() != null).toBe(true);
                expect(mapInstance.getLayers().item(1).getSource().getFeatures().length).toBe(4);

                $scope.dynamicMarkers.push({
                    name: 'myMarkerLayer',
                    lat: -20,
                    lon: 130,
                    url: '/dummy/path.png',
                    height: '50px',
                    width: '50px'
                });

                $scope.$digest();

                expect(mapInstance.getLayers().item(1).getSource().getFeatures().length).toBe(5);
                $scope.dynamicMarkers.pop();

                $scope.$digest();

                expect(mapInstance.getLayers().item(1).getSource().getFeatures().length).toBe(4);
            });

        });
})();