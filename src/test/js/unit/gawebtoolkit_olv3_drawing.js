/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";

    describe(
        'Drawing feature tests',
        function () {
            var $compile, $scope, $timeout, element, mapControllerListener, layerController1, layerController2, layerController3;

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

            }));


            //Tests
            it('Sanity check. Should have one layer', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-google-layer></ga-google-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance() != null).toBe(true);
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });

            it('Start drawing creates interaction for OpenLayers 3', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
            });

            it('Stop drawing removes interaction for OpenLayers 3', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);

                $scope.mapController.stopDrawing();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });
        });
})();