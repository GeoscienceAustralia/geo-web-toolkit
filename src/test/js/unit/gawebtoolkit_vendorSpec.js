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
                mapControllerListener,
                $httpBackend;

            var mapWith3DSupportedProj;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_,$injector) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend
                    .when('GET', 'http://dev.virtualearth.net/REST/v1/Imagery/Metadata/Road?key=abcd1234&jsonp=_callback_OpenLayers_Layer_Bing_15&include=ImageryProviders')
                    .respond('_callback_OpenLayers_Layer_Bing_15({"authenticationResultCode":"ValidCredentials","brandLogoUri":"http:\/\/dev.virtualearth.net\/Branding\/logo_powered_by.png","copyright":"Copyright © 2015 Microsoft and its suppliers. All rights reserved. This API cannot be accessed and the content and any results may not be used, reproduced or transmitted in any manner without express written permission from Microsoft Corporation.","resourceSets":[{"estimatedTotal":1,"resources":[{"__type":"ImageryMetadata:http:\/\/schemas.microsoft.com\/search\/local\/ws\/rest\/v1","imageHeight":256,"imageUrl":"http:\/\/ecn.{subdomain}.tiles.virtualearth.net\/tiles\/r{quadkey}.jpeg?g=3467&mkt={culture}&shading=hill","imageUrlSubdomains":["t0","t1","t2","t3"],"imageWidth":256,"imageryProviders":[{"attribution":"© 2015 Nokia","coverageAreas":[{"bbox":[-90,-180,90,180],"zoomMax":9,"zoomMin":1},{"bbox":[14,-180,90,-50],"zoomMax":21,"zoomMin":10},{"bbox":[27,-32,40,-13],"zoomMax":21,"zoomMin":10},{"bbox":[35,-11,72,20],"zoomMax":21,"zoomMin":10},{"bbox":[21,20,72,32],"zoomMax":21,"zoomMin":10},{"bbox":[21.92,113.14,22.79,114.52],"zoomMax":21,"zoomMin":10},{"bbox":[21.73,119.7,25.65,122.39],"zoomMax":21,"zoomMin":10},{"bbox":[0,98.7,8,120.17],"zoomMax":21,"zoomMin":10},{"bbox":[0.86,103.2,1.92,104.45],"zoomMax":21,"zoomMin":10}]},{"attribution":"© AND","coverageAreas":[{"bbox":[-90,-180,90,180],"zoomMax":21,"zoomMin":10}]},{"attribution":"© 2015 MapData Sciences Pty Ltd, PSMA","coverageAreas":[{"bbox":[-45,111,-9,156],"zoomMax":21,"zoomMin":5},{"bbox":[-49.7,164.42,-30.82,180],"zoomMax":21,"zoomMin":5}]},{"attribution":"© 2015 Zenrin","coverageAreas":[{"bbox":[23.5,122.5,46.65,151.66],"zoomMax":21,"zoomMin":4}]},{"attribution":"© 2015 Intermap","coverageAreas":[{"bbox":[49,-11,60,2],"zoomMax":21,"zoomMin":1}]},{"attribution":"© 2015 Microsoft Corporation","coverageAreas":[{"bbox":[-90,-180,90,180],"zoomMax":21,"zoomMin":1}]}],"vintageEnd":null,"vintageStart":null,"zoomMax":21,"zoomMin":1}]}],"statusCode":200,"statusDescription":"OK","traceId":"816e97f993be4a949a53937228cc947a|HK20240353|02.00.152.3000|"})');
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
                    '<ga-bing-layer bing-api-key="abcd1234"></ga-bing-layer>' +
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
                    '<ga-bing-layer bing-api-key="abcd1234"></ga-bing-layer>' +
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

            it('Should reconstruct Open Street Maps layer if used with an ng-if', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-osm-layer ng-if="updateLayer" visibility="{{vis}}"></ga-osm-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                $scope.updateLayer = true;
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
                $scope.updateLayer = false;
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(0);
                $scope.updateLayer = true;
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
            });

            it('Should observe layer-type for changes and reconstruct layer as required for Google vendor layer', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-google-layer layer-type="{{layerType}}" visibility="{{vis}}"></ga-google-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                $scope.layerType = 'Hybrid';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId1 = $scope.mapController.getMapInstance().layers[0].id;
                $scope.layerType = 'Satellite';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId2 = $scope.mapController.getMapInstance().layers[0].id;
                $scope.layerType = 'Hybrid';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId3 = $scope.mapController.getMapInstance().layers[0].id;
                //Show that layers are being reconstructed when layer-type is changed.
                expect(layerId1 !== layerId2).toBe(true);
                expect(layerId2 !== layerId3).toBe(true);
            });

            it('Should observe layer-type for changes and reconstruct layer as required for Bing vendor layer with OpenLayers 2', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer bing-api-key="abcd1234" layer-type="{{layerType}}" visibility="{{vis}}"></ga-bing-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                $scope.layerType = 'Hybrid';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId1 = $scope.mapController.getMapInstance().layers[0].id;
                $scope.layerType = 'Satellite';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId2 = $scope.mapController.getMapInstance().layers[0].id;
                $scope.layerType = 'Hybrid';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
                var layerId3 = $scope.mapController.getMapInstance().layers[0].id;
                //Show that layers are being reconstructed when layer-type is changed.
                expect(layerId1 !== layerId2).toBe(true);
                expect(layerId2 !== layerId3).toBe(true);
            });

            it('Should observe layer-type for changes and reconstruct layer as required for Bing vendor layer with OpenLayers 3', function () {
                var emptyBingLayerHtml = '<div id="map"></div>' +
                    '<ga-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-bing-layer bing-api-key="abcd1234" layer-type="{{layerType}}" visibility="{{vis}}"></ga-bing-layer>' +
                    '</ga-map> ';
                $scope.vis = false;
                $scope.layerType = 'Hybrid';
                element = angular
                    .element(emptyBingLayerHtml);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
                var layerId1 = $scope.mapController.getLayers()[0].id;
                $scope.layerType = 'Satellite';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
                var layerId2 = $scope.mapController.getLayers()[0].id;
                $scope.layerType = 'Hybrid';
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
                var layerId3 = $scope.mapController.getLayers()[0].id;
                //Show that layers are being reconstructed when layer-type is changed.
                expect(layerId1 !== layerId2).toBe(true);
                expect(layerId2 !== layerId3).toBe(true);
            });
        });
})();