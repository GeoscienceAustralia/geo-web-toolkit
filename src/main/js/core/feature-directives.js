var angular = angular || {};

var app = angular.module('gawebtoolkit.core.feature-directives', [ 'gawebtoolkit.core.map-directives', 'gawebtoolkit.core.map-services',
    'gawebtoolkit.core.layer-services' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.feature-directives:gaFeatureLayer
 * @description
 *
 * @requires gaMap
 * @scope
 * @restrict E
 * @example
 */
app.directive('gaFeatureLayer', [ '$timeout', '$compile', '$q', 'GALayerService',
    function ($timeout, $compile, $q, GALayerService) {
        'use strict';
        return {
            restrict: "E",
            require: "^gaMap",
            scope: {
                url: '@',
                layerName: '@',
                serverType: '@',
                wfsFeatureList: '@', // comma separated features
                wfsFilterValue: '@',
                wfsVersion: '@',
                wfsFeaturePrefix: '@',
                wfsFeatureType: '@',
                wfsFeatureNs: '@',
                wfsFeatureAttributes: '@',
                wfsGeometryName: '@',
                visibility: '@',
                onFeatureClick: '&',
                onFeaturesLoaded: '&',
                updateResultsEventName: '@',
                controllerEmitEventName: '@',
                postAddLayer: '&',
                isLonLatOrderValid: '@',
                inputFormat: '@'
            },
            controller: function ($scope) {
                $scope.layerControllerIsReady = false;
                $scope.gaFeatures = [];
                var self = this;

                self.hide = function () {
                    $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, false);
                    return self; //for chaining.
                };

                self.show = function () {
                    $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, true);
                    return self; //for chaining.
                };

                self.setOpacity = function (opacity) {
                    $scope.mapAPI.mapController.setOpacity($scope.layerDto.id, opacity);
                    return self; //for chaining.
                };

                self.getFeatures = function () {
                    return $scope.mapAPI.mapController.getLayerFeatures($scope.layerDto.id);
                };

                self.addFeature = function (feature) {
                    return $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, feature);
                };

                self.createFeatureAsync = function (geoJsonFeature, isLonLatOrderValid) {
                    var deferred = $q.defer();
                    $scope.gaFeatures.push({
                        deferred: deferred,
                        feature: geoJsonFeature,
                        isLonLatOrderValid: isLonLatOrderValid
                    });
                    return deferred.promise;
                };

                self.createFeature = function (geoJsonFeature, isLonLatOrderValid) {
                    return $scope.mapAPI.mapController.createFeature($scope.layerDto.id, geoJsonFeature, isLonLatOrderValid);
                };

                self.removeFeature = function (featureId) {
                    $scope.mapAPI.mapController.removeFeatureFromLayer($scope.layerDto.id, featureId);
                };

                self.isLayerControllerReady = function () {
                    return $scope.layerControllerIsReady;
                };

                if ($scope.controllerEmitEventName) {
                    $scope.$emit($scope.controllerEmitEventName, self);
                }

                return self;
            },
            transclude: false,
            link: function ($scope, element, attrs, mapController) {
                $scope.mapAPI = {};
                $scope.mapAPI.mapController = mapController;

                var layerOptions = GALayerService.defaultLayerOptions(attrs);
                layerOptions.datumProjection = mapController.getProjection();
                layerOptions.onFeatureClick = $scope.onFeatureClick;
                layerOptions.onFeaturesLoaded = $scope.onFeaturesLoaded;
                layerOptions.postAddLayer = $scope.postAddLayer;

                var layer = GALayerService.createFeatureLayer(layerOptions);

                var addLayerCallback = function () {
                    for (var i = 0; i < $scope.gaFeatures.length; i++) {
                        var feature = mapController.createFeature($scope.layerDto.id, $scope.gaFeatures[i].feature);
                        $scope.gaFeatures[i].deferred.resolve(feature);
                    }
                };
                //Async layer add
                if (layer.then !== null && typeof layer.then === 'function') {
                    mapController.waitingForAsyncLayer();
                    layer.then(function (resultLayer) {
                        $scope.layerDto = mapController.addLayer(resultLayer);
                        mapController.asyncLayerLoaded();
                        addLayerCallback();
                    });
                } else {
                    //Sync layer add
                    $scope.layerDto = mapController.addLayer(layer);
                    addLayerCallback();
                }

                $scope.$on('$destroy', function () {
                    mapController.removeLayerById($scope.layerDto.id);
                });

                attrs.$observe('wfsFilterValue', function (newVal) {
                    if (newVal) {
                        $timeout(function () {
                            mapController.filterFeatureLayer($scope.layerDto.id, newVal, $scope.wfsFeatureAttributes);
                        });
                    }
                });

                attrs.$observe('visibility', function (newVal) {
                    mapController.setLayerVisibility($scope.layerDto.id, newVal);
                });

                $scope.layerControllerIsReady = true;
            }
        };
    } ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.core.feature-directives:gaFeature
 *
 * @description
 * Wrapper for a native wfs layer
 *
 * @scope
 * @restrict E
 * @example
 */
app.directive('gaFeature', [ '$timeout', function ($timeout) {
    'use strict';
    return {
        restrict: "E",
        require: "^gaFeatureLayer",
        scope: {
            visibility: '@',
            geoJsonFeature: '=',
            inputFormat: '@',
            isLonLatOrderValid: '@'
            //geoJsonFeatureUrl: '@' //TODO
        },
        transclude: false,
        link: function ($scope, element, attrs, featureLayerController) {
            var createFeature = function (newVal, oldVal) {
                if (!newVal && oldVal) {
                    //Remove feature that no longer exists
                    featureLayerController.removeFeature($scope.featureDto.id);
                }

                if (newVal && newVal !== oldVal) {
                    //Remove old feature to be replaced
                    featureLayerController.removeFeature($scope.featureDto.id);

                    var feature = featureLayerController.createFeature($scope.geoJsonFeature, $scope.isLonLatOrderValid);
                    $scope.featureDto = featureLayerController.addFeature(feature);
                }
            };

            if (featureLayerController.isLayerControllerReady()) {
                if ($scope.geoJsonFeature != null) {
                    var feature = featureLayerController.createFeature($scope.geoJsonFeature, $scope.isLonLatOrderValid);
                    $scope.featureDto = featureLayerController.addFeature(feature);
                }
            } else {
                featureLayerController.createFeatureAsync($scope.geoJsonFeature).then(function (feature) {
                    $scope.featureDto = featureLayerController.addFeature(feature);
                });
            }

            $scope.$on('$destroy', function () {
                featureLayerController.removeFeature($scope.featureDto.id);
            });

            //Data ready on link, create first feature and then listen for changes
            //Start watch in a timeout due to angular firing watch for initial value

            $scope.$watch('geoJsonFeature', createFeature);
        }
    };
} ]);