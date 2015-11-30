/* global describe, beforeEach, module, angular, inject, it, expect, jasmine */
(function () {
    "use strict";

    describe(
        'OpenLayers v2 "geo-map-marker" implementation tests',
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
                    $scope.mapController.getMapInstance().getLayerPxFromLonLat = function(latLon) { return {x: 123,y:456}; };
                    $scope.mapController.getMapInstance().getPixelFromLonLat = function (lonlat) { return {x: 123, y:456 };};
                });
                element = angular
                    .element(
                    '<geo-map map-element-id="geomap" framework="olv2" zoom-level="4" center-position="[130, -25]">' +
                    '<geo-osm-layer></geo-osm-layer>' +
                    '<geo-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<geo-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<geo-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +
                    '<geo-map-marker layer-name="myMarkerLayer" marker-lat="-20" marker-long="130" marker-icon="dummy/icon/url.png" marker-height="50" marker-width="50" />' +                    '<geo-map-marker ng-repeat="marker in dynamicMarkers" ' +
                    'layer-name="{{marker.name}}" ' +
                    'marker-lat="{{marker.lat}}" ' +
                    'marker-long="{{marker.lon}}" ' +
                    'marker-icon="{{marker.url}}" ' +
                    'marker-height="{{marker.height}}" ' +
                    'marker-width="{{marker.width}}" />' +
                    '</geo-map><div id="geomap"></div>');
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
                expect(mapInstance.layers.length).toBe(2);

            });

            it('Should create markers via mapController, reusing the same same layer', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.layers.length).toBe(2);
                $scope.mapController.setMapMarker({x:20,y:130},'foo','/test/foo.png',{width:'50',height:'50'});
                $scope.mapController.setMapMarker({x:20,y:130},'foo','/test/foo.png',{width:'50',height:'50'});
                $scope.mapController.setMapMarker({x:20,y:130},'foo','/test/foo.png',{width:'50',height:'50'});

                expect(mapInstance.layers.length).toBe(3);

            });

            it('Should have 4 markers on the one layer', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.layers.length).toBe(2);
                expect(mapInstance.layers[1].markers != null).toBe(true);
                expect(mapInstance.layers[1].markers.length).toBe(4);

            });

            it('Should be able to create markers dynamically from an ng-repeat', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.layers.length).toBe(2);
                expect(mapInstance.layers[1].markers != null).toBe(true);
                expect(mapInstance.layers[1].markers.length).toBe(4);

                $scope.dynamicMarkers.push({
                    name: 'myMarkerLayer',
                    lat: -20,
                    lon: 130,
                    url: '/dummy/path.png',
                    height: '50px',
                    width: '50px'
                });

                $scope.$digest();

                expect(mapInstance.layers[1].markers.length).toBe(5);

            });

            it('Should be able to destroy markers dynamically from an ng-repeat', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                //One for OSM, one for shared marker layer
                expect(mapInstance.layers.length).toBe(2);
                expect(mapInstance.layers[1].markers != null).toBe(true);
                expect(mapInstance.layers[1].markers.length).toBe(4);

                $scope.dynamicMarkers.push({
                    name: 'myMarkerLayer',
                    lat: -20,
                    lon: 130,
                    url: '/dummy/path.png',
                    height: '50px',
                    width: '50px'
                });

                $scope.$digest();

                expect(mapInstance.layers[1].markers.length).toBe(5);
                $scope.dynamicMarkers.pop();

                $scope.$digest();

                expect(mapInstance.layers[1].markers.length).toBe(4);
            });

        });
})();