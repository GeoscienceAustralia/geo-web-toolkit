/* global angular, $, describe, jasmine, beforeEach, it, expect, module, inject */
describe(
    'gawebtoolkit ga-map controller interface tests',
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
            element = angular
                .element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                '<ga-map-layer layer-name="Australian Landsat Mosaic"' +
                'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                'wrap-date-line="true"' +
                'zoom-to-max="true"' +
                'map-bg-color="#194584"' +
                'layer-type="WMS"' +
                'is-base-layer="true"' +
                '></ga-map-layer>' +
                '<div id="gamap"></div></ga-map>');
            $compile(element)($scope);
            $scope.$digest();

        }));
        //Tests
        it('Should have called event "mapControllerReady" with mapController', function () {
            expect($scope.mapController !== null);
            expect(listener).toHaveBeenCalledWith($scope.mapController);
        });
        it('Should have a "addLayer" function on the controller', function () {
            expect(typeof $scope.mapController.addLayer === "function");
        });
        it('Should have a "zoomToMax" function on the controller', function () {
            expect(typeof $scope.mapController.zoomToMax === "function");
        });
        it('Should have a "registerMapMouseMove" function on the controller', function () {
            expect(typeof $scope.mapController.registerMapMouseMove === "function");
        });
        it('Should have a "registerMapClick" function on the controller', function () {
            expect(typeof $scope.mapController.registerMapClick === "function");
        });
        it('Should have a "unRegisterMapClick" function on the controller', function () {
            expect(typeof $scope.mapController.unRegisterMapClick === "function");
        });
        it('Should have a "addControl" function on the controller', function () {
            expect(typeof $scope.mapController.addControl === "function");
        });
        it('Should have a "getLonLatFromPixel" function on the controller', function () {
            expect(typeof $scope.mapController.getLonLatFromPixel === "function");
        });
        it('Should have a "getPixelFromLonLat" function on the controller', function () {
            expect(typeof $scope.mapController.getPixelFromLonLat === "function");
        });
        it('Should have a "getPointFromEvent" function on the controller', function () {
            expect(typeof $scope.mapController.getPointFromEvent === "function");
        });
        it('Should have a "getLayers" function on the controller', function () {
            expect(typeof $scope.mapController.getLayers === "function");
        });
        it('Should have a "zoomToLayer" function on the controller', function () {
            expect(typeof $scope.mapController.zoomToLayer === "function");
        });
        it('Should have a "getProjection" function on the controller', function () {
            expect(typeof $scope.mapController.getProjection === "function");
        });
        it('Should have a "getDisplayProjection" function on the controller', function () {
            expect(typeof $scope.mapController.getDisplayProjection === "function");
        });
        it('Should have a "registerMapMouseMoveEnd" function on the controller', function () {
            expect(typeof $scope.mapController.registerMapMouseMoveEnd === "function");
        });
        it('Should have a "setLayerVisibility" function on the controller', function () {
            expect(typeof $scope.mapController.setLayerVisibility === "function");
        });
        it('Should have a "createBoundingBox" function on the controller', function () {
            expect(typeof $scope.mapController.createBoundingBox === "function");
        });
        it('Should have a "createBounds" function on the controller', function () {
            expect(typeof $scope.mapController.createBounds === "function");
        });
        it('Should have a "zoomToExtent" function on the controller', function () {
            expect(typeof $scope.mapController.zoomToExtent === "function");
        });
        it('Should have a "zoom" function on the controller', function () {
            expect(typeof $scope.mapController.zoom === "function");
        });
        it('Should have a "setBaseLayer" function on the controller', function () {
            expect(typeof $scope.mapController.setBaseLayer === "function");
        });
        it('Should have a "setCenterPosition" function on the controller', function () {
            expect(typeof $scope.mapController.setCenterPosition === "function");
        });
        it('Should have a "setInitialPositionAndZoom" function on the controller', function () {
            expect(typeof $scope.mapController.setInitialPositionAndZoom === "function");
        });
        it('Should have a "isBaseLayer" function on the controller', function () {
            expect(typeof $scope.mapController.isBaseLayer === "function");
        });
        it('Should have a "setOpacity" function on the controller', function () {
            expect(typeof $scope.mapController.setOpacity === "function");
        });
        it('Should have a "getMapElementId" function on the controller', function () {
            expect(typeof $scope.mapController.getMapElementId === "function");
        });
        it('Should have a "setMapMarker" function on the controller', function () {
            expect(typeof $scope.mapController.setMapMarker === "function");
        });
        it('Should have a "removeLayerByName" function on the controller', function () {
            expect(typeof $scope.mapController.removeLayerByName === "function");
        });
        it('Should have a "removeLayersByName" function on the controller', function () {
            expect(typeof $scope.mapController.removeLayersByName === "function");
        });
        it('Should have a "removeLayerById" function on the controller', function () {
            expect(typeof $scope.mapController.removeLayerById === "function");
        });
        it('Should have a "getMarkerCountForLayerName" function on the controller', function () {
            expect(typeof $scope.mapController.getMarkerCountForLayerName === "function");
        });
        it('Should have a "drawPolyLine" function on the controller', function () {
            expect(typeof $scope.mapController.drawPolyLine === "function");
        });
        it('Should have a "isControlActive" function on the controller', function () {
            expect(typeof $scope.mapController.isControlActive === "function");
        });
        it('Should have a "registerFeatureSelected" function on the controller', function () {
            expect(typeof $scope.mapController.registerFeatureSelected === "function");
        });
        it('Should have a "resetMapFired" function on the controller', function () {
            expect(typeof $scope.mapController.resetMapFired === "function");
        });
        it('Should have a "activateControl" function on the controller', function () {
            expect(typeof $scope.mapController.activateControl === "function");
        });
        it('Should have a "deactivateControl" function on the controller', function () {
            expect(typeof $scope.mapController.deactivateControl === "function");
        });
        it('Should have a "registerControlEvent" function on the controller', function () {
            expect(typeof $scope.mapController.registerControlEvent === "function");
        });
        it('Should have a "unRegisterControlEvent" function on the controller', function () {
            expect(typeof $scope.mapController.unRegisterControlEvent === "function");
        });
        it('Should have a "filterFeatureLayer" function on the controller', function () {
            expect(typeof $scope.mapController.filterFeatureLayer === "function");
        });
        it('Should have a "getLayerFeatures" function on the controller', function () {
            expect(typeof $scope.mapController.getLayerFeatures === "function");
        });
        it('Should have a "createFeature" function on the controller', function () {
            expect(typeof $scope.mapController.createFeature === "function");
        });
        it('Should have a "addFeatureToLayer" function on the controller', function () {
            expect(typeof $scope.mapController.addFeatureToLayer === "function");
        });
    });
describe(
    'gawebtoolkit core directives unit tests',
    function () {
        'use strict';
        var $compile, $scope, element, layersReadyListener, $timeout;

        // Load the myApp module, which contains the directive
        beforeEach(module('testApp'));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $scope = _$rootScope_;
            $timeout = _$timeout_;
            element = angular
                .element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' +
                '<ga-map-layer layer-name="Australian Landsat Mosaic"' +
                'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"' +
                'wrap-date-line="true"' +
                'zoom-to-max="true"' +
                'map-bg-color="#194584"' +
                'layer-type="WMS"' +
                'is-base-layer="true"' +
                '></ga-map-layer><div id="gamap"></div></ga-map>');
            $scope.$on('mapControllerReady', function (event, args) {
                $scope.mapController = args;
            });
            layersReadyListener = jasmine.createSpy('layersReadyListener');
            $scope.$on('layersReady', function (event, args) {
                layersReadyListener(args);
                $scope.layerThatAreReady = args;
            });

            $scope.mapIsReady = function () {
                return $scope.layerThatAreReady != null;
            };
            $compile(element)(_$rootScope_);
            $scope.$digest();
            $timeout.flush();
        }));

        it('Should generate an openlayers view within the specified div with matching id', function () {

            // Check that the compiled element contains the templated content
            expect(element.isolateScope().datumProjection === 'EPSG:102100').toBe(true);
            expect(element.isolateScope().displayProjection === 'EPSG:4326').toBe(true);
            expect(element.isolateScope().mapElementId === 'gamap').toBe(true);
        });

        it('Should have added 1 layer', function () {
            //Test that a layer is being added
            expect(layersReadyListener).toHaveBeenCalled();
            expect(layersReadyListener).toHaveBeenCalledWith($scope.layerThatAreReady);
            expect($scope.mapController.getLayers().length === 1).toBe(true);
        });
        it('Should have added 1 layer with the name of "Australian Landsat Mosaic"', function () {
            expect($scope.mapController.getLayers()[0].name === 'Australian Landsat Mosaic').toBe(true);

        });
        it('Should have added 1 layer with the type of "WMS"', function () {
            expect($scope.mapController.getLayers()[0].type === 'WMS' !== -1).toBe(true);
        });

        it('Should return layer object containing own properties of "id","name","type","visibility","opacity"', function () {
            expect($scope.mapController.getLayers().hasOwnProperty('id'));
            expect($scope.mapController.getLayers().hasOwnProperty('name'));
            expect($scope.mapController.getLayers().hasOwnProperty('type'));
            expect($scope.mapController.getLayers().hasOwnProperty('visibility'));
            expect($scope.mapController.getLayers().hasOwnProperty('opacity'));
        });
    });