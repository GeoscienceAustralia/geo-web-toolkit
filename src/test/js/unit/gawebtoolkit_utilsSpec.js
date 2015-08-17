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
                mapControllerListener,
                server,
                utilsService;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, $injector) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                utilsService = $injector.get('GAWTUtils');
                mapControllerListener = jasmine.createSpy('mapControllerListener');
                $scope.$on('mapControllerReady', function (event, args) {
                    mapControllerListener(args);
                    $scope.mapController = args;
                });
            }));


            it('Should convert Hex to RGB values', function () {
                var result = utilsService.convertHexToRgb('#FFFFFF');

                expect(result[0]).toBe(255);
                expect(result[1]).toBe(255);
                expect(result[2]).toBe(255);

                var whiteSmoke = utilsService.convertHexToRgb('#f8f8ff');

                expect(whiteSmoke[0]).toBe(248);
                expect(whiteSmoke[1]).toBe(248);
                expect(whiteSmoke[2]).toBe(255);
            });
        });
})();