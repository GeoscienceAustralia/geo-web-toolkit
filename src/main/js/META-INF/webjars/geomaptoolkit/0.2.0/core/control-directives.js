var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.control-directives', [ 'gawebtoolkit.core.map-directives', 'gawebtoolkit.core.map-services',
      'gawebtoolkit.core.layer-services' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.directives.directive:gaMapControl
 * @param {string} mapControlName
 * @param {string} mapControlId
 * @param {Object} controlOptions
 * @description
 * This is a wrapper for a native map control
 * @scope
 * @restrict E
 * @require gaMap
 * @example
 */
app.directive('gaMapControl', [ function() {
   'use strict';
   return {
      restrict : "E",
      require : "^gaMap",
      scope : {
         mapControlName : '@',
         mapControlId : '@',
         controlOptions : "=",
         containerElementId : '@'
      },
      link : function(scope, element, attrs, mapController) {
         if (!scope.mapControlName) {
            return;
         }
         mapController.addControl(scope.mapControlName, scope.controlOptions, scope.containerElementId, scope.mapControlId);
      }
   };
} ]);