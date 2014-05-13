var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.control-directives',
	[
		'gawebtoolkit.core.map-directives',
		'gawebtoolkit.core.map-services',
		'gawebtoolkit.core.layer-services'
	]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.control-directives:gaMapControl

 * @description
 * This is a wrapper for a native map control
 * @scope
 * @restrict E
 * @require gaMap
 * @example
 */
app.directive('gaMapControl', [ function () {
	'use strict';
	return {
		restrict: "E",
		require: "^gaMap",
		scope: {
			mapControlName: '@',
			mapControlId: '@',
			controlOptions: "=",
			containerElementId: '@',
			controlEnabled: '@'
		},
		link: function (scope, element, attrs, mapController) {
			if (!scope.mapControlName) {
				return;
			}
			scope.controlDto = mapController.addControl(scope.mapControlName, scope.controlOptions, scope.containerElementId, scope.mapControlId);
			if(attrs.controlEnabled != null) {
				attrs.$observe('controlEnabled', function () {
					if (scope.controlEnabled === 'true') {
						mapController.activateControl(scope.controlDto.id);
					} else {
						mapController.deactivateControl(scope.controlDto.id);
					}
				});
			}
		}
	};
} ]);