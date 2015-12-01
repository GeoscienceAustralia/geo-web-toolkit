/* global describe, beforeEach, module, angular, inject, it, expect, jasmine */
(function () {
    "use strict";

    describe(
        'OpenLayers v3 "geo-map-control" implementation tests',
        function () {
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
                    .element('<geo-map map-element-id="geomap" framework="olv3">' + '<geo-map-layer layer-name="Australian Landsat Mosaic"' +
                        'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                        'wrap-date-line="true"' +
                        'zoom-to-max="true"' +
                        'layer-type="WMS"' +
                        'is-base-layer="true"' +
                        '>' +
                        '<geo-map-control map-control-name="OverviewMap" pre-options-loaded="testPreloadOptions(options)" control-options="overviewOptions"></geo-map-control>' +
                        '<geo-map-control map-control-name="ScaleLine"></geo-map-control>' +
                        '<geo-map-control map-control-name="panzoombar"></geo-map-control>' +
                        '<geo-map-control map-control-name="attribution"></geo-map-control>' +
                        '<geo-map-control map-control-name="mouseposition" />' +
                        '<div id="geomap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            //Tests
            it('Should have called event "mapControllerReady" with mapController', function () {
                expect($scope.mapController !== null);
                expect(listener).toHaveBeenCalledWith($scope.mapController);
            });

            it('Should have added default navigation interactions', function () {
                expect($scope.mapController.getMapInstance().getInteractions().getLength()).toBe(9);
            });

            it('Should have added an overviewmap control', function () {
                //Overview map is added at the end due to bug with control if added to the map just after initialization/first render
                expect($scope.mapController.getMapInstance().getControls().item(4).get('name')).toBe("overviewmap");
            });

            it('Should have added a ScaleLine control', function () {
                expect($scope.mapController.getMapInstance().getControls().item(0).get('name')).toBe('scaleline');
            });

            it('Should have added a PanZoomBar control', function () {
                expect($scope.mapController.getMapInstance().getControls().item(1).get('name')).toBe('panzoombar');

            });

            it('Should have added a attribution control', function () {
                expect($scope.mapController.getMapInstance().getControls().item(2).get('name')).toBe('attribution');
            });

            it('Should ignore the last control as the name is not specified', function () {
                expect($scope.mapController.getMapInstance().getControls().getLength() === 5).toBe(true);
            });

            it('Should modify options and fire "preOptionsLoaded"', function () {
                expect(preload).toHaveBeenCalledWith($scope.overviewOptions);
                expect($scope.overviewOptions.test).toBe('success');
            });

            it('Should provide meaningful error when invalid control name is provided', function () {
                try {
                    $scope.mapController.addControl('foobar');
                } catch (e) {
                    //Test for supported control name to show error lists off valid controls
                    expect(e.message.indexOf('zoomslider') !== -1).toBe(true);
                }
            });
        });
})();