//JSLint Initialisers
var describe = describe || {};
var beforeEach = beforeEach || {};
var module = module || {};
var inject = inject || {};
var it = it || {};
var expect = expect || {};
var runs = runs || {};
var angular = angular || {};
var afterEach = afterEach || {};
var jasmine = jasmine || {};
/*var spyOn = spyOn || {};
 var waitsFor = waitsFor || {};*/
//JSLint Initialisers
describe(
	'OpenLayers v2.1.13 "ga-map" implementation tests',
	function () {
		"use strict";
		var $compile,
			$scope,
			$timeout,
			element,
			mapControllerListener,
			layerService;

		// Load the myApp module, which contains the directive
		beforeEach(module('testApp'));

		// Store references to $rootScope and $compile
		// so they are available to all tests in this describe block
		beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, GALayerService) {
			// The injector unwraps the underscores (_) from around the parameter names when matching
			$compile = _$compile_;
			$timeout = _$timeout_;
			$scope = _$rootScope_;
			layerService = GALayerService;
			mapControllerListener = jasmine.createSpy('mapControllerListener');
			$scope.$on('mapControllerReady', function (event, args) {
				mapControllerListener(args);
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
				.element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326"' +
					'initial-extent="[[100.0,-10.0],[160.0,-10],[100.0,-45.0],[160.0,-45.0]]">' +
					'<ga-map-layer layer-name="Australian Landsat Mosaic"' +
					'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
					'wrap-date-line="true"' +
					'layer-type="WMS"' +
					'is-base-layer="true"' +
					'></ga-map-layer>' +
					'<ga-feature-layer layer-name="feature layer1">' +
					'<ga-feature geo-json-feature="testFeature"></ga-feature>' +
					'</ga-feature-layer>' +
					'<ga-feature-layer layer-name="feature layer2">' +
					'<ga-feature geo-json-feature="testFeature"></ga-feature>' +
					'</ga-feature-layer>' +
					'<ga-map-control map-control-name="OverviewMap" map-control-id="myOverviewTestId"></ga-map-control>' +
					'<div id="gamap"></div>' +
					'</ga-map>');
			$compile(element)($scope);
			$scope.$digest();

		}));
		it('Should fire layer service function "createLayer" without an exception given valid value', function () {

			var args = {
				layerUrl: "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
				layerName: "Foo",
				wrapDateLine: true,
				layerType: "WMS",
				isBaseLayer: true
			};
			var layerOptions = layerService.defaultLayerOptions(args);
			var layer = layerService.createLayer(layerOptions);
			expect(layer != null).toBe(true);
			expect(layer.name).toBe("Foo");
		});
		it('Should fire mapController function "addLayer" without an exception given valid value', function () {
			//Adds a layer, create with test args and then pass to add as addLayer method expects implementation of a layer
			//which create returns
			var args = {
				layerUrl: "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
				layerName: "Foo",
				wrapDateLine: true,
				layerType: "WMS",
				isBaseLayer: true
			};
			var layerOptions = layerService.defaultLayerOptions(args);
			var layer = layerService.createLayer(layerOptions);
			var layerDto = $scope.mapController.addLayer(layer);
			expect(layerDto != null).toBe(true);
			expect(layerDto.name).toBe("Foo");
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
				var lonLat = $scope.mapController.getPixelFromLonLat(-20, 100);
				expect(lonLat != null).toBe(true);
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "getPixelFromLonLat" with an exception given invalid input', function () {
			var passed = false;
			try {
				$scope.mapController.getPixelFromLonLat(null, null);
				passed = false;
			} catch (e) {
				passed = true;
			}
			expect(passed).toBe(true);
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
				//base layers are the end of the array cause olv2 says so
				var layer = $scope.mapController.getLayers()[2];
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
		it('Should fire mapController function "getMapElementId" without an exception', function () {
			var passed = false;
			try {
				var mapElementId = $scope.mapController.getMapElementId();
				expect(mapElementId).toBe('gamap');
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "setMapMarker" without an exception given valid input', function () {
			var passed = false;
			try {
				$scope.mapController.setMapMarker({x: 50, y: 50}, 'testgroupname', 'http://localhost:8080');
				expect($scope.mapController.getMarkerCountForLayerName('testgroupname') > 0).toBe(true);
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "removeLayerByName" without an exception given valid input', function () {
			var passed = false;
			try {
				$scope.mapController.removeLayerByName('Australian Landsat Mosaic');
				expect($scope.mapController.getLayers().length).toBe(2);
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
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
		it('Should fire mapController function "activateControl" without an exception given valid input', function () {
			var passed = false;
			try {
				$scope.mapController.activateControl('myOverviewTestId');
				var isActive = $scope.mapController.isControlActive('myOverviewTestId');
				expect(isActive).toBe(true);
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "deactivateControl" without an exception given valid input', function () {
			var passed = false;
			try {
				$scope.mapController.activateControl('myOverviewTestId');
				var isActive = $scope.mapController.isControlActive('myOverviewTestId');
				expect(isActive).toBe(true);
				$scope.mapController.deactivateControl('myOverviewTestId');
				var isInactive = !$scope.mapController.isControlActive('myOverviewTestId');
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
				$scope.mapController.registerControlEvent('myOverviewTestId', 'activate', func);
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
				$scope.mapController.registerControlEvent('myOverviewTestId', 'activate', func);
				$scope.mapController.unRegisterControlEvent('myOverviewTestId', 'activate', func);
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
				var layer = $scope.mapController.getLayers()[0];
				$scope.mapController.filterFeatureLayer(layer.id, 'test', 'NAME');
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "getLayerFeatures" without an exception given valid input', function () {
			var passed = false;
			try {
				var layer = $scope.mapController.getLayers()[0];
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
				var layer = $scope.mapController.getLayers()[0];
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
				var layer = $scope.mapController.getLayers()[0];
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
					'test','1.1.0',
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
					'test','1.1.0',
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
					'test','1.1.0',
					'geoName',
					'EPSG:4326',
					true);
				expect(client != null).toBe(true);
				var clientDto = $scope.mapController.addWfsClient(client);
				expect(clientDto != null).toBe(true);
				var searchResult = $scope.mapController.searchWfs(clientDto.clientId,'testquery','NAME');
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
				var measure = $scope.mapController.getMeasureFromEvent({geometry: [{x:5,y:5},{x:2,y:4}]});
				expect(measure != null).toBe(true);
				passed = true;
			} catch (e) {
			}
			expect(passed).toBe(true);
		});
		it('Should fire mapController function "removeFeatureFromLayer" without an exception given valid input', function () {
			var passed = false;
			try {
				var layer = $scope.mapController.getLayers()[0];
				var features = $scope.mapController.getLayerFeatures(layer.id);

				expect(features != null).toBe(true);
				expect(features.length > 0).toBe(true);

				$scope.mapController.removeFeatureFromLayer(layer.id,features[0].id);
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
				var layer = $scope.mapController.getLayers()[0];
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
		it('Should have added 2 layer to the map instnace', function () {
			expect($scope.mapController.getMapInstance().layers.length === 3).toBe(true);
		});
		it('Should have the correct projection on the map instance', function () {
			expect($scope.mapController.getMapInstance().projection === 'EPSG:102100').toBe(true);
		});

		it('Should return geoJson coordinate arrays for getCurrentMapExtent', function () {
			//Because an extent has 4 points
			expect($scope.mapController.getCurrentMapExtent().length).toBe(4);
			//Because geoJson stores coordinates as [lon,lat]
			expect($scope.mapController.getCurrentMapExtent()[0].length).toBe(2);
		});

		it('Should have set the initial extent', function () {
			//Exact map extents are not returns because of integer zoom levels and possible animation time.
			expect($scope.mapController.getCurrentMapExtent()[0][0] > 110.0).toBe(true);
			expect($scope.mapController.getCurrentMapExtent()[0][1] > -45.0).toBe(true);
			expect($scope.mapController.getCurrentMapExtent()[1][0] < 160.0).toBe(true);
			expect($scope.mapController.getCurrentMapExtent()[1][1] > -45.0).toBe(true);
		});
	});
describe(
	'OpenLayers v2.1.13 "ga-map-layer" implementation tests',
	function () {
		"use strict";
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
						"tileType": "large"
					},
					{
						"controllerEventName": "layer2Controller",
						"mapType": "WMS",
						"visibility": true,
						"name": "Australian Seabed Features",
						"url": "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
						"layers": "Geomorphic_Features",
						"opacity": 1.0
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
						"opacity": 1.0
					}
				]
			};
			element = angular
				.element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
					'<ga-map-layer ng-repeat="baseLayer in mapConfig.baseMaps" layer-name="{{baseLayer.name}}"' +
					'layer-url="{{baseLayer.url}}"' +
					'is-base-layer="true"' +
					'wrap-date-line="{{baseLayer.wrapDateLine}}"' +
					'layer-type="{{baseLayer.mapType}}"' +
					'layer-attribution="{{baseLayer.attribution}}"' +
					'></ga-map-layer>' +
					'<ga-map-layer ng-repeat="layer in mapConfig.layerMaps" ' +
					'layer-name="{{layer.name}}"' +
					'layer-url="{{layer.url}}"' +
					'wrap-date-line="{{layer.wrapDateLine}}"' +
					'layer-type="{{layer.mapType}}"' +
					'controller-emit-event-name="{{layer.controllerEventName}}"' +
					'visibility="{{layer.visibility}}"' +
					'></ga-map-layer>' +
					'<div id="gamap"></div></ga-map>');
			$compile(element)($scope);
			$scope.$digest();
		}));

		//Tests
		it('Should instantiate an OpenLayers map', function () {
			expect($scope.mapController.getMapInstance() != null).toBe(true);
		});
		it('Should have added 5 layers to the map instance', function () {
			expect($scope.mapController.getMapInstance().layers.length === 5).toBe(true);
		});
		it('Should have 2 layers that are base layers', function () {
			var baseLayers = [];
			var layers = $scope.mapController.getMapInstance().layers;
			for (var i = 0; i < layers.length; i++) {
				if (layers[i].isBaseLayer) {
					baseLayers.push(layers[i]);
				}
			}
			expect(baseLayers.length === 2).toBe(true);
		});

		it('Should have 3 layers that are not base layers', function () {
			var mapLayers = [];
			var layers = $scope.mapController.getMapInstance().layers;
			for (var i = 0; i < layers.length; i++) {
				if (!layers[i].isBaseLayer) {
					mapLayers.push(layers[i]);
				}
			}
			expect(mapLayers.length === 3).toBe(true);
		});

		it('Should have 4 layers after one is removed from the model', function () {
			$scope.mapConfig.layerMaps.pop();
			$scope.$digest();
			expect($scope.mapController.getMapInstance().layers.length === 4);
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
			expect($scope.mapController.getMapInstance().layers.length === 6);
			expect($scope.mapController.getMapInstance().layers[5].name === "Foo layer");
		});

		it('Should be able to set visibility through mapController', function () {
			var allLayers = $scope.mapController.getLayers();
			for (var i = 0; i < allLayers.length; i++) {
				var layerId = allLayers[i].id;
				$scope.mapController.setLayerVisibility(layerId, false);
			}

			var allOlV2Layers = $scope.mapController.getMapInstance().layers;
			for (var j = 0; j < allOlV2Layers.length; j++) {
				expect(allOlV2Layers[j].visibility).toBe(false);
			}
		});

		it('Should be able to change the draw order of a layer through the mapController', function () {
			var lastLayer = $scope.mapController.getLayers()[4];
			var allOlV2Layers = $scope.mapController.getMapInstance().layers;
			expect(allOlV2Layers[4].id === lastLayer.id).toBe(true);
			//Set top layer to be drawn first (eg, is now under all other layers)
			$scope.mapController.raiseLayerDrawOrder(lastLayer.id, -4);
			expect(allOlV2Layers[0].id === lastLayer.id).toBe(true);
		});

		it('Should have fired custom layer controller events', function () {
			expect($scope.mapController !== null).toBe(true);
			expect(layerController1).toHaveBeenCalledWith($scope.layerController1);
			expect(layerController2).toHaveBeenCalledWith($scope.layerController2);
			expect(layerController3).toHaveBeenCalledWith($scope.layerController3);
		});

		it('Should be able to hide layer via layerController', function () {
			$scope.layerController1.hide();
			var olv2FirstLayer = $scope.mapController.getMapInstance().layers[2];
			expect(olv2FirstLayer.visibility === false).toBe(true);
		});

		it('Should be able to show layer via layerController', function () {
			$scope.layerController1.hide();
			var olv2FirstLayer = $scope.mapController.getMapInstance().layers[2];
			expect(olv2FirstLayer.visibility === false).toBe(true);
			$scope.layerController1.show();
			expect(olv2FirstLayer.visibility === true).toBe(true);
		});

		it('Should be able to change opacity via layerController', function () {
			var olv2FirstLayer = $scope.mapController.getMapInstance().layers[2];
			expect(olv2FirstLayer.opacity === 1.0).toBe(true);
			$scope.layerController1.setOpacity(0.5);
			expect(olv2FirstLayer.opacity === 0.5).toBe(true);
		});
	});
describe(
	'OpenLayers v2.1.13 "ga-feature-layer" implementation tests',
	function () {
		"use strict";
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
				.element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
					'<ga-feature-layer layer-name="Australian Landsat Mosaic">' +
					'<ga-feature geo-json-feature="testFeature"></ga-feature>' +
					'</ga-feature-layer>' +
					'</ga-map><div id="gamap"></div>');
			$compile(element)($scope);
			$scope.$digest();

		}));

		it('Should create a single layer for features', function () {
			expect($scope.mapController.getMapInstance().layers.length === 1).toBe(true);
			expect(Object.prototype.toString.call($scope.mapController.getMapInstance().layers[0].features) === '[object Array]').toBe(true);
		});

		it('Should create a single feature on the parent layer', function () {
			expect($scope.mapController.getMapInstance().layers[0].features.length === 1).toBe(true);
		});

		it('Should create and add a feature to the parent layer', function () {
			expect($scope.mapController.getMapInstance().layers[0].features[0] != null).toBe(true);
		});

		it('Should create a feature from a geoJson object', function () {
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry != null).toBe(true);
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry.x != null).toBe(true);
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry.y != null).toBe(true);
		});

		it('Should create a feature on correct layer', function () {
			expect($scope.mapController.getMapInstance().layers[0].features[0].layer === $scope.mapController.getMapInstance().layers[0]).toBe(true);
		});

		it('Should create a feature from a geoJson object with correct position', function () {
			//Projection from 4326 to 102100
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry.x > 13064344).toBe(true);
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry.y < -2910668).toBe(true);
		});

		it('Should create a feature from a geoJson of the correct type', function () {
			//Projection from 4326 to 102100
			expect($scope.mapController.getMapInstance().layers[0].features[0].type === 'Feature').toBe(true);
			//Ie, is a point
			expect($scope.mapController.getMapInstance().layers[0].features[0].geometry.bounds == null).toBe(true);
		});

		it('Should have properties of the geoJson feature', function () {
			expect($scope.mapController.getMapInstance().layers[0].features[0].data != null).toBe(true);
			expect($scope.mapController.getMapInstance().layers[0].features[0].data.name === 'Testing name').toBe(true);
			expect($scope.mapController.getMapInstance().layers[0].features[0].data.anotherProp === 'Another value').toBe(true);
		});

		it('Should be able to modify the geoJson model and changes be reflected in OpenLayers', function () {
			var featureCopy = angular.copy($scope.testFeature);
			featureCopy.properties.name = "Test changing";
			$scope.testFeature = featureCopy;
			$scope.$digest();
			$timeout(function () {
				expect($scope.mapController.getMapInstance().layers[0].features[0].data.name).toBe('Test changing');
			});

		});
	});