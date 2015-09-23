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
            var mapThatIsStatic;

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
                proj4.defs("EPSG:102113","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
                proj4.defs("EPSG:102100","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
                var ele = '<div id="map"></div><ga-map map-element-id="map" framework="olv3" display-projection="EPSG:4326" datum-projection="EPSG:102100"  zoom-level="4" center-position="[130, -25]"> ' +
                    '<ga-map-layer layer-name="Test layer name 1" ' +
                    'layer-type="WMS" ' +
                    'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer" ' +
                    'layers="World Bathymetry Image,Bathy Areas,Australian Landsat,Hillshade 3 second" ' +
                    'wrap-date-line="true" ' +
                    'visibility="true" ' +
                    'max-zoom-level="13" ' +
                    'format="image/png" ' +
                    'is-base-layer="true">' +
                    '</ga-map-layer>' +
                    '<ga-map-layer layer-name="Test layer name 2" ' +
                    'layer-type="WMS" ' +
                    'wrap-date-line="true" ' +
                    'layer-url="http://www.ga.gov.au/gis/services/topography/Australian_Topography_2014_WM/MapServer/WMSServer" ' +
                    'layers="Populated_Places_1,Populated_Places_2,Populated_Places_3,Populated_Places_4,Populated_Places_5,Populated_Places_6,Populated_Places_7,Populated_Places_8"> ' +
                    '</ga-map-layer> ' +
                    '<ga-feature-layer layer-name="feature layer1">' +
                    '<ga-feature geo-json-feature="testFeature"></ga-feature>' +
                    '</ga-feature-layer>' +
                    '<ga-map-control map-control-name="scaleline" map-control-id="myScaleLineTestId"></ga-map-control> ' +
                    '</ga-map> ';
                mapWith3DSupportedProj = ele.replace('EPSG:102100','EPSG:3857');

                mapThatIsStatic = ele.replace('map-element-id="map"','map-element-id="map" is-static-map="true"');
                element = angular
                    .element(ele);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            it('Should fire layer service function "createLayer" without an exception given valid value', function () {
                var args = {
                    layerUrl: "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                    layerName: "Foo",
                    layers:"Australian Landsat",
                    wrapDateLine: true,
                    layerType: "WMS",
                    isBaseLayer: true
                };
                var layer = $scope.mapController.createLayer(args);
                expect(layer != null).toBe(true);
                expect(layer.get('name')).toBe("Foo");
            });
            it('Should fail to switch to 3D due to projection 102100 not being supported', function () {
                expect($scope.mapController.getMapInstance().getView().getProjection().getCode()).toBe('EPSG:102100');
                expect($scope.mapController.is3d()).toBe(false);
                $scope.mapController.switch3d();
                expect($scope.mapController.is3d()).toBe(false);
            });
            it('Should be able to call switch3d when map has valid projection', function () {
                var passed = true;
                try {
                    element = angular
                        .element(mapWith3DSupportedProj);
                    $compile(element)($scope);
                    $scope.$digest();
                    $timeout.flush();
                    $scope.$digest();
                    $scope.mapController.switch3d();
                } catch(error) {
                    passed = false;
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "addLayer" without an exception given valid value', function () {
                //Adds a layer, create with test args and then pass to add as addLayer method expects implementation of a layer
                //which create returns
                var args = {
                    layerUrl: "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                    layerName: "Foo",
                    layers:"Australian Landsat",
                    wrapDateLine: true,
                    layerType: "WMS",
                    isBaseLayer: true
                };
                var layer = $scope.mapController.createLayer(args);
                var layerDto;
                $scope.mapController.addLayer(layer).then(function (resultLayerDto) {
                    layerDto = resultLayerDto;
                    expect(layerDto != null).toBe(true);
                    expect(layerDto.name).toBe("Foo");
                });
                $scope.$digest();
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
                    expect(zoomLevel > 0).toBe(true);
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
                $scope.mapController.addControl('attribution');
                var controls = $scope.mapController.getMapInstance().getControls();
                expect(controls != null).toBe(true);
                expect(controls.getLength()).toBe(2);
            });

            it('Should have no interactions listed when created as a static map.', function () {
                element = angular
                    .element(mapThatIsStatic);
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(0);
            });
            // TODO Can't test getLonLatFromPixel due to way OLV3 relies on the rendered frame.
            /*it('Should fire mapController function "getLonLatFromPixel" without an exception given valid input', function () {
                var lonLat = $scope.mapController.getLonLatFromPixel(100, 200);
                expect(lonLat != null).toBe(true);
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
                    var lonLat = $scope.mapController.getPixelFromLonLat(-20, 100);
                    expect(lonLat != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });*/
            it('Should fire mapController function "getPixelFromLonLat" with an exception given invalid input', function () {
                var lonPassed = false;
                var latPassed = false;
                try {
                    $scope.mapController.getPixelFromLonLat(null, 123);
                } catch(e) {
                    lonPassed = true;
                }

                try {
                    $scope.mapController.getPixelFromLonLat(123, null);
                } catch(e) {
                    latPassed = true;
                }

                expect(lonPassed).toBe(true);
                expect(latPassed).toBe(true);
            });

            it('Should fire mapController getMapScale without an exception', function () {
                var scale = $scope.mapController.getMapScale();
                expect(scale).toBeGreaterThan(0);
            });

            it('Should fire mapController getMapCenter without an exception', function () {
                var center = $scope.mapController.getMapCenter();
                expect(center).not.toEqual(null);
            });

            it('Should fire mapController function "getPointFromEvent" without an exception given valid input', function () {
                var point = $scope.mapController.getPointFromEvent({pixel: [300,450]});
                expect(point != null).toBe(true);
                expect(point.x).toBe(300);
                expect(point.y).toBe(450);
            });
            it('Should fire mapController function "getLayers" without an exception ', function () {
                var layers = $scope.mapController.getLayers();
                expect(layers != null).toBe(true);
                expect(layers.length > 0).toBe(true);
            });
            it('Should fire mapController function "getLayersByName" without an exception given valid input', function () {
                var layers = $scope.mapController.getLayersByName('Test layer name 1');
                expect(layers != null).toBe(true);
                expect(layers.length > 0).toBe(true);
            });
            it('Should fire mapController function "getLayersByName" without an exception given valid input that results in no values', function () {
                var layers = $scope.mapController.getLayersByName('test');
                expect(layers != null).toBe(true);
                expect(layers.length === 0).toBe(true);
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
                var layer = $scope.mapController.getLayersByName('Test layer name 1')[0];
                $scope.mapController.zoomToLayer(layer.id);
            });
            it('Should fire mapController function "getProjection" without an exception', function () {
                var passed = false;
                try {
                    var projection = $scope.mapController.getProjection();
                    expect(projection != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "getDisplayProjection" without an exception', function () {
                var passed = false;
                try {
                    var projection = $scope.mapController.getDisplayProjection();
                    expect(projection != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setLayerVisibility" without an exception given valid input', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[0];
                    $scope.mapController.setLayerVisibility(layer.id, true);
                    var visibleLayer = $scope.mapController.getLayers()[0];
                    expect(visibleLayer.visibility).toBe(true);
                    $scope.mapController.setLayerVisibility(layer.id, false);
                    var invisibleLayer = $scope.mapController.getLayers()[0];
                    expect(invisibleLayer.visibility).toBe(false);
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
                var boundingBox = $scope.mapController.createBoundingBox([
                    [100, -12],
                    [150, 40]
                ]);
                expect(boundingBox != null).toBe(true);
            });
            it('Should fire mapController function "createBounds" without an exception given valid input', function () {
                var passed = false;
                try {
                    var bounds = $scope.mapController.createBounds([
                        [100, -12],
                        [150, 40]
                    ]);
                    expect(bounds != null).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "zoomToExtent" without an exception given valid input', function () {
                var map = $scope.mapController.getMapInstance();
                //'mock' get size due to dependency on actually rendering map.
                map.getSize = function() { return [500,500];};
                $scope.mapController.zoomToExtent([
                    [100, -12],
                    [150, 40]
                ]);
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
                    $scope.mapController.setCenter(50, 50, 'EPSG:4326');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "isBaseLayer" without an exception given valid input', function () {
                var layer = $scope.mapController.getLayers()[0];
                var isbaselayer = $scope.mapController.isBaseLayer(layer.id);
                expect(isbaselayer).toBe(true);
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
            it('Should fire mapController function "getMapElementId" without an exception', function () {
                var passed = false;
                try {
                    var mapElementId = $scope.mapController.getMapElementId();
                    expect(mapElementId).toBe('map');
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "setMapMarker" without an exception given valid input', function () {
                //Mock function that required rendered canvas.
                $scope.mapController.getMapInstance().getCoordinateFromPixel = function (pixel) {
                    return [12,34];
                };
                $scope.mapController.setMapMarker({x: 250, y: 50}, 'testgroupname', 'http://localhost:8080', {opacity: 0.5});
                expect($scope.mapController.getMarkerCountForLayerName('testgroupname') > 0).toBe(true);
            });
            it('Should fire mapController function "removeLayerByName" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.removeLayerByName('Test layer name 1');
                    expect($scope.mapController.getLayers().length).toBe(2);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "removeLayersByName" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.removeLayersByName('Test layer name 1');
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
                    var markerCount = $scope.mapController.getMarkerCountForLayerName('Test layer name 1');
                    expect(markerCount).toBe(0);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "drawPolyLine" without an exception given valid input', function () {
                //TODO OLV3 not supported
                $scope.mapController.drawPolyLine([
                    {lon: 100, lat: 20},
                    {lon: 90, lat: 20}
                ]);
                $scope.mapController.drawPolyLine([
                    {lon: 100, lat: 20},
                    {lon: 90, lat: 20}
                ], 'optionalLayerName');
                $scope.mapController.drawPolyLine([
                    {lon: 50, lat: 20},
                    {lon: 90, lat: 20}
                ], 'optionalLayerName');

                var layer = $scope.mapController.getLayersByName('optionalLayerName')[0];
                expect(layer.name).toBe('optionalLayerName');
                var olLayer = $scope.mapController.getMapInstance().getLayers().item(4);
                expect(olLayer.getSource().getFeatures().length).toBe(2);
            });
            it('Should fire mapController function "registerFeatureSelected" without an exception given valid input', function () {
                var layer = $scope.mapController.getLayers()[0];
                var func = function () {
                };
                $scope.mapController.registerFeatureSelected(layer.id, func);
            });

            it('Should fire mapController function "activateControl" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.activateControl('myScaleLineTestId');
                    var isActive = $scope.mapController.isControlActive('myScaleLineTestId');
                    expect(isActive).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "deactivateControl" without an exception given valid input', function () {
                var passed = false;
                try {
                    $scope.mapController.activateControl('myScaleLineTestId');
                    var isActive = $scope.mapController.isControlActive('myScaleLineTestId');
                    expect(isActive).toBe(true);
                    $scope.mapController.deactivateControl('myScaleLineTestId');
                    var isInactive = !$scope.mapController.isControlActive('myScaleLineTestId');
                    expect(isInactive).toBe(true);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "registerControlEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerControlEvent('myScaleLineTestId', 'activate', func);
                    passed = true;
                } catch (e) {
                }
                expect(passed).toBe(true);
            });
            it('Should fire mapController function "unRegisterControlEvent" without an exception given valid input', function () {
                var passed = false;
                try {
                    var func = function () {
                    };
                    $scope.mapController.registerControlEvent('myScaleLineTestId', 'activate', func);
                    $scope.mapController.unRegisterControlEvent('myScaleLineTestId', 'activate', func);
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
                var map = $scope.mapController.getMapInstance();
                //'mock' get size due to dependency on actually rendering map.
                map.getSize = function() { return [500,500];};
                var currentExtent = $scope.mapController.getCurrentMapExtent();
                expect(currentExtent != null).toBe(true);
            });
            //TODO
            //it('Should fire mapController function "filterFeatureLayer" without an exception given valid input', function () {
            //    var layer = $scope.mapController.getLayers()[2];
            //    $scope.mapController.filterFeatureLayer(layer.id, 'test', 'NAME');
            //});
            it('Should fire mapController function "getLayerFeatures" without an exception given valid input', function () {
                var layer = $scope.mapController.getLayers()[2];
                var features = $scope.mapController.getLayerFeatures(layer.id);
                expect(features.length > 0).toBe(true);
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
            it('Should "createFeature" with expected output', function () {
                var feature = $scope.mapController.createFeature($scope.testFeature);
                expect(feature != null).toBe(true);
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
            //it('Should fire mapController function "createWfsClient" without an exception given valid input', function () {
            //    var passed = false;
            //    //TODO Currently OLV3 - throw new Error("NotImplemented");
            //    try {
            //        var client = $scope.mapController.createWfsClient(
            //            'http://localhost:8080',
            //            'test',
            //            'test','1.1.0',
            //            'geoName',
            //            'EPSG:4326',
            //            true);
            //        expect(client != null).toBe(true);
            //        passed = true;
            //    } catch (e) {
            //    }
            //    expect(passed).toBe(true);
            //});
            //it('Should fire mapController function "addWfsClient" without an exception given valid input', function () {
            //    var passed = false;
            //    try {
            //        var client = $scope.mapController.createWfsClient(
            //            'http://localhost:8080',
            //            'test',
            //            'test','1.1.0',
            //            'geoName',
            //            'EPSG:4326',
            //            true);
            //        expect(client != null).toBe(true);
            //        var clientDto = $scope.mapController.addWfsClient(client);
            //        expect(clientDto != null).toBe(true);
            //        passed = true;
            //    } catch (e) {
            //    }
            //    expect(passed).toBe(true);
            //});
            //it('Should fire mapController function "searchWfs" without an exception given valid input', function () {
            //    var passed = false;
            //    try {
            //        var client = $scope.mapController.createWfsClient(
            //            'http://localhost:8080',
            //            'test',
            //            'test','1.1.0',
            //            'geoName',
            //            'EPSG:4326',
            //            true);
            //        expect(client != null).toBe(true);
            //        var clientDto = $scope.mapController.addWfsClient(client);
            //        expect(clientDto != null).toBe(true);
            //        var searchResult = $scope.mapController.searchWfs(clientDto.clientId,'testquery','NAME');
            //        expect(searchResult != null).toBe(true);
            //        passed = true;
            //    } catch (e) {
            //    }
            //    expect(passed).toBe(true);
            //});
            it('Should fire mapController function "getMeasureFromEvent" without an exception given valid input', function () {
                var measure = $scope.mapController.getMeasureFromEvent({geometry: [{x:5,y:5},{x:2,y:4}]});
                expect(measure != null).toBe(true);
            });
            it('Should fire mapController function "removeFeatureFromLayer" without an exception given valid input', function () {
                var layer = $scope.mapController.getLayers()[2];
                var features = $scope.mapController.getLayerFeatures(layer.id);

                expect(features != null).toBe(true);
                expect(features.length > 0).toBe(true);

                $scope.mapController.removeFeatureFromLayer(layer.id,features[0].id);
                features = $scope.mapController.getLayerFeatures(layer.id);
                expect(features.length === 0).toBe(true);
            });

            it('Should fire mapController function "raiseLayerDrawOrder" without an exception given valid input', function () {
                var layer = $scope.mapController.getLayers()[1];
                $scope.mapController.raiseLayerDrawOrder(layer.id, 1);
                var otherLayer = $scope.mapController.getLayers()[0];
                //result from first get layers is not the same as other layers due to\
                //array order changed.
                expect(layer.id !== otherLayer.id).toBe(true);
            });
            //Tests
            it('Should instantiate an OpenLayers map', function () {
                expect($scope.mapController.getMapInstance() != null).toBe(true);
            });
            it('Should have added 3 layers to the map instnace', function () {
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(3);
            });
            //it('Should have the correct projection on the map instance', function () {
            //    expect($scope.mapController.getMapInstance().getView().getProjection().code_).toBe('EPSG:102100');
            //});

            it('Should return geoJson coordinate arrays for getCurrentMapExtent', function () {
                var map = $scope.mapController.getMapInstance();
                //'mock' get size due to dependency on actually rendering map.
                map.getSize = function() { return [500,500];};
                //Because an extent has 4 points
                expect($scope.mapController.getCurrentMapExtent().length).toBe(4);
                //Because geoJson stores coordinates as [lon,lat]
                expect($scope.mapController.getCurrentMapExtent()[0].length).toBe(2);
            });

            it('Should have set the initial extent', function () {
                //Exact map extents are not returns because of integer zoom levels and possible animation time.
                var map = $scope.mapController.getMapInstance();
                //'mock' get size due to dependency on actually rendering map.
                map.getSize = function() { return [500,500];};
                expect($scope.mapController.getCurrentMapExtent()[0][0]).toBeGreaterThan(100.0);
                expect($scope.mapController.getCurrentMapExtent()[0][1]).toBeGreaterThan(-45.0);
                expect($scope.mapController.getCurrentMapExtent()[1][0]).toBeLessThan(160.0);
                expect($scope.mapController.getCurrentMapExtent()[1][1]).toBeGreaterThan(-45.0);
            });

            it('Should get the size of the map', function() {
               //Mocking required due to no div size in PhantomJS
                var map = $scope.mapController.getMapInstance();
                map.getSize = function() { return [500,500];};

                expect($scope.mapController.getSize().width).toBe(500);
                expect($scope.mapController.getSize().height).toBe(500);
            });
        });
})();
