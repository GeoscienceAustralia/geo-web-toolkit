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
      'gawebtoolkit ga-map-layer controller interface tests',
      function() {
         "use strict";
         var $compile, $scope, $timeout, element, listener, layerControllerListener;

         // Load the myApp module, which contains the directive
         beforeEach(module('testApp'));

         // Store references to $rootScope and $compile
         // so they are available to all tests in this describe block
         beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $timeout = _$timeout_;
            $scope = _$rootScope_;
            listener = jasmine.createSpy('listener');
            layerControllerListener = jasmine.createSpy('layerControllerListener');
            $scope.$on('mapControllerReady', function(event, args) {
               listener(args);
               $scope.mapController = args;
            });

            $scope.$on('customControllerEmitEventName', function(event, args) {
               layerControllerListener(args);
               $scope.layerController = args;
            });
            element = angular
                  .element('<geo-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' + '<geo-map-layer layer-name="Australian Landsat Mosaic"'
                        + 'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"'
                        + 'wrap-date-line="true"'
                        + 'zoom-to-max="true"'
                        + 'map-bg-color="#194584"'
                        + 'layer-type="WMS"'
                        + 'is-base-layer="true"'
                        + 'controller-emit-event-name="customControllerEmitEventName"'
                        + '>'
                        + '<div id="gamap"></div></geo-map>');
            $compile(element)($scope);
            $scope.$digest();

         }));
         //Tests
         it('Should have called event "mapControllerReady" with mapController', function() {
            expect($scope.mapController !== null);
            expect(listener).toHaveBeenCalledWith($scope.mapController);
         });

         it('Should have called event "customControllerEmitEventName" with layerController', function() {
            expect($scope.layerController !== null);
            expect(layerControllerListener).toHaveBeenCalledWith($scope.layerController);
         });

         it('Should have a "hide" function on the controller', function() {
            expect(typeof $scope.layerController.hide === "function");
         });

         it('Should have a "show" function on the controller', function() {
            expect(typeof $scope.layerController.show === "function");
         });

         it('Should have a "setOpacity" function on the controller', function() {
            expect(typeof $scope.layerController.setOpacity === "function");
         });

      });