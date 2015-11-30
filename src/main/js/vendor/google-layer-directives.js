/* global angular, $, OpenLayers */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.vendor.google-layers', ['gawebtoolkit.core.layer-services']);
    /**
     * @ngdoc directive
     * @name gawebtoolkit.core.vendor-layers:gaGoogleLayer
     * @description
     * ## Overview ##
     * gaGoogleLayer directive is used to create a Google map.
     * @param {string|@} layerType - Required. Specified Google maps layer type. Eg, Hybrid.
     * @param {string|@} visibility - A boolean value ('true', 'false') which enables or disables visibility of the layer.
     * @scope
     * @restrict E
     * @example
     <example module="simpleMap">
     <file name="index.html">
     <div id="map"></div>
     <geo-map map-element-id="map">
     <geo-google-layer></geo-google-layer>
     </geo-map>
     </file>
     <file name="style.css">#map {width: 650px;height:600px;}</file>
     <file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
     </example>
     */
    app.directive('geoGoogleLayer', ['$timeout', '$compile', 'GeoLayerService', '$log',
        function ($timeout, $compile, GeoLayerService, $log) {
            var validGoogleLayerTypes = ['street','hybrid','satellite','terrain'];
            var validateGoogleLayerType = function (layerType) {
                for (var i = 0; i < validGoogleLayerTypes.length; i++) {
                    var validType = validGoogleLayerTypes[i];
                    if(validType === layerType.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            };
            return {
                restrict: "E",
                require: "^geoMap",
                scope: {
                    layerType: '@',
                    visibility: '@',
                    controllerEmitEventName: '@'
                },
                transclude: false,
                controller: ['$scope',function ($scope) {
                    var self = this;

                    //TODO Support layer common api via controller, eg opacity, set visibility?

                    if ($scope.controllerEmitEventName) {
                        $scope.$emit($scope.controllerEmitEventName, self);
                    }

                    return self;
                }],
                link: function ($scope, element, attrs, mapController) {
                    $scope.framework = mapController.getFrameworkVersion();
                    $scope.mapAPI = {};
                    $scope.mapAPI.mapController = mapController;
                    var layerOptions = {}, layer;
                    layerOptions = GeoLayerService.defaultLayerOptions(attrs,$scope.framework);
                    layerOptions.layerType = layerOptions.layerType || layerOptions.googleLayerType;
                    if(!validateGoogleLayerType(layerOptions.layerType)) {
                        $log.warn('Invalid Google layer type - ' + layerOptions.layerType +
                            ' used. Defaulting to "Hybrid". Specify default Google layer type in "geoConfig" - googleLayerType');
                        layerOptions.layerType = 'Hybrid';
                    }
                    var addLayerCallback = function () {
                        $scope.layerReady = true;
                    };

                    var constructLayer = function () {
                        $scope.constructionInProgress = true;

                        layerOptions.mapElementId = mapController.getMapElementId();
                        $log.info('Google ' + $scope.layerType + ' - constructing...');


                        layer = GeoLayerService.createGoogleLayer(layerOptions,$scope.framework);
                        //Async layer add
                        //mapController.waitingForAsyncLayer();
                        mapController.addLayer(layer).then(function (layerDto) {
                            $scope.layerDto = layerDto;
                            addLayerCallback();

                            $log.info('construction complete...');
                            $scope.constructionInProgress = false;
                        }, function (error) {
                            $scope.$emit(layerOptions.layerName + "_error", layerOptions);
                            $scope.onError({message:error,layer:layerOptions});
                            addLayerCallback();
                            //mapController.asyncLayerError(layer);
                            $log.info('construction failed...');
                            $scope.constructionInProgress = false;
                        });
                    };

                    attrs.$observe('visibility', function () {
                        if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                            mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true" || $scope.visibility === true);
                        }
                    });

                    attrs.$observe('layerType', function () {
                        if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                            $scope.initialiseLayer();
                        }
                    });
                    //attrs.$observe('opacity', function () {
                    //    if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                    //        //$log.info('layer - ' + $scope.layerDto.name + ' - opacity changed - ' + $scope.opacity);
                    //        mapController.setOpacity($scope.layerDto.id, $scope.opacity);
                    //    }
                    //});

                    $scope.initCount = 0;
                    function reconstructLayer() {
                        $log.info('reconstructing layer...');
                        var allLAyers = mapController.getLayers();
                        var layerIndex = null;

                        for (var i = 0; i < allLAyers.length; i++) {
                            if (allLAyers[i].id === $scope.layerDto.id) {
                                layerIndex = i;
                                break;
                            }
                        }
                        if (layerIndex != null) {
                            mapController.removeLayerById($scope.layerDto.id);
                            $scope.layerDto = null;
                            layerOptions = GeoLayerService.defaultLayerOptions(attrs,$scope.framework);
                            layerOptions.initialExtent = mapController.getInitialExtent();
                            layerOptions.format = $scope.format;
                            layer = GeoLayerService.createGoogleLayer(layerOptions,$scope.framework);
                            //Async layer add
                            mapController.addLayer(layer).then(function (layerDto) {
                                $scope.layerDto = layerDto;
                                addLayerCallback();
                                if($scope.layerDto != null) {
                                    var delta = layerIndex - mapController.getLayers().length + 1;
                                    mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                                }
                            });
                        }
                    }

                    $scope.initialiseLayer = function () {
                        $log.info('initialising layer...');
                        if ($scope.layerDto != null) {
                            reconstructLayer();
                        } else if($scope.layerReady && $scope.constructionInProgress) {
                            $log.info('...');
                        } else {
                            constructLayer();
                        }
                    };

                    $scope.$on('$destroy', function () {
                        if ($scope.layerDto) {
                            mapController.removeLayerById($scope.layerDto.id);
                        }
                        $(window).off("resize.Viewport");
                    });
                    $scope.initialiseLayer();
                }
            };
    }]);
})();