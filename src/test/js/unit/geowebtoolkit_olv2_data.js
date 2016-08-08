/* global angular, module, beforeEach, inject, jasmine */
(function () {
    "use strict";
    describe(
        'geowebtoolkit data service contract tests',
        function () {
            "use strict";
            var $compile, $scope, $timeout,GeoDataService, element, listener;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_,_GeoDataService_) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                GeoDataService = _GeoDataService_;
                listener = jasmine.createSpy('listener');
                $scope.$on('mapControllerReady', function (event, args) {
                    listener(args);
                    $scope.mapController = args;
                });

                $scope.activatePermalink = true;
                element = angular
                    .element('<geo-map map-element-id="geomap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                        '<geo-map-layer layer-name="Australian Landsat Mosaic"' +
                        'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                        'wrap-date-line="true"' +
                        'zoom-to-max="true"' +
                        'map-bg-color="#194584"' +
                        'layer-type="WMS"' +
                        'is-base-layer="true"' +
                        '>' +
                        '<geo-map-control map-control-name="OverviewMap"></geo-map-control>' +
                        '<geo-map-control map-control-name="Permalink" map-control-id="myPermalinkControl" control-enabled="{{activatePermalink}}"></geo-map-control>' +
                        '<geo-map-control map-control-name="ScaleLine"></geo-map-control>' +
                        '<geo-map-control map-control-name="panzoombar"></geo-map-control>' +
                        '<geo-map-control map-control-name="attribution"></geo-map-control>' +
                        '<geo-map-control map-control-name="mouseposition"></geo-map-control>' +
                        '<geo-map-control map-control-name="measureline" map-control-id="myMeasureTest"></geo-map-control>' +
                        '<geo-map-control map-control-name="measurepolygon" ></geo-map-control>' +
                        '<div id="geomap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();

            }));
            //Tests
            it('GeoDataService injected', function () {
                expect(GeoDataService).not.toBe(null);
            });

            it('GeoDataService to have function "getLayersByWMSCapabilities"', function () {
                expect(typeof GeoDataService.getLayersByWMSCapabilities).toBe('function');
            });

            it('GeoDataService to have function "getWMSFeatures"', function () {
                expect(typeof GeoDataService.getWMSFeatures).toBe('function');
            });

            it('GeoDataService to have function "getWMSFeaturesUrl"', function () {
                expect(typeof GeoDataService.getWMSFeaturesUrl).toBe('function');
            });

            it('GeoDataService to have function "getWMSFeaturesByLayerId"', function () {
                expect(typeof GeoDataService.getWMSFeaturesByLayerId).toBe('function');
            });
        });
    describe(
        'geowebtoolkit data service ol2 tests',
        function () {
            "use strict";
            var $compile, $scope, $timeout, GeoDataService, element, listener;

            // Load the myApp module, which contains the directive
            beforeEach(module('testApp'));

            // Store references to $rootScope and $compile
            // so they are available to all tests in this describe block
            beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _GeoDataService_) {
                // The injector unwraps the underscores (_) from around the parameter names when matching
                $compile = _$compile_;
                $timeout = _$timeout_;
                $scope = _$rootScope_;
                GeoDataService = _GeoDataService_;
                listener = jasmine.createSpy('listener');
                var layersListener = jasmine.createSpy('layersListener');
                $scope.$on('mapControllerReady', function (event, args) {
                    listener(args);
                    $scope.mapController = args;
                    $scope.$on('layersReady', function (event, layers) {
                        layersListener(layers);
                        $scope.allLayers = $scope.mapController.getLayers();
                    });
                });

                $scope.activatePermalink = true;
                element = angular
                    .element('<geo-map map-element-id="geomap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                        '<geo-map-layer layer-name="Australian Landsat Mosaic"' +
                        ' layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                        ' wrap-date-line="true"' +
                        ' layers="0" ' +
                        ' zoom-to-max="true"' +
                        ' map-bg-color="#194584"' +
                        ' layer-type="WMS"' +
                        ' is-base-layer="true"' +
                        '>' +
                        '<geo-map-control map-control-name="OverviewMap"></geo-map-control>' +
                        '<geo-map-control map-control-name="Permalink" map-control-id="myPermalinkControl" control-enabled="{{activatePermalink}}"></geo-map-control>' +
                        '<geo-map-control map-control-name="ScaleLine"></geo-map-control>' +
                        '<geo-map-control map-control-name="panzoombar"></geo-map-control>' +
                        '<geo-map-control map-control-name="attribution"></geo-map-control>' +
                        '<geo-map-control map-control-name="mouseposition"></geo-map-control>' +
                        '<geo-map-control map-control-name="measureline" map-control-id="myMeasureTest"></geo-map-control>' +
                        '<geo-map-control map-control-name="measurepolygon" ></geo-map-control>' +
                        '<div id="geomap"></div></geo-map>');
                $compile(element)($scope);
                $scope.$digest();
                $timeout.flush();
            }));
            //Tests
            it('Should call GeoDataService getWMSFeaturesUrl and generate valid URL', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                var layer = $scope.mapController.getLayers()[0];
                var url = GeoDataService.getWMSFeaturesUrl(mapInstance,layer.url,'0','1.1.1',{
                    x: 100,
                    y: 100
                },'text/html','olv2');
                expect(url).toBe(
                    'http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer?LAYERS=0&QUERY_LAYERS=0&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=-78271.516953%2C-78271.516953%2C78271.516953%2C78271.516953&FEATURE_COUNT=100&HEIGHT=1&WIDTH=1&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A102100&X=100&Y=100');
            });
            it('Should call getWMSFeaturesByLayerId', function () {
                var mapInstance = $scope.mapController.getMapInstance();
                var layer = $scope.mapController.getLayers()[0];
                var promise = GeoDataService.getWMSFeaturesByLayerId(mapInstance,layer.url,layer.id,{
                    x: 100,
                    y: 100
                },'olv2');
                expect(promise).not.toBe(null);
                expect(promise).not.toBe(undefined);
            });
        });
})();