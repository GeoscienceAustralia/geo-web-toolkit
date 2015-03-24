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
    'OpenLayers v2.1.13 "ga-map-control" implementation tests',
    function () {
        "use strict";
        var $compile, $scope, $timeout, element, listener, preload;

        // Load the myApp module, which contains the directive
        beforeEach(module('testApp'));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $timeout = _$timeout_;
            $scope = _$rootScope_;
            $scope.overviewOptions = {};
            listener = jasmine.createSpy('listener');
            preload = jasmine.createSpy('preload');
            $scope.$on('mapControllerReady', function (event, args) {
                listener(args);
                $scope.mapController = args;
            });
            $scope.testPreloadOptions = function (options) {
                options.test = 'success';
                preload(options);
                return options;
            };
            element = angular
                .element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' + '<ga-map-layer layer-name="Australian Landsat Mosaic"'
                + 'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"'
                + 'wrap-date-line="true"'
                + 'zoom-to-max="true"'
                + 'map-bg-color="#194584"'
                + 'layer-type="WMS"'
                + 'is-base-layer="true"'
                + '>'
                + '<ga-map-control map-control-name="OverviewMap" pre-options-loaded="testPreloadOptions(options)" control-options="overviewOptions"></ga-map-control>'
                + '<ga-map-control map-control-name="Permalink"></ga-map-control>'
                + '<ga-map-control map-control-name="ScaleLine"></ga-map-control>'
                + '<ga-map-control map-control-name="panzoombar"></ga-map-control>'
                + '<ga-map-control map-control-name="attribution"></ga-map-control>'
                + '<ga-map-control map-control-name></ga-map-control>'
                + '<div id="gamap"></div></ga-map>');
            $compile(element)($scope);
            $scope.$digest();

        }));
        //Tests
        it('Should have called event "mapControllerReady" with mapController', function () {
            expect($scope.mapController !== null);
            expect(listener).toHaveBeenCalledWith($scope.mapController);
        });

        it('Should have added default navigation control', function () {
            expect($scope.mapController.getMapInstance().controls[0].id.indexOf('Navigation') !== -1).toBe(true);
        });

        it('Should have added an overviewmap control', function () {
            expect($scope.mapController.getMapInstance().controls[1].id.indexOf('Overview') !== -1).toBe(true);
        });

        it('Should have added a permalink control', function () {
            //Permlink adds two controls to the OLv2 controls array, this might be used for eventing
            expect($scope.mapController.getMapInstance().controls[2].id.indexOf('Permalink') !== -1).toBe(true);
        });

        it('Should have added a ScaleLine control', function () {
            expect($scope.mapController.getMapInstance().controls[4].id.indexOf('ScaleLine') !== -1).toBe(true);
        });

        it('Should have added a PanZoomBar control', function () {
            expect($scope.mapController.getMapInstance().controls[5].id.indexOf('PanZoomBar') !== -1).toBe(true);
        });

        it('Should have added a attribution control', function () {
            expect($scope.mapController.getMapInstance().controls[6].id.indexOf('Attribution') !== -1).toBe(true);
        });

        it('Should ignore the last control as the name is not specified', function () {
            expect($scope.mapController.getMapInstance().controls.length === 7).toBe(true);
        });

        it('Should modify options and fire "preOptionsLoaded"', function () {
            expect(preload).toHaveBeenCalledWith($scope.overviewOptions);
            expect($scope.overviewOptions.test).toBe('success');
        });
    });