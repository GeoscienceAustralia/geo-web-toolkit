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
/*var spyOn = spyOn || {};
 var waitsFor = waitsFor || {};*/
//JSLint Initialisers
describe(
	'gawebtoolkit ga-map-control tests',
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

            $scope.activatePermalink = true;
			element = angular
				.element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
					'<ga-map-layer layer-name="Australian Landsat Mosaic"' +
					'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
					'wrap-date-line="true"' +
					'zoom-to-max="true"' +
					'map-bg-color="#194584"' +
					'layer-type="WMS"' +
					'is-base-layer="true"' +
					'>' +
					'<ga-map-control map-control-name="OverviewMap"></ga-map-control>' +
					'<ga-map-control map-control-name="Permalink" map-control-id="myPermalinkControl" control-enabled="{{activatePermalink}}"></ga-map-control>' +
					'<ga-map-control map-control-name="ScaleLine"></ga-map-control>' +
					'<ga-map-control map-control-name="panzoombar"></ga-map-control>' +
					'<ga-map-control map-control-name="attribution"></ga-map-control>' +
					'<ga-map-control map-control-name="mouseposition"></ga-map-control>' +
					'<ga-map-control map-control-name="measureline" map-control-id="myMeasureTest"></ga-map-control>' +
					'<ga-map-control map-control-name="measurepolygon" ></ga-map-control>' +
					'<div id="gamap"></div></ga-map>');
			$compile(element)($scope);
			$scope.$digest();

		}));
		//Tests
		it('Should have called event "mapControllerReady" with mapController', function () {
			expect($scope.mapController !== null);
			expect(listener).toHaveBeenCalledWith($scope.mapController);
		});

		it('Should added 5 additional controls', function () {
			var controls = $scope.mapController.getMapInstance().controls;
			expect(controls.length > 8).toBe(true);
		});

		it('Should report "myMeasureTest" control as being not active', function () {
			//Not being used
			expect($scope.mapController.isControlActive('myMeasureTest')).toBe(false);
		});
		it('Should report "myMeasureTest" control as being active', function () {
			//Set as active via straight openlayers, toolkit abstraction should reflect change.
			$scope.mapController.getMapInstance().getControlsBy('id', 'myMeasureTest')[0].active = true;
			expect($scope.mapController.isControlActive('myMeasureTest')).toBe(true);
		});

        it('Should deactivate permalink by changing scoped property', function () {
            $scope.activatePermalink = false;
            $scope.$digest();
            var isControlActive = $scope.mapController.isControlActive('myPermalinkControl');
            expect(isControlActive === false);
        });

        it('Should toggle control active after change of value and scope digestion', function () {
            $scope.activatePermalink = false;
            $scope.$digest();
            var isControlActive = $scope.mapController.isControlActive('myPermalinkControl');
            expect(isControlActive === false);
            $scope.activatePermalink = true;
            $scope.$digest();
            isControlActive = $scope.mapController.isControlActive('myPermalinkControl');
            expect(isControlActive === true);
        });
	});