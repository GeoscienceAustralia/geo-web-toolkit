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
app.directive('gaFeatureLayer', [ '$timeout', '$compile', '$q', 'GALayerService', '$log',
	function ($timeout, $compile, $q, GALayerService, $log) {
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
				controllerEmitEventName: '@',
				postAddLayer: '&',
				onLayerDestroy: '&',
				isLonLatOrderValid: '@',
				inputFormat: '@'
			},
			controller: function ($scope) {
				$scope.layerControllerIsReady = false;
				$scope.gaFeatures = [];
				$scope.featurePromises = [];
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
					if (feature.then !== null && typeof feature.then === 'function') {
						if ($scope.layerControllerIsReady) {
							feature.then(function (resultFeature) {
								//$scope.$emit('featureAdded', featureDto);
								$scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, resultFeature);
							});
						} else {
							$scope.featurePromises.push(feature);
						}
						return feature;
					} else {
						var deferred = $q.defer();
						if ($scope.layerControllerIsReady) {
							var featureDto = $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, feature);
							resolveSyncFeature(deferred, featureDto);
						} else {
							$scope.featurePromises.push(deferred.promise);
							resolveSyncFeature(deferred, feature);
						}
						return deferred.promise;
					}
				};
				var resolveSyncFeature = function (deferred, feature) {
					$timeout(function () {
						deferred.resolve(feature);
					});
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

				self.createFeature = function (geoJsonFeature) {
					return $scope.mapAPI.mapController.createFeature(geoJsonFeature);
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
				layerOptions.postAddLayer = $scope.postAddLayer;

				var layer = GALayerService.createFeatureLayer(layerOptions);
                //mapController.waitingForAsyncLayer();
				//Async layer add
				mapController.addLayer(layer).then(function (layerDto) {
					$scope.layerDto = layerDto;
                    //mapController.asyncLayerLoaded();
					$scope.layerControllerIsReady = true;
					$q.all($scope.featurePromises).then(function (allFeatures) {
						for (var i = 0; i < allFeatures.length; i++) {
							var feature = allFeatures[i];
							mapController.addFeatureToLayer($scope.layerDto.id, feature);
						}
					});
				});

				$scope.$on('$destroy', function () {
					if ($scope.layerDto.id != null) {
						$scope.onLayerDestroy({map: mapController.getMapInstance()});
					}
					$timeout(function () {
						GALayerService.cleanupLayer(mapController.getMapInstance(), $scope.layerDto.id);
					});

					//mapController.removeLayerById($scope.layerDto.id);
				});

				attrs.$observe('wfsFilterValue', function (newVal) {
					if (newVal) {
						$timeout(function () {
							mapController.filterFeatureLayer($scope.layerDto.id, newVal, $scope.wfsFeatureAttributes);
						});
					}
				});

				attrs.$observe('visibility', function (newVal) {
					if ($scope.layerDto != null) {
						mapController.setLayerVisibility($scope.layerDto.id, newVal);
					}
				});
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
app.directive('gaFeature', [function () {
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
            var initialCreate = true;
			var createFeature = function (newVal, oldVal) {
				if (!newVal && oldVal) {
					//Remove feature that no longer exists
					featureLayerController.removeFeature($scope.featureDto.id);
				}

				if (newVal && newVal !== oldVal) {
					//Remove old feature to be replaced
                    if($scope.featureDto != null && $scope.featureDto.id.length > 0) {
                        featureLayerController.removeFeature($scope.featureDto.id);
                    }
                    initialCreate = false;
					var feature = featureLayerController.createFeature($scope.geoJsonFeature);
					featureLayerController.addFeature(feature).then(function (resultFeature) {
						$scope.featureDto = resultFeature;
					});
				}

                if(newVal && initialCreate) {
                    var initialFeature = featureLayerController.createFeature($scope.geoJsonFeature);
                    initialCreate = false;
                    featureLayerController.addFeature(initialFeature).then(function (resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }
			};

			$scope.$on('$destroy', function () {
				if ($scope.featureDto != null) {
					featureLayerController.removeFeature($scope.featureDto.id);
				}
                if($scope.geoJsonFeatureWatch != null) {
                    $scope.geoJsonFeatureWatch();
                }
			});

			//Data ready on link, create first feature and then listen for changes
			//Start watch in a timeout due to angular firing watch for initial value
//			if ($scope.geoJsonFeature != null) {
//				var feature = featureLayerController.createFeature($scope.geoJsonFeature);
//				featureLayerController.addFeature(feature).then(function (resultFeature) {
//					$scope.featureDto = resultFeature;
//				});
//			}
            $scope.geoJsonFeatureWatch = $scope.$watch('geoJsonFeature', createFeature);
		}
	};
} ]);