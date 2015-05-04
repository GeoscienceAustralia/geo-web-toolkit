/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";
    describe(
        'OpenLayers v3 "ga-map" implementation tests',
        function () {
            var $compile,
                $scope,
                $timeout,
                element,
                mapControllerListener;

            var mapWith3DSupportedProj;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                mapControllerListener = jasmine.createSpy('mapControllerListener');
                $scope.$on('mapControllerReady', function (event, args) {
                    mapControllerListener(args);
                    $scope.mapController = args;
                });

                $scope.testWmsLayer = {
                    "mapType": "WMS",
                    "visibility": true,
                    "name": "Australian Seabed Features",
                    "url": "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                    "layers": "Geomorphic_Features",
                    "opacity": 1.0
                };


            }));
            it('Empty Google layer with OpenLayers v2 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                        '<ga-google-layer></ga-google-layer>' +
                    '</ga-map> ';
                var passed = true;
                try {
                    element = angular
                        .element(emptyGooglelayer);
                    $compile(element)($scope);
                    $scope.$digest();
                    $timeout.flush();
                } catch (error) {
                    passed = false;
                }
                expect(passed).toBe(true);
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });
            it('Empty Google layer with OpenLayers v3 should digest and fail due to no support for Google Maps in OpenLayers 3', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-google-layer></ga-google-layer>' +
                    '</ga-map> ';
                var passed = false;
                try {
                    element = angular
                        .element(emptyGooglelayer);
                    $compile(element)($scope);
                    $scope.$digest();
                    $timeout.flush();
                } catch (error) {
                    passed = true;
                }
                expect(passed).toBe(true);
                expect($scope.mapController.getMapInstance().layers).toBe(undefined);
            });
            it('Empty Bing layer, without provided API key and OpenLayers v2 should digest and fail with friendly error message.', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer></ga-bing-layer>' +
                    '</ga-map> ';
                var passed = false;
                try {
                    element = angular
                        .element(emptyGooglelayer);
                    $compile(element)($scope);
                    $scope.$digest();
                    $timeout.flush();
                } catch (error) {
                    passed = true;
                    expect(error.message.indexOf('Missing Bing Maps API key')).toBe(0);
                }
                expect(passed).toBe(true);
            });
            it('Empty Bing layer with OpenLayers v2 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer bing-api-key="12345"></ga-bing-layer>' +
                    '</ga-map> ';
                var passed = true;
                try {
                    element = angular
                        .element(emptyGooglelayer);
                    $compile(element)($scope);
                    $scope.$digest();
                    $timeout.flush();
                } catch (error) {
                    passed = false;
                }
                expect(passed).toBe(true);
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });
            it('Empty Bing layer with OpenLayers v3 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer bing-api-key="12345"></ga-bing-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
            });
            it('Open Street Maps layer with OpenLayers v2 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-osm-layer></ga-osm-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });
            it('Open Street Maps layer with OpenLayers v3 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-osm-layer></ga-osm-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
            });

            it('Open Street Maps layer with OpenLayers v3 should digest and set layer visibility correctly.', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-osm-layer visibility="{{vis}}"></ga-osm-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().item(0).getVisible()).toBe(false);
                $scope.vis = true;
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().item(0).getVisible()).toBe(true);
            });

            it('Google layer with OpenLayers v2 should digest and set layer visibility correctly.', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-google-layer visibility="{{vis}}"></ga-google-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var layer = $scope.mapController.getLayers()[0];
                //Inconsistency found in OLV2 with Google maps (might be intentional), even if the visibility is initialised as false, it is visible.
                //Force Visibility false to show visibility is updated via attribute observe.
                $scope.mapController.setLayerVisibility(layer.id, false);
                expect($scope.mapController.getMapInstance().layers[0].visibility).toBe(false);
                $scope.vis = true;
                $scope.$digest();
                expect($scope.mapController.getMapInstance().layers[0].visibility).toBe(true);
            });

            it('Bing layer with OpenLayers v3 should digest and set layer visibility correctly.', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer bing-api-key="abcd1234" visibility="{{vis}}"></ga-bing-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().item(0).getVisible()).toBe(false);
                $scope.vis = true;
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().item(0).getVisible()).toBe(true);
            });
        });
})();