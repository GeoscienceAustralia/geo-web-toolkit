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
 * ## Overview ##
 * gaMapControl is a wrapper for a native map control
 * @param {string|@} mapControlName - The name of the control that is intended to be added to the map layer
 * ##mapControlName acceptable values##
 * The following values can be used as control name:
 * <<ul>
     <li>permalink:</li>
     <li>overviewmap:</li>
     <li>scale:</li>
     <li>scaleline:</li>
     <li>panzoombar:</li>
     <li>darwin.panzoombar:</li>
     <li>mouseposition:</li>
     <li>attribution:</li>
     <li>measureline:</li>
     <li>measurepolygon:</li>
     <li>wmsgetfeatureinfo:</li>
 </ul>
 * @param {string|@} mapControlId - A string value to be allocated to the control as its ID
 * @param {string|@} controlOptions - A string value that requests a setting to the specified control
 * @param {string|@=} containerElementId - The id of the layer that this control will be added to
 * @param {number|@=} controlEnabled - A boolean value ('true' or 'false') that toggles the control on/off

 * @scope
 * @restrict E
 * @require gaMap
 * @example
 <example module="simpleMap">
     <file name="index.html">
         <div id="map"></div>
         <ga-map map-element-id="map">
             <ga-map-layer layer-name="Simple map layer name" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS">
             </ga-map-layer>
                <ga-map-control map-control-name="mouseposition"></ga-map-control>
                <ga-map-control map-control-name="OverviewMap"></ga-map-control>
                <ga-map-control map-control-name="Permalink"></ga-map-control>
                <ga-map-control map-control-name="scale"></ga-map-control>
                <ga-map-control map-control-name="ScaleLine"></ga-map-control>
                <ga-map-control map-control-name="panzoombar"></ga-map-control>
                <ga-map-control map-control-name="measureline"></ga-map-control>
                <ga-map-control map-control-name="measurepolygon"></ga-map-control>
                <ga-map-control map-control-name="wmsgetfeatureinfo"></ga-map-control>
         </ga-map>
     </file>
     <file name="style.css">#map {width: 650px;height:600px;}</file>
     <file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
 </example>
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
            preOptionsLoaded: '&',
			controlEnabled: '@'
		},
		link: function (scope, element, attrs, mapController) {
			if (!scope.mapControlName) {
				return;
			}
            //Allow developers to manipulate options before loaded
            if(scope.preOptionsLoaded != null) {
                scope.controlOptions = scope.preOptionsLoaded({options: scope.controlOptions});
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