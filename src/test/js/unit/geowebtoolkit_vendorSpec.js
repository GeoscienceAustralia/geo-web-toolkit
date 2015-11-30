/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";
    describe(
        'OpenLayers v3 "geo-map" implementation tests',
        function () {
            var $compile,
                $scope,
                $timeout,
                element,
                mapControllerListener,
                server;


            //Unable to mock the JSONP request/response used by OpenLayers 2, could use real api key here, but not yet.
            OpenLayers.Layer.Bing.processMetadata = function(metadata) {
                this.metadata = metadata;
                this.initLayer();
                var script = document.getElementById(this._callbackId);
                script.parentNode.removeChild(script);
                window[this._callbackId] = undefined; // cannot delete from window in IE
                delete this._callbackId;
            };

            var mapWith3DSupportedProj;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, $injector) {
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-google-layer></geo-google-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });
            it('Empty Google layer with OpenLayers v3 should digest and fail due to no support for Google Maps in OpenLayers 3', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-google-layer></geo-google-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer></geo-bing-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer bing-api-key="AjHzO1foSTb67AHZKdT3uc_aupuJ1reD3YUVP9yaKwgj1dePq8lAiPU-uPsEFtnT"></geo-bing-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer bing-api-key="AjHzO1foSTb67AHZKdT3uc_aupuJ1reD3YUVP9yaKwgj1dePq8lAiPU-uPsEFtnT"></geo-bing-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);

                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
            });
            it('Open Street Maps layer with OpenLayers v2 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-osm-layer></geo-osm-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().layers.length).toBe(1);
            });
            it('Open Street Maps layer with OpenLayers v3 should digest and create the layer successfully', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-osm-layer></geo-osm-layer>' +
                    '</geo-map> ';
                element = angular
                    .element(emptyGooglelayer);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(1);
            });

            it('Open Street Maps layer with OpenLayers v3 should digest and set layer visibility correctly.', function () {
                var emptyGooglelayer = '<div id="map"></div>' +
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-osm-layer visibility="{{vis}}"></geo-osm-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-google-layer visibility="{{vis}}"></geo-google-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer bing-api-key="AjHzO1foSTb67AHZKdT3uc_aupuJ1reD3YUVP9yaKwgj1dePq8lAiPU-uPsEFtnT" visibility="{{vis}}"></geo-bing-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-osm-layer ng-if="updateLayer" visibility="{{vis}}"></geo-osm-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-google-layer layer-type="{{layerType}}" visibility="{{vis}}"></geo-google-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv2" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer bing-api-key="AjHzO1foSTb67AHZKdT3uc_aupuJ1reD3YUVP9yaKwgj1dePq8lAiPU-uPsEFtnT" layer-type="{{layerType}}" visibility="{{vis}}"></geo-bing-layer>' +
                    '</geo-map> ';
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
                    '<geo-map map-element-id="map" framework="olv3" zoom-level="4" center-position="[130, -25]"> ' +
                    '<geo-bing-layer bing-api-key="AjHzO1foSTb67AHZKdT3uc_aupuJ1reD3YUVP9yaKwgj1dePq8lAiPU-uPsEFtnT" layer-type="{{layerType}}" visibility="{{vis}}"></geo-bing-layer>' +
                    '</geo-map> ';
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