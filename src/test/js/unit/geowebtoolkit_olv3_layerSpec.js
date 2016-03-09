/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";

    describe(
        'OpenLayers v3 "geo-map-layer" implementation tests',
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
                layerController1 = jasmine.createSpy('layerController1');
                layerController2 = jasmine.createSpy('layerController2');
                layerController3 = jasmine.createSpy('layerController3');
                $scope.$on('mapControllerReady', function (event, args) {
                    mapControllerListener(args);
                    $scope.mapController = args;
                });

                $scope.$on('layer1Controller', function (event, args) {
                    layerController1(args);
                    $scope.layerController1 = args;
                });
                $scope.$on('layer2Controller', function (event, args) {
                    layerController2(args);
                    $scope.layerController2 = args;
                });
                $scope.$on('layer3Controller', function (event, args) {
                    layerController3(args);
                    $scope.layerController3 = args;
                });

                $scope.mapConfig = {
                    "baseMaps": [
                        {
                            "mapType": "XYZTileCache",
                            "visibility": true,
                            "name": "World Image",
                            "url": "http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer",
                            "mapBGColor": "194584",
                            "opacity": 1.0,
                            "wrapDateLine": true,
                            "attribution": "World <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a> and <a target='_blank' href='http://www.naturalearthdata.com/'>Natural Earth</a>"
                        },
                        {
                            "mapType": "XYZTileCache",
                            "visibility": false,
                            "name": "World Political Boundaries",
                            "url": "http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer",
                            "mapBGColor": "2356b9",
                            "opacity": 1.0,
                            "wrapDateLine": true,
                            "attribution": "Political <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a> and <a target='_blank' href='http://www.naturalearthdata.com/'>Natural Earth</a>"
                        }
                    ],
                    "layerMaps": [
                        {
                            "controllerEventName": "layer1Controller",
                            "mapType": "WMS",
                            "visibility": true,
                            "name": "Australian Landsat Mosaic",
                            "url": "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                            "layers": "Australian Landsat",
                            "opacity": 1.0,
                            "tileType": "large",
                            "refresh": 0
                        },
                        {
                            "controllerEventName": "layer2Controller",
                            "mapType": "WMS",
                            "visibility": true,
                            "name": "Australian Seabed Features",
                            "url": "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                            "layers": "Geomorphic_Features",
                            "opacity": 1.0,
                            "refresh": 0
                        },
                        {
                            "controllerEventName": "layer3Controller",
                            "mapType": "WMS",
                            "visibility": true,
                            "name": "Topographic",
                            "url": "http://www.ga.gov.au/gis/services/topography/Australian_Topography_NoAntiAliasing/MapServer/WMSServer",
                            "layers": "Framework Boundaries,Framework Boundaries SS,Roads SS,Roads MS,Roads,State Names on Boundaries,State Names Anno MS,State Names Anno SS,Populated Places,Populated Places MS,Populated Places SS,Cities",
                            "tileType": "large",
                            "attribution": "Geoscience Australia Topography <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a>",
                            "opacity": 1.0,
                            "refresh": 0
                        }
                    ]
                };
                element = angular
                    .element('<geo-map framework="olv3" map-element-id="geomap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                        '<geo-map-layer ng-repeat="baseLayer in mapConfig.baseMaps" layer-name="{{baseLayer.name}}"' +
                        'layer-url="{{baseLayer.url}}"' +
                        'is-base-layer="true"' +
                        'wrap-date-line="{{baseLayer.wrapDateLine}}"' +
                        'layer-type="{{baseLayer.mapType}}"' +
                        'layer-attribution="{{baseLayer.attribution}}"' +
                        '></geo-map-layer>' +
                        '<geo-map-layer ng-repeat="layer in mapConfig.layerMaps" ' +
                        'layer-name="{{layer.name}}"' +
                        'layer-url="{{layer.url}}"' +
                        'wrap-date-line="{{layer.wrapDateLine}}"' +
                        'layer-type="{{layer.mapType}}"' +
                        'controller-emit-event-name="{{layer.controllerEventName}}"' +
                        'visibility="{{layer.visibility}}" ' +
                        'opacity="{{layer.opacity}}" ' +
                        'refresh-layer="{{layer.refresh}}"></geo-map-layer>' +
                        '<div id="geomap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));

            //Tests
            it('Should instantiate an olv3 map', function () {
                expect($scope.mapController.getMapInstance() != null).toBe(true);
                expect($scope.mapController.getMapInstance() instanceof ol.Map).toBe(true);
            });
            it('Should have added 5 layers to the map instance', function () {
                expect($scope.mapController.getMapInstance().getLayers().getLength()).toBe(5);
            });
            it('Should have 2 layers that are base layers', function () {
                var baseLayers = [];
                var layers = $scope.mapController.getMapInstance().getLayers();
                for (var i = 0; i < layers.getLength(); i++) {
                    if (layers.item(i).get('isBaseLayer')) {
                        baseLayers.push(layers.item(i));
                    }
                }
                expect(baseLayers.length).toBe(2);
            });

            it('Should change layer visibility based on observed value', function () {
                var layer = $scope.mapController.getLayers()[3];
                expect(layer.name).toBe("Australian Seabed Features");
                expect(layer.visibility).toBe(true);
                $scope.mapConfig.layerMaps[1].visibility = false;
                $scope.$digest();
                layer = $scope.mapController.getLayers()[3];
                expect(layer.visibility).toBe(false);
            });

            it('Should change layer opacity based on observed value', function () {
                var passed = false;
                try {
                    var layer = $scope.mapController.getLayers()[3];
                    expect(layer.name).toBe("Australian Seabed Features");
                    expect(layer.opacity).toBe(1);
                    $scope.mapConfig.layerMaps[1].opacity = 0.5;
                    $scope.$digest();
                    layer = $scope.mapController.getLayers()[3];
                    expect(layer.opacity).toBe(0.5);
                    passed = true;
                } catch (e) {

                }
                expect(passed).toBe(true);
            });

            it('Should have reconstructed a layer on change of a refresh value', function () {
                var layer = $scope.mapController.getLayers()[2];
                expect(layer.name).toBe('Australian Landsat Mosaic');
                $scope.mapConfig.layerMaps[0].name = 'Test name change';
                $scope.mapConfig.layerMaps[0].refresh++;
                $scope.$digest();
                var updatedLayer = $scope.mapController.getLayers()[2];
                expect(updatedLayer.name).toBe('Test name change');
            });

            it('Should have 3 layers that are not base layers', function () {
                var mapLayers = [];
                var layers = $scope.mapController.getMapInstance().getLayers();
                for (var i = 0; i < layers.getLength(); i++) {
                    if (!layers.item(i).get('isBaseLayer')) {
                        mapLayers.push(layers.item(i));
                    }
                }
                expect(mapLayers.length === 3).toBe(true);
            });

            it('Should have 4 layers after one is removed from the model', function () {
                $scope.mapConfig.layerMaps.pop();
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength() === 4);
            });

            it('Should have 6 layers after one is adde to the model', function () {
                $scope.mapConfig.layerMaps.push({
                    name: "Foo layer",
                    url: "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                    mapType: "WMS",
                    layers: "Geomorphic_Features",
                    visibility: true,
                    opacity: 1.0
                });
                $scope.$digest();
                expect($scope.mapController.getMapInstance().getLayers().getLength() === 6);
                expect($scope.mapController.getMapInstance().getLayers().item(5).get('name') === "Foo layer");
            });

            it('Should be able to set visibility through mapController', function () {
                var allLayers = $scope.mapController.getLayers();
                for (var i = 0; i < allLayers.length; i++) {
                    var layerId = allLayers[i].id;
                    $scope.mapController.setLayerVisibility(layerId, false);
                }

                var allOlV2Layers = $scope.mapController.getMapInstance().getLayers();
                for (var j = 0; j < allOlV2Layers.getLength(); j++) {
                    expect(allOlV2Layers.item(j).get('visible')).toBe(false);
                }
            });

            it('Should be able to change the draw order of a layer through the mapController', function () {
                var lastLayer = $scope.mapController.getLayers()[4];
                var allOlV2Layers = $scope.mapController.getMapInstance().getLayers();
                expect(allOlV2Layers.item(4).get('id') === lastLayer.id).toBe(true);
                //Set top layer to be drawn first (eg, is now under all other layers)
                $scope.mapController.raiseLayerDrawOrder(lastLayer.id, -4);
                expect(allOlV2Layers.item(0).get('id') === lastLayer.id).toBe(true);
            });

            it('Should have fired custom layer controller events', function () {
                expect($scope.mapController !== null).toBe(true);
                expect(layerController1).toHaveBeenCalledWith($scope.layerController1);
                expect(layerController2).toHaveBeenCalledWith($scope.layerController2);
                expect(layerController3).toHaveBeenCalledWith($scope.layerController3);
            });

            it('Should be able to hide layer via layerController', function () {
                $scope.layerController1.hide();
                var olv2FirstLayer = $scope.mapController.getMapInstance().getLayers().item(2);
                expect(olv2FirstLayer.get('visible') === false).toBe(true);
            });

            it('Should be able to show layer via layerController', function () {
                $scope.layerController1.hide();
                var olv2FirstLayer = $scope.mapController.getMapInstance().getLayers().item(2);
                expect(olv2FirstLayer.get('visible') === false).toBe(true);
                $scope.layerController1.show();
                expect(olv2FirstLayer.get('visible') === true).toBe(true);
            });

            it('Should be able to remove a layer by it\'s name.', function () {
                var layersCount = $scope.mapController.getMapInstance().getLayers().getLength();
                expect(layersCount).toBe(5);
                $scope.mapController.removeLayerByName('Topographic');
                layersCount = $scope.mapController.getMapInstance().getLayers().getLength();
                expect(layersCount).toBe(4);
            });

//		it('Should be able to change opacity via layerController', function () {
//			var olv2FirstLayer = $scope.mapController.getMapInstance().layers[2];
//			expect(olv2FirstLayer.opacity === 1.0).toBe(true);
//			$scope.layerController1.setOpacity(0.5);
//			expect(olv2FirstLayer.opacity === 0.5).toBe(true);
//		});
        });
    describe(
        'OpenLayers v2.1.13 "geo-feature-layer" implementation tests',
        function () {
            var $compile, $scope, $timeout, element, listener;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                listener = jasmine.createSpy('listener');
                $scope.$on('mapControllerReady', function (event, args) {
                    listener(args);
                    $scope.mapController = args;
                });

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

                element = angular
                    .element('<geo-map map-element-id="geomap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                        '<geo-map-layer layer-name="Australian Landsat Mosaic - Base layer"' +
                        'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                        'wrap-date-line="true"' +
                        'layer-type="WMS"' +
                        'is-base-layer="true"' +
                        '></geo-map-layer>' +
                        '<geo-feature-layer layer-name="Australian Landsat Mosaic - feature Layer">' +
                        '<geo-feature geo-json-feature="testFeature"></geo-feature>' +
                        '</geo-feature-layer>' +
                        '</geo-map><div id="geomap"></div>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));

            it('Should create a single layer for features and a single base layer', function () {
                expect($scope.mapController.getMapInstance().layers.length === 2).toBe(true);
                expect(Object.prototype.toString.call($scope.mapController.getMapInstance().layers[1].features) === '[object Array]').toBe(true);
            });

            it('Should create a single feature on the parent layer', function () {
                expect($scope.mapController.getMapInstance().layers[1].features.length === 1).toBe(true);
            });

            it('Should create and add a feature to the parent layer', function () {
                expect($scope.mapController.getMapInstance().layers[1].features[0] != null).toBe(true);
            });

            it('Should create a feature from a geoJson object', function () {
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry != null).toBe(true);
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry.x != null).toBe(true);
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry.y != null).toBe(true);
            });

            it('Should create a feature on correct layer', function () {
                expect($scope.mapController.getMapInstance().layers[1].features[0].layer === $scope.mapController.getMapInstance().layers[1]).toBe(true);
            });

            it('Should create a feature from a geoJson object with correct position', function () {
                //Projection from 4326 to 102100
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry.x > 13064344).toBe(true);
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry.y < -2910668).toBe(true);
            });

            it('Should create a feature from a geoJson of the correct type', function () {
                //Projection from 4326 to 102100
                expect($scope.mapController.getMapInstance().layers[1].features[0].type === 'Feature').toBe(true);
                //Ie, is a point
                expect($scope.mapController.getMapInstance().layers[1].features[0].geometry.id.indexOf('Point') !== -1).toBe(true);
            });

            it('Should have properties of the geoJson feature', function () {
                expect($scope.mapController.getMapInstance().layers[1].features[0].data != null).toBe(true);
                expect($scope.mapController.getMapInstance().layers[1].features[0].data.name === 'Testing name').toBe(true);
                expect($scope.mapController.getMapInstance().layers[1].features[0].data.anotherProp === 'Another value').toBe(true);
            });

            it('Should be able to modify the geoJson model and changes be reflected in OpenLayers', function () {
                var featureCopy = angular.copy($scope.testFeature);
                featureCopy.properties.name = "Test changing";
                $scope.testFeature = featureCopy;
                $scope.$digest();
                $timeout(function () {
                    expect($scope.mapController.getMapInstance().layers[1].features[0].data.name).toBe('Test changing');
                });
                $timeout.flush();
            });
        });
})();