var angular = angular || {};
var jQuery = jQuery || {};
var console = console || {};

var app = angular.module('gawebtoolkit.config', []);
/**
 * @ngdoc directive
 * @name gawebtoolkit.config.directives:gaMapConfig
 * @description
 * ## Overview ##
 * gaMapConfig directive is used for loading a configuration file in JSON format and a "template" HTML file. These two will be used as our data and view layers.
 *  <p><span class="note">NOTE: </span>Follwing items should be considered when using gaMapConfig:</p>
 <ul>
     <li>'gawebtoolkit.config' must be referenced and loaded when creating our AngularJS application</li>
     <li>A controller should be created attached to our AngularJS application, this controller will trigger an event which injects our configuration (loaded in page in JSON format) to the scope as a JavaScript object</li>
     <li>By calling defined controller within our app element in HTML, all the configuration will be accessible. Controller can be called in the template file or in the main application's HMTL codes</li>
 </ul>
 * @param {string|@} gaConfigPath - A string value containing the path to our configuration JSON file 
 * @param {string|@} staticConfig - A boolean value ("true" or "false") that toggles using configuration/template files on/off
 * @param {string|@} templatePath - A string value containing the path to our HTML template file
 *
 *
 * @scope
 * @restrict E
 * @example
 <example module="simpleMapWithConfig">
     <file name="index.html">
         <div id="map"></div>
         <div ng-controller="ourConfigController">
         <ga-map-config ga-config-path="../docs-sources/ourConfigFile" template-path="../docs-sources/ourTemplate.html" static-config="true" class="ng-scope"></ga-map-config>
         </div>
     </file>
     <file name="style.css">
        #map {width: 650px;height:600px;}
        .note {color: red; font-weight: bold}
     </file>
     <file name="script.js">
         var app = angular.module('simpleMapWithConfig',['gawebtoolkit.core','gawebtoolkit.config']);
         app.controller('ourConfigController', function ($scope) { 
            $scope.$on('configDataLoaded', function(event,args){ 
                $scope.myConfig = args;
            }) 
         });
     </file>
     <file name="ourTemplate.html">
         <ga-map map-element-id="map" datum-projection="EPSG:102100" display-projection="EPSG:4326" center-position="{{myConfig.centrePosition}}" zoom-level="{{myConfig.zoomLevel}}">
             <ga-map-layer 
                 ng-repeat="baseLayer in myConfig.baseMaps" 
                 layer-name="{{baseLayer.name}}" 
                 layer-url="{{baseLayer.url}}"
                 wrap-date-line="{{baseLayer.wrapDateLine}}" 
                 map-bg-color="#{{baseLayer.mapBGColor}}" 
                 layer-type="{{baseLayer.mapType}}" 
                 is-base-layer="{{baseLayer.isBaseLayer}}" 
                 visibility="{{baseLayer.visibility}}" 
                 layer-attribution="{{baseLayer.attribution}}"
                 zoom-to-max="{{baseLayer.zoomToMax}}">
             </ga-map-layer>
             <ga-map-layer 
                 ng-repeat="Layer in myConfig.layerMaps" 
                 layer-name="{{Layer.name}}" 
                 layer-url="{{Layer.url}}"
                 layer-type="WMS"
                 zoom-to-max="true"
                 wrap-date-line="{{Layer.wrapDateLine}}" 
                 map-bg-color="#{{Layer.mapBGColor}}" 
                 layer-type="{{Layer.mapType}}" 
                 is-base-layer="{{Layer.isBaseLayer}}" 
                 visibility="{{Layer.visibility}}" 
                 layer-attribution="{{Layer.attribution}}">
             </ga-map-layer>
             <ga-map-control ng-repeat="control in myConfig.controls" map-control-name="{{control}}"></ga-map-control>
         </ga-map> 
     </file>
     <file name="ourConfigFile.json">
         {
         "title" : "Topography",
         "id": "map",
         "datumProjection":"EPSG:102100",
         "displayProjection": "EPSG:4326",
         "backgroundcolour": "#21468b",
         "centrePosition": {"lat":"3868551","lon":"-10403008"},
         "zoomLevel":3,
         "baseMaps": [
         {
         "isBaseLayer":true,
         "mapType":"WMS",
         "visibility":true,
         "name":"World Image",
         "url":"http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer",
         "mapBGColor":"194584",
         "opacity":1.0,
         "wrapDateLine":true,
         }
         ],
         "layerMaps": [
         {
         "isBaseLayer":false,
         "mapType":"WMS",
         "visibility":true,
         "name":"Australian Topography",
         "url":"http://services.nationalmap.gov/ArcGIS/services/US_Topo_Availability/MapServer/WMSServer",
         "mapBGColor":"194584",
         "opacity":1.0
         }
         ],
         "controls": [
         "mouseposition",
         "OverviewMap",
         "Permalink",
         "ScaleLine",
         "panzoombar"
         ]
         }
     </file>
 </example>
 */
app.directive('gaMapConfig', [ '$compile', '$http', '$q', '$interpolate', '$timeout', '$parse', '$log',
    function ($compile, $http, $q, $interpolate, $timeout, $parse, $log) {
        'use strict';
        return {
            restrict: "E",
            scope: true,
            controller: function ($scope, $element, $attrs, $http) {
                $scope.loadConfigData = function () {
                    //init properties
                    var configPath;
                    if ($attrs.gaConfigPath.indexOf('{{') !== -1) {
                        configPath = $scope.$eval($interpolate($attrs.gaConfigPath));
                    } else {
                        configPath = $attrs.gaConfigPath;
                    }

                    if ($attrs.staticConfig === 'true') {
                        configPath = configPath + '.json';
                    }
                    var processSuccessResponse = function (data) {
                        $log.info('config http request success');
                        if (data) {
                            $log.info('config http request data present');
                        }
                        if ($attrs.preConfig) {
                            var preConfigAssignmentFn = $parse($attrs.preConfig);
                            $scope.gaConfigTemp = preConfigAssignmentFn($scope, {
                                config: data
                            });
                        } else {
                            $scope.gaConfigTemp = data;
                        }

                        //$scope.configReady = true;
                        $scope.$emit('configDataLoaded', $scope.gaConfigTemp);
                        $scope.$broadcast('configDataLoaded', $scope.gaConfigTemp);

                        if ($attrs.postConfig) {
                            var postConfigAssignmentFn = $parse($attrs.postConfig);
                            postConfigAssignmentFn($scope, {
                                config: $scope.gaConfigTemp
                            });
                        }
                        //$scope.$emit('configReady', $scope.configReady);
                    };
                    //try to use provider method first to assign.
                    $log.info('config loading...');
                    var processErrorResponse = function (data, status, headers, config) {
                        $log.error('Failed to load config - ' + status);
                    };
                    //If it fails, to a get call using the provided path (if exists)
                    if (configPath.length > 0) {
                        $log.info('config http request starting');

                        $http({
                            method: 'GET',
                            url: configPath
                        }).success(processSuccessResponse).error(processErrorResponse);
                    }
                };
            },
            compile: function compile(element, attributes) {
                //load templateUrl provided and
                var linkMethodPromise;
                var linkMethod;
                if (attributes.templatePath != null) {
                    var deferred = $q.defer();
                    $http.get(attributes.templatePath).success(function (response) {
                        linkMethod = $compile(response);
                        deferred.resolve(linkMethod);
                    });
                    linkMethodPromise = deferred.promise;
                }

                return {
                    post: function postLink(scope, element, attributes) {

                    },
                    pre: function preLink(scope, element, attributes) {
                        linkMethodPromise.then(function (result) {
                            element.html(result(scope));
                            scope.loadConfigData();
                        });
                    }
                };
            }
        };
    }]);