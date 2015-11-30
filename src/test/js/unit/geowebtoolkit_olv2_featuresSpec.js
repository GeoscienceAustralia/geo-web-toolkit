/* global describe, beforeEach, module, inject, it, expect, runs, angular, afterEach, jasmine */
(function () {
    "use strict";

    describe(
        'geowebtoolkit geo-map controller interface tests',
        function() {
            var $compile, $scope, $timeout, element, listener, layerAddedListener;

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
                layerAddedListener = jasmine.createSpy('layerAddedListener');
                $scope.$on('mapControllerReady', function (event, args) {
                    listener(args);
                    $scope.mapController = args;
                });
                $scope.$on('layerAdded', function (event, args) {
                    layerAddedListener(args);
                });
                element = angular
                    .element('<geo-map map-element-id="geomap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                    '<geo-map-layer layer-name="Australian Landsat Mosaic"' +
                    'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                    'wrap-date-line="true"' +
                    'zoom-to-max="true"' +
                    'map-bg-color="#194584"' +
                    'layer-type="WMS"' +
                    'is-base-layer="true"' +
                    '></geo-map-layer>' +
                    '<geo-feature-layer layer-name="my feature layer" refresh-layer="{{refreshTest}}">' +
                    '</geo-feature-layer>' +
                    '<div id="geomap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            //Tests
            it('Should be able to call "getFeatureInfo" with test data and not return errors.', function () {
                expect($scope.mapController !== null);
                $timeout(function () {
                    var passed = true;
                    try {
                        $scope.mapController.getFeatureInfo(
                            'http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer',
                            'testing',
                            'test',
                            'testGeoName',
                            {x: 20,y:20}
                        );
                    }
                    catch (ex) {
                        passed = false;
                    }
                    expect(passed).toBe(true);
                });
                $timeout.flush();
            });
            it('Should be able to call "getFeatureInfoFromLayer" with test data and not return errors.', function () {
                expect($scope.mapController !== null);
                //Mock function that required rendered canvas.
                $scope.mapController.getMapInstance().getCoordinateFromPixel = function (pixel) { return [12,34];};
                var layer = $scope.mapController.getLayersByName('Australian Landsat Mosaic')[0];
                $timeout(function () {
                    var passed = true;
                    try {
                        $scope.mapController.getFeatureInfoFromLayer(layer.id,
                            {x: 20,y:20}
                        ).then(function () {
                                //return feature //TODO currently no way to mock due to reliance on OL. Injected script tag into head with callback ref.
                            });
                    }
                    catch (ex) {
                        passed = false;
                    }
                    expect(layer.name).toBe('Australian Landsat Mosaic');
                    expect(passed).toBe(true);
                });
                $timeout.flush();
            });

            it('Should be reconstruct layer when refreshLayer value changes.', function () {
                expect($scope.mapController !== null);
                $scope.refreshTest = 0;
                $scope.$digest();
                expect(layerAddedListener).toHaveBeenCalled();
            });
        });
})();