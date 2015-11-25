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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-google-layer></geo-google-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                        '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                        '</geo-map-layer>' +
                    '</geo-map> ';
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

            it('Start drawing creates a layer using layer name if it doesn\'t already exist', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('My feature layer',{ featureType: 'point',
                    color: '#000000',
                    opacity: 1.0,
                    radius: 6});
                //Creates layer has it doesn't exist yet.
                expect($scope.mapController.getMapInstance().layers[1].name).toBe('My feature layer');
            });

            it('Stop drawing removes active control for OpenLayers 2', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
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

            it('Should create a new layer to draw label and return GeoJSON feature', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
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
                expect(geoJsonFeature.features.length).toBe(1);
                expect(geoJsonFeature.features[0].geometry.type).toBe('Point');
            });

            it('Should fire \'startRemoveSelectedFeature\' with invalid layer name and NOT create a vector layer with provided name. Also no control added.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var mapLayers = $scope.mapController.getMapInstance().layers;
                var layerCount = mapLayers.length;
                var controls = $scope.mapController.getMapInstance().controls;
                var controlCount = controls.length;
                expect(controlCount).toBe(1);
                $scope.mapController.startRemoveSelectedFeature('My layer that doesnt exist');
                expect(controls.length).toBe(controlCount);
                expect(mapLayers.length).toBe(layerCount);
            });

            it('Should fire \'stopRemoveSelectedFeature\' without a layer and do nothing.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
                $scope.mapController.startRemoveSelectedFeature('My layer that doesnt exist');
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
                $scope.mapController.stopRemoveSelectedFeature();
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
            });

            it('Should start drawing when specifying a valid layer to draw on.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="Simple map layer name">' +
                    '</geo-feature-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
                $scope.mapController.stopDrawing('Simple map layer name');
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'LineString',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
                //Forget to stopDrawing, existing interaction removed and replaced by default
                //$scope.mapController.stopDrawing('Simple map layer name');
                $scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'Polygon',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
                //Circle not implemented.
                //$scope.mapController.startDrawingOnLayer('Simple map layer name',{ featureType: 'Circle',
                //    color: "#000000",
                //    opacity: 1.0,
                //    radius: 6});
                //$scope.mapController.stopDrawing('Simple map layer name');

                $scope.mapController.stopDrawing('Simple map layer name');
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
            });

            it('Should fire \'startRemoveSelectedFeature\' with a valid layer name and add control.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var mapLayers = $scope.mapController.getMapInstance().layers;
                var layerCount = mapLayers.length;
                var controls = $scope.mapController.getMapInstance().controls;
                var controlCount = controls.length;
                expect(controlCount).toBe(1);
                $scope.mapController.startRemoveSelectedFeature('My layer');
                expect(controls.length).toBe(controlCount + 1);
                expect(mapLayers.length).toBe(layerCount);
            });

            it('Should fire \'stopRemoveSelectedFeature\' with valid a layer and remove control.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var mapLayers = $scope.mapController.getMapInstance().layers;
                var controls = $scope.mapController.getMapInstance().controls;
                var controlCount = controls.length;
                expect(controlCount).toBe(1);
                $scope.mapController.startRemoveSelectedFeature('My layer');
                expect($scope.mapController.getMapInstance().controls.length).toBe(2);
                expect($scope.mapController.getMapInstance().controls[1].active).toBe(true);
                $scope.mapController.stopRemoveSelectedFeature();
                expect($scope.mapController.getMapInstance().controls.length).toBe(1);
            });
        });
})();