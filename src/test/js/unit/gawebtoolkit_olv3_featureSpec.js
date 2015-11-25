/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";

    describe(
        'gawebtoolkit ga-map controller interface tests',
        function() {
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
                element = angular
                    .element('<geo-map framework="olv3" map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                    '<geo-map-layer layer-name="Australian Landsat Mosaic"' +
                    'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                    'wrap-date-line="true"' +
                    'zoom-to-max="true"' +
                    'map-bg-color="#194584"' +
                    'layer-type="WMS"' +
                    'is-base-layer="true"' +
                    '></geo-map-layer>' +
                    '<div id="gamap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            //Tests
            it('Should be able to call "getFeatureInfo" with test data and not return errors.', function () {
                //Mock function that required rendered canvas.
                $scope.mapController.getMapInstance().getCoordinateFromPixel = function (pixel) { return [12,34];};
                expect($scope.mapController !== null);
                $timeout(function () {
                    $scope.mapController.getFeatureInfo(
                        'http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer',
                        'testing',
                        'test',
                        'testGeoName',
                        {x: 20,y:20}
                    );

                });
                $timeout.flush();
            });
            it('Should be able to call "getFeatureInfoFromLayer" with test data and not return errors.', function () {
                expect($scope.mapController !== null);
                var layer = $scope.mapController.getLayersByName('Australian Landsat Mosaic')[0];
                $timeout(function () {
                    //Mock function that required rendered canvas.
                    $scope.mapController.getMapInstance().getCoordinateFromPixel = function (pixel) { return [12,34];};
                    $scope.mapController.getFeatureInfoFromLayer(layer.id,
                        {x: 20,y:20}
                    ).then(function () {
                            //return feature //TODO currently no way to mock due to reliance on OL. Injected script tag into head with callback ref.
                        });
                    expect(layer.name).toBe('Australian Landsat Mosaic');
                });
                $timeout.flush();
            });
        });
})();