var angular = angular || {};

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
app.directive('gaMapLayer', [ '$timeout', '$compile', 'GALayerService', '$http','$log',
	function($timeout, $compile, GALayerService,$http, $log) {
   'use strict';
   return {
      restrict : "E",
      require : "^gaMap",
      scope : {
         layerAttribution : '@',
         layerName : '@',
         layerUrl : '@',
         layers : '@',
         layerType : '@',
         wrapDateLine : '@',
         visibility : '@',
         isBaseLayer : '@',
         controllerEmitEventName : '@'
      },
      transclude : false,
      controller : function($scope) {
         var self = this;

         self.hide = function() {
            $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, false);
            return self; //for chaining.
         };

         self.show = function() {
            $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, true);
            return self; //for chaining.
         };

         self.setOpacity = function(opacity) {
            $scope.mapAPI.mapController.setOpacity($scope.layerDto.id, opacity);
            return self; //for chaining.
         };

         if ($scope.controllerEmitEventName) {
            $scope.$emit($scope.controllerEmitEventName, self);
         }

         return self;
      },
      link : function($scope, element, attrs, mapController) {
         $scope.mapAPI = {};
         $scope.mapAPI.mapController = mapController;
         var layerOptions, layer;
         var constructLayer = function() {
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
            layerOptions = GALayerService.defaultLayerOptions(attrs);
            layer = GALayerService.createLayer(layerOptions);
            console.log(layerOptions);
            //Async layer add
            if (layer.then !== null && typeof layer.then === 'function') {
               mapController.waitingForAsyncLayer();
               layer.then(function(resultLayer) {
                  $scope.layerDto = mapController.addLayer(resultLayer);
                  mapController.asyncLayerLoaded();
                  addLayerCallback();
               });
            } else {
               //Sync layer add
               $scope.layerDto = mapController.addLayer(layer);
               addLayerCallback();
            }
         };

         var addLayerCallback = function() {
            if (layerOptions.isBaseLayer && layerOptions.wrapDateLine
                  && layerOptions.visibility) {
               mapController.setInitialPositionAndZoom();
            }
            $scope.layerReady = true;
         };

         attrs.$observe('visibility', function() {
            if ($scope.layerReady && mapController) {
               mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true");
            }
         });
         $scope.initCount = 0;
         var initialiseLayer = function() {
            console.log('initialiseLayer');
            if ($scope.layerDto != null) {
               var allLAyers = mapController.getLayers();
               var layerIndex = null;

               for ( var i = 0; i < allLAyers.length; i++) {
                  if (allLAyers[i].id === $scope.layerDto.id) {
                     layerIndex = i;
                     break;
                  }
               }
               if (layerIndex != null) {
                  var delta = layerIndex - allLAyers.length
                        + 1;
                  mapController.removeLayerById($scope.layerDto.id);
                  constructLayer();
                  mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
               }
            } else {
               constructLayer();
            }
         };

         $scope.$on('$destroy', function() {
            if ($scope.layerDto) {
               mapController.removeLayerById($scope.layerDto.id);
            }
         });

         attrs.$observe('layerUrl', function(newVal, oldVal) {
            if (newVal) {
               initialiseLayer();
            }
         });
         if (attrs.layerType.indexOf('Google') === 0) {
            initialiseLayer();
         }
      }
   };
} ]);