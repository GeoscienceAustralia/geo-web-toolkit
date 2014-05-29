var angular = angular || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.layer-directives', [ 'gawebtoolkit.core.map-directives', 'gawebtoolkit.core.layer-services',
	'gawebtoolkit.core.map-services' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.layer-directives:gaMapLayer
 * @description
 *
 * @scope
 * @restrict E
 * @example
 */
app.directive('gaMapLayer', [ '$timeout', '$compile', 'GALayerService', '$log',
	function ($timeout, $compile, GALayerService, $log) {
		'use strict';
		return {
			restrict: "E",
			require: "^gaMap",
			scope: {
				layerAttribution: '@',
				layerName: '@',
				layerUrl: '@',
				layers: '@',
				layerType: '@',
				wrapDateLine: '@',
				visibility: '@',
				isBaseLayer: '@',
				controllerEmitEventName: '@',
				refreshLayer: '@'
			},
			transclude: false,
			controller: function ($scope) {

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

				if ($scope.controllerEmitEventName) {
					$scope.$emit($scope.controllerEmitEventName, self);
				}

				return self;
			},
			link: function ($scope, element, attrs, mapController) {
				attrs.$observe('refreshLayer', function (newVal, oldVal) {
					if(newVal !== oldVal) {
						$log.info('refresh for - ' + $scope.layerName);
						$scope.initialiseLayer();
					}
				});
				$scope.mapAPI = {};
				$scope.mapAPI.mapController = mapController;
				var layerOptions, layer;

				var addLayerCallback = function () {
//					if (layerOptions.isBaseLayer &&
//						layerOptions.wrapDateLine &&
//						layerOptions.visibility) {
//						mapController.setInitialPositionAndZoom();
//					}
					$scope.layerReady = true;
				};

				function initialiseDefaults() {
					if (attrs.layers == null) {
						attrs.layers = "0";
					}
					if (attrs.wrapDateLine == null) {
						attrs.wrapDateLine = true;
					}
					if (attrs.visibility == null) {
						attrs.visibility = true;
					}
					if (attrs.layerType == null || attrs.layerType.length === 0) {
						if (attrs.layerUrl.indexOf('WMSServer') > 0) {
							attrs.layerType = "WMS";
						}
					}
				}

				var constructLayer = function () {

					initialiseDefaults();
					$scope.constructionInProgress = true;
					layerOptions = GALayerService.defaultLayerOptions(attrs);
					$log.info(layerOptions.layerName + ' - constructing...');
					if(layerOptions.layerType.length === 0) {
						return;
					}
					layer = GALayerService.createLayer(layerOptions);
					//Async layer add
					mapController.waitingForAsyncLayer();
					mapController.addLayer(layer).then(function (layerDto) {
						$scope.layerDto = layerDto;
						addLayerCallback();
						mapController.asyncLayerLoaded();
						$log.info('construction complete...');
						$scope.constructionInProgress = false;
					});
				};

				attrs.$observe('visibility', function () {
					if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
						mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true");
					}
				});
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
						var delta = layerIndex - allLAyers.length + 1;
						mapController.removeLayerById($scope.layerDto.id);
						$scope.layerDto = null;
						initialiseDefaults();
						layerOptions = GALayerService.defaultLayerOptions(attrs);

						layer = GALayerService.createLayer(layerOptions);
						//Async layer add
						mapController.addLayer(layer).then(function (layerDto) {
							$scope.layerDto = layerDto;
							addLayerCallback();
							if($scope.layerDto != null) {
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

                if(attrs.refreshLayer == null && $scope.layerType != null && $scope.layerType.length > 0) {
                    $scope.initialiseLayer();
                }
			}
		};
	} ]);