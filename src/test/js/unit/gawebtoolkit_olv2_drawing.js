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

            it('Start drawing creates active control for OpenLayers 2', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                        '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                        '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('My feature layer',{ featureType: 'point',
                    color: '#000000',
                    opacity: 1.0,
                    radius: 6});
                //One default control added there for 2 controls for openlayers 2. Default is navigation control.
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
            });

            it('Stop drawing removes active control for OpenLayers 2', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'point',
                    color: '#000000',
                    opacity: 1.0,
                    radius: 6});
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
                $scope.mapController.stopDrawing();
                //Still one control. Default is navigation control.
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
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
                $scope.mapController.startDrawingOnLayer('My feature layer',{ featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
            });

            it('Start drawing creates interaction for OpenLayers 3', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map>';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                //Supply name layer, will create if it doesn't exist. If layer already exists, it must be a layer that supports features.
                $scope.mapController.startDrawingOnLayer('My feature layer',{ featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
                $scope.mapController.stopDrawing();
                //Still one control. Default is navigation control.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should create a new layer to draw label and return GeoJSON feature', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var geoJsonFeature = $scope.mapController.drawLabel('My layer that doesnt exist', {
                    text: 'my label text',
                    fontSize: '14px',
                    lon: 110,
                    lat: -55,
                    fontColor: '#000000',
                    align: 'cm',
                    projection: 'EPSG:4326'
                });
                expect($scope.mapController.getMapInstance().layers.length).toBe(2);
                expect(geoJsonFeature.type).toBe('Feature');
                expect(geoJsonFeature.geometry.type).toBe('Point');
            });

            it('Should create a new layer to draw label with circle and return GeoJSON feature collection', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</ga-map-layer>' +
                    '</ga-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var geoJsonFeature = $scope.mapController.drawLabelWithPoint('My layer that doesnt exist', {
                    text: 'my label text',
                    fontSize: '14px',
                    lon: 110,
                    lat: -55,
                    fontColor: '#000000',
                    align: 'cm',
                    projection: 'EPSG:4326'
                });
                expect($scope.mapController.getMapInstance().layers.length).toBe(2);
                expect(geoJsonFeature.type).toBe('FeatureCollection');
                expect(geoJsonFeature.features.length).toBe(2);
                expect(geoJsonFeature.features[0].geometry.type).toBe('Point');
            });
        });
})();