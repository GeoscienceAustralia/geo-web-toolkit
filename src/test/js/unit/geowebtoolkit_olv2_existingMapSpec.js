/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";

    describe(
        'Existing map instance spec for OLV2',
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
                    $scope.myLayers = $scope.mapController.getLayers();
                });

                var elementHtml =
                    '<geo-map ng-if="existingInstance" framework="olv2" existing-map-instance="existingInstance"> ' +
                    '</geo-map>' +
                    '<geo-layer-control ng-if="existingInstance" ng-repeat="layer in myLayers" layer-data="layer" map-controller="mapController" />' +
                    '<div id="map"></div>';


                element = angular
                    .element(elementHtml);
                $compile(element)($scope);
                $scope.$digest();
                $scope.$digest();

                var map = new OpenLayers.Map("map");

                var ol_wms = new OpenLayers.Layer.WMS(
                    "Australian Landsat Mosaic",
                    "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                    {layers: "0"}
                );

                var dm_wms = new OpenLayers.Layer.WMS(
                    "Australian Seabed Features",
                    "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                    {
                        layers: "Geomorphic_Features",
                        transparent: "true",
                        format: "image/png"
                    },
                    {isBaseLayer: false, visibility: false}
                );

                var featureLayer = new OpenLayers.Layer.Vector("feature layer1");
                var featureReader = new OpenLayers.Format.GeoJSON();
                $scope.testFeature = {
                    "type": "Feature",
                    "crs": {
                        "type": "name",
                        "properties": {
                            "name": "EPSG:4326"
                        }
                    },
                    "properties": {
                        "name": "Testing name",
                        "anotherProp": "Another value"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [ 117.359, -25.284 ]
                    }
                };
                var olFeature = featureReader.read(angular.toJson($scope.testFeature), $scope.testFeature.type);
                featureLayer.addFeatures([olFeature]);

                map.addLayers([ol_wms, dm_wms, featureLayer]);
                map.zoomToMaxExtent();

                $scope.existingInstance = map;

                $scope.$digest();
                $scope.$digest();
                $timeout.flush();
            }));


            //Tests
            it('Sanity check. Should have 3 layers', function () {

                expect($scope.mapController.getMapInstance() != null).toBe(true);
                expect($scope.mapController.getMapInstance().layers.length).toBe(3);
            });

            it('Should fire mapController function "zoomToMaxExtent" without an exception given valid map instance', function () {
                var passed = false;
                try {
                    $scope.mapController.zoomToMaxExtent();
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "currentZoomLevel" without an exception given valid map instance', function () {
                var passed = false;
                try {
                    var zoomLevel = $scope.mapController.currentZoomLevel();
                    expect(zoomLevel != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "registerMapMouseMove" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapMouseMove(func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "registerMapMouseMoveEnd" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapMouseMoveEnd(func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "registerMapClick" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapClick(func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "unRegisterMapClick" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapClick(func);
                    $scope.mapController.unRegisterMapClick(func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "addControl" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.addControl('OverviewMap', {});
                    $scope.mapController.addControl('OverviewMap', null, 'invalid_element_id', 'custom_id');
                    var control = $scope.mapController.getMapInstance().getControlsBy('id', 'custom_id');
                    expect(control != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should have no controls listed when created as a static map.', function () {
                expect($scope.mapController.getMapInstance().controls.length).toBe(4); //default controls when creating an OLV2 map directly
            });
            it('Should fire mapController function "getLonLatFromPixel" without an exception given valid input', function () {
                var passed = false;
                try {
                    var lonLat = $scope.mapController.getLonLatFromPixel(100, 200);
                    expect(lonLat != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLonLatFromPixel" with an exception given invalid input', function () {
                var passed = false;
                try {
                    $scope.mapController.getLonLatFromPixel(null, null);
                    passed = false;
                } catch (e) {
                    passed = true;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getPixelFromLonLat" without an exception given valid input', function () {
                var passed = false;
                try {
                    var lonLat = $scope.mapController.getPixelFromLonLat(130, -20);
                    expect(lonLat != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getPixelFromLonLat" with an exception given invalid input', function () {
                var lonPassed = false;
                var latPassed = false;
                try {
                    $scope.mapController.getPixelFromLonLat(null, 123);
                } catch (e) {
                    lonPassed = true;
                }

                try {
                    $scope.mapController.getPixelFromLonLat(123, null);
                } catch (e) {
                    latPassed = true;
                }

                expect(lonPassed).toBe(true);
                expect(latPassed).toBe(true);
            });
            it('Should fire mapController function "getPointFromEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var point = $scope.mapController.getPointFromEvent({xy: {x: 50, y: 100}});
                    expect(point != null).toBe(true);
                    expect(point.x).toBe(50);
                    expect(point.y).toBe(100);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLayers" without an exception ', function () {
                $timeout(function () {
                    var passed = false;
                    try {
                        var layers = $scope.mapController.getLayers();
                        expect(layers != null).toBe(true);
                        expect(layers.length > 0).toBe(true);
                        passed = true;
                    } catch (e) {
                    }
                    expect(passed).toBe(true);
                });

            });
            it('Should fire mapController function "getLayersByName" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layers = $scope.mapController.getLayersByName('Australian Landsat Mosaic');
                    expect(layers != null).toBe(true);
                    expect(layers.length > 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLayersByName" without an exception given valid input that results in no values', function () {
                var passed = false;
                try {
                    var layers = $scope.mapController.getLayersByName('test');
                    expect(layers != null).toBe(true);
                    expect(layers.length === 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLayersByName" with an exception given invalid input', function () {
                var passed = false;
                try {
                    $scope.mapController.getLayersByName({});
                    passed = false;
                } catch (e) {
                    passed = true;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLayersByName" without an exception given valid input that results in no values', function () {
                var passed = false;
                try {
                    var layers = $scope.mapController.getLayersByName('test');
                    expect(layers != null).toBe(true);
                    expect(Object.prototype.toString.call(layers) === '[object Array]').toBe(true);
                    expect(layers.length === 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "zoomToLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayersByName('Australian Landsat Mosaic')[0];
                    $scope.mapController.zoomToLayer(layer.id);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getProjection" without an exception', function () {
                var projection = $scope.mapController.getProjection();
                expect(projection != null).toBe(true);
            });
            it('Should fire mapController function "getDisplayProjection" without an exception', function () {
                var projection = $scope.mapController.getDisplayProjection();

                expect(projection != null).toBe(true);
            });
            it('Should fire mapController function "setLayerVisibility" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setLayerVisibility(layer.id, true);
                    var visibleLayer = $scope.mapController.getLayers()[0];
                    expect(visibleLayer.visibility === true).toBe(true);
                    $scope.mapController.setLayerVisibility(layer.id, false);
                    var invisibleLayer = $scope.mapController.getLayers()[0];
                    expect(invisibleLayer.visibility === false).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });

            it('Should fire mapController function "setLayerVisibility" with an exception given invalid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setLayerVisibility(layer.id, {});
                    passed = false;
                } catch (e) {
                    passed = true;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "createBoundingBox" without an exception given valid input', function () {
                var passed = false;
                try {
                    var boundingBox = $scope.mapController.createBoundingBox([
                        [100, 100],
                        [20, 20]
                    ]);
                    expect(boundingBox != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "createBounds" without an exception given valid input', function () {
                var passed = false;
                try {
                    var bounds = $scope.mapController.createBounds([
                        [100, 100],
                        [20, 20]
                    ]);
                    expect(bounds != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "zoomToExtent" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.zoomToExtent([
                        [100, 100],
                        [20, 20]
                    ]);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "zoomTo" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.zoomTo(7);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "zoomTo" with an exception given invalid input', function () {
                var passed = false;
                try {
                    $scope.mapController.zoomTo({});
                    passed = false;
                } catch (e) {
                    passed = true;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setBaseLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setBaseLayer(layer.id);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setCenter" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.setCenter(100, 100, 'EPSG:4326');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "isBaseLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    var isbaselayer = $scope.mapController.isBaseLayer(layer.id);
                    expect(isbaselayer).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setOpacity" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setOpacity(layer.id, 0.5);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setOpacity" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setOpacity(layer.id, 0.5);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setOpacity" with an exception given invalid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setOpacity(layer.id, {});
                    passed = false;
                } catch (e) {
                    passed = true;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setMapMarker" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.setMapMarker({x: 50, y: 50}, 'testgroupname', 'http://localhost:8080', {width: 50, height: 50});
                    expect($scope.mapController.getMarkerCountForLayerName('testgroupname') > 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "removeLayerByName" without an exception given valid input', function () {
                expect($scope.mapController.getLayers().length).toBe(3);
                $scope.mapController.removeLayerByName('Australian Landsat Mosaic');
                expect($scope.mapController.getLayers().length).toBe(2);
            });
            it('Should fire mapController function "removeLayersByName" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.removeLayersByName('Australian Landsat Mosaic');
                    expect($scope.mapController.getLayers().length).toBe(2);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "removeLayerById" without an exception given valid input', function () {
                var passed = false;
                try {
                    var currentLayer = $scope.mapController.getLayers()[0];
                    $scope.mapController.removeLayerById(currentLayer.id);
                    expect($scope.mapController.getLayers().length).toBe(2);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getMarkerCountForLayerName" without an exception given valid input', function () {
                var passed = false;
                try {
                    var markerCount = $scope.mapController.getMarkerCountForLayerName('Australian Landsat Mosaic');
                    expect(markerCount).toBe(0);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "drawPolyLine" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.drawPolyLine([
                        {lon: 100, lat: 20},
                        {lon: 90, lat: 20}
                    ]);
                    $scope.mapController.drawPolyLine([
                        {lon: 100, lat: 20},
                        {lon: 90, lat: 20}
                    ], 'optionalLayerName');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "registerFeatureSelected" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    var func = function () {
                    };
                    $scope.mapController.registerFeatureSelected(layer.id, func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "drawPolyLine" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.drawPolyLine([
                        {lon: 100, lat: 20},
                        {lon: 90, lat: 20}
                    ]);
                    $scope.mapController.drawPolyLine([
                        {lon: 100, lat: 20},
                        {lon: 90, lat: 20}
                    ], 'optionalLayerName');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });

            it('Should fire mapController function "registerMapEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapEvent('addlayer', func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "unRegisterMapEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerMapEvent('addlayer', func);
                    $scope.mapController.unRegisterMapEvent('addlayer', func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getCurrentMapExtent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var currentExtent = $scope.mapController.getCurrentMapExtent();
                    expect(currentExtent != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "filterFeatureLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[2];
                    $scope.mapController.filterFeatureLayer(layer.id, 'test', 'NAME');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getLayerFeatures" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[2];
                    var features = $scope.mapController.getLayerFeatures(layer.id);
                    expect(features.length > 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "createFeature" without an exception given valid input', function () {
                var passed = false;
                try {
                    var feature = $scope.mapController.createFeature($scope.testFeature);
                    expect(feature != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "addFeatureToLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[2];
                    var feature = $scope.mapController.createFeature($scope.testFeature);
                    var featureDto = $scope.mapController.addFeatureToLayer(layer.id, feature);
                    expect(feature != null).toBe(true);
                    expect(featureDto != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "createWfsClient" without an exception given valid input', function () {
                var passed = false;
                try {
                    var client = $scope.mapController.createWfsClient(
                        'http://localhost:8080',
                        'test',
                        'test', '1.1.0',
                        'geoName',
                        'EPSG:4326',
                        true);
                    expect(client != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "addWfsClient" without an exception given valid input', function () {
                var passed = false;
                try {
                    var client = $scope.mapController.createWfsClient(
                        'http://localhost:8080',
                        'test',
                        'test', '1.1.0',
                        'geoName',
                        'EPSG:4326',
                        true);
                    expect(client != null).toBe(true);
                    var clientDto = $scope.mapController.addWfsClient(client);
                    expect(clientDto != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "searchWfs" without an exception given valid input', function () {
                var passed = false;
                try {
                    var client = $scope.mapController.createWfsClient(
                        'http://localhost:8080',
                        'test',
                        'test', '1.1.0',
                        'geoName',
                        'EPSG:4326',
                        true);
                    expect(client != null).toBe(true);
                    var clientDto = $scope.mapController.addWfsClient(client);
                    expect(clientDto != null).toBe(true);
                    var searchResult = $scope.mapController.searchWfs(clientDto.clientId, 'testquery', 'NAME');
                    expect(searchResult != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getMeasureFromEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    //pass in valid openlayers equivalent, literal will do.
                    var measure = $scope.mapController.getMeasureFromEvent({geometry: [
                        {x: 5, y: 5},
                        {x: 2, y: 4}
                    ]});
                    expect(measure != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "removeFeatureFromLayer" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[2];
                    var features = $scope.mapController.getLayerFeatures(layer.id);

                    expect(features != null).toBe(true);
                    expect(features.length > 0).toBe(true);

                    $scope.mapController.removeFeatureFromLayer(layer.id, features[0].id);
                    features = $scope.mapController.getLayerFeatures(layer.id);
                    expect(features.length === 0).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });

            it('Should fire mapController function "raiseLayerDrawOrder" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[2];
                    $scope.mapController.raiseLayerDrawOrder(layer.id, 1);
                    var otherLayer = $scope.mapController.getLayers()[0];
                    //result from first get layers is not the same as other layers due to\
                    //array order changed.
                    expect(layer.id !== otherLayer.id).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            //Tests
            it('Should instantiate an OpenLayers map', function () {
                expect($scope.mapController.getMapInstance() != null).toBe(true);
            });
            it('Should have added 3 layers to the map instnace', function () {
                expect($scope.mapController.getMapInstance().layers.length).toBe(3);
            });

            it('Should return geoJson coordinate arrays for getCurrentMapExtent', function () {
                //Because an extent has 4 points
                expect($scope.mapController.getCurrentMapExtent().length).toBe(4);
                //Because geoJson stores coordinates as [lon,lat]
                expect($scope.mapController.getCurrentMapExtent()[0].length).toBe(2);
            });
        });
})();