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

            it('Start drawing creates interaction for OpenLayers 3', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('My feature layer', { featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
            });

            it('Should fail to start drawing due to specifying an invalid layer to draw on.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var passed = false;
                try {
                    $scope.mapController.startDrawingOnLayer('Simple map layer name', { featureType: 'Point',
                        color: "#000000",
                        opacity: 1.0,
                        radius: 6});
                } catch (error) {
                    passed = true;
                    expect(error.message.indexOf('Simple map layer name') > -1).toBe(true);
                }
                expect(passed).toBe(true);

                //9 default interactions, no interaction added due to error thrown.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should start drawing when specifying a valid layer to draw on.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-feature-layer layer-name="Simple map layer name">' +
                    '</geo-feature-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('Simple map layer name', { featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                $scope.mapController.stopDrawing('Simple map layer name');
                $scope.mapController.startDrawingOnLayer('Simple map layer name', { featureType: 'LineString',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                $scope.mapController.stopDrawing('Simple map layer name');
                $scope.mapController.startDrawingOnLayer('Simple map layer name', { featureType: 'Polygon',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //Forget to stopDrawing, existing interaction removed and replaced by default
                //$scope.mapController.stopDrawing('Simple map layer name');
                $scope.mapController.startDrawingOnLayer('Simple map layer name', { featureType: 'Circle',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                $scope.mapController.stopDrawing('Simple map layer name');

                //9 default interactions, no interaction added due to error thrown.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Stop drawing removes interaction for OpenLayers 3', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                $scope.mapController.startDrawingOnLayer('My drawing layer', { featureType: 'Point',
                    color: "#000000",
                    opacity: 1.0,
                    radius: 6});
                //9 default interactions added there for 10 interactions for openlayers 3. Default interactions are navigation related for different input.
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);

                $scope.mapController.stopDrawing();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should create a new layer to draw label and return GeoJSON feature', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
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
                    radius: 6,
                    color: '#000000',
                    align: 'cm',
                    projection: 'EPSG:4326'
                });
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(2);
                expect(geoJsonFeature.type).toBe('Feature');
                expect(geoJsonFeature.geometry.type).toBe('Point');
            });

            it('Should create a new layer to draw label with circle and return GeoJSON feature collection', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
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
                    color: '#000000',
                    align: 'cm',
                    radius: 5,
                    projection: 'EPSG:4326',
                    fillOpacity: 0.5
                });
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(2);
                expect(geoJsonFeature.type).toBe('FeatureCollection');
                expect(geoJsonFeature.features.length).toBe(1);
                expect(geoJsonFeature.features[0].geometry.type).toBe('Point');
            });

            it('Should fire \'startRemoveSelectedFeature\' with invalid layer name and NOT create a vector layer with provided name', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var mapLayers = $scope.mapController.getMapInstance().getLayers();
                var layerCount = mapLayers.getLength();
                $scope.mapController.startRemoveSelectedFeature('My layer that doesnt exist');
                expect(mapLayers.getLength()).toBe(layerCount);
            });

            it('Should fire \'stopRemoveSelectedFeature\' without a layer and do nothing.', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.startRemoveSelectedFeature('My layer that doesnt exist');
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.stopRemoveSelectedFeature();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should fire \'stopRemoveSelectedFeature\' and deactivate interaction', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                var mapLayers = $scope.mapController.getMapInstance().getLayers();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.startRemoveSelectedFeature('My layer');
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
                expect($scope.mapController.getMapInstance().getInteractions().item(9).get('active')).toBe(true);
                $scope.mapController.stopRemoveSelectedFeature();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should fire \'stopRemoveSelectedFeature\' and deactivate interaction', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.startRemoveSelectedFeature('My layer');
                $scope.mapController.getMapInstance().get('_geowebtoolkit').removeFeaturesControl.handleEvent(true);
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
                expect($scope.mapController.getMapInstance().getInteractions().item(9).get('active')).toBe(true);
                $scope.mapController.stopRemoveSelectedFeature();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should register an interaction when registering a control event for "measurepartial"', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.registerControlEvent('dummycontrolid', 'measurepartial', function () {
                    //measure event
                });
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);

            });

            it('Should register an interaction when registering a control event for "measure"', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.registerControlEvent('dummycontrolid', 'measure', function () {
                    //measure event
                });
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);

            });

            it('Should remove any existing draw interactions and readd if events registered more than once for "measurepartial"/"measure".', function () {
                var elementHtml = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">' +
                    '</geo-map-layer>' +
                    '<geo-feature-layer layer-name="My layer" />' +
                    '</geo-map> ';
                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
                $scope.mapController.registerControlEvent('dummycontrolid', 'measurepartial', function () {
                    //measure event
                });
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);
                $scope.mapController.registerControlEvent('dummycontrolid', 'measure', function () {
                    //measure event
                });
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(10);

            });
        });
})();