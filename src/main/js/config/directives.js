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
         <geo-map-config ga-config-path="../docs-sources/ourConfigFile" template-path="../docs-sources/ourTemplate.html" static-config="true" class="ng-scope"></geo-map-config>
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
         <geo-map map-element-id="map" datum-projection="EPSG:102100" display-projection="EPSG:4326" center-position="{{myConfig.centrePosition}}" zoom-level="{{myConfig.zoomLevel}}">
             <geo-map-layer
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
             </geo-map-layer>
             <geo-map-layer
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
             </geo-map-layer>
             <geo-map-control ng-repeat="control in myConfig.controls" map-control-name="{{control}}"></geo-map-control>
         </geo-map>
     </file>
     <file name="ourConfigFile.json">
         {
         "title" : "Topography",
         "id": "map",
         "datumProjection":"EPSG:102100",
         "displayProjection": "EPSG:4326",
         "backgroundcolour": "#21468b",
         "centrePosition": [130, -25],
         "zoomLevel":3,
         "baseMaps": [
         {
            "mapType": "WMS",
            "visibility": true,
            "name": "World Image",
            "url": "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
			"layers": "World Bathymetry Image,Bathy Areas,Australian Landsat,Hillshade 3 second",
            "opacity": 1.0,
            "wrapDateLine": true,
			"maxZoomLevel" : 13,
            "attribution": "Geoscience Australia <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a> and Natural Earth <a target='_blank' href='http://www.naturalearthdata.com/about/'>Terms of Use</a>"
        }
         ],
         "layerMaps": [
         {
            "mapType":"ArcGISCache",
            "visibility":true,
            "name":"Australian Topography",
            "url":"http://www.ga.gov.au/gis/rest/services/topography/Australian_Topography_2014_WM/MapServer",
			"metadataText": "The Australian Topographic map service is seamless national dataset coverage for the whole of Australia. The map portrays detailed graphic representation of features that appear on the Earth's surface. These features include cultural, hydrography and relief themes.",
            "ogcLinks" : [
			{"description": "Service Metadata","url": "http://www.ga.gov.au/geoportal/catalog/search/resource/details.page?uuid=%7B8239E8C0-2D4F-49C2-9A86-159566568965%7D"},
			{"description": "REST","url": "http://www.ga.gov.au/gis/rest/services/topography/Australian_Topography_2014_WM/MapServer"},
			{"description": "WMS Capabilities","url": "http://www.ga.gov.au/gis/services/topography/Australian_Topography_2014_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS"},
			{"description": "ArcMap Layerfile","url": "http://www.ga.gov.au/gis/rest/services/topography/Australian_Topography_2014_WM/MapServer?f=lyr&v=9.3"}
			],
            "opacity":1.0,
            "layerTimeout": 5000
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
app.directive('geoMapConfig', [ '$compile', '$http', '$q', '$interpolate', '$timeout', '$parse', '$log',
    function ($compile, $http, $q, $interpolate, $timeout, $parse, $log) {
        'use strict';
        return {
            restrict: "E",
            scope: true,
            controller: ['$scope','$element','$attrs',function ($scope, $element, $attrs) {
                $scope.loadConfigData = function () {
                    //init properties
                    var configPath;
                    if($attrs.configValue != null) {
                        $scope.configLocal = true;
                    }
                    if($attrs.localStorageKey != null) {
                        $scope.fromLocalStorage = true;
                        $scope.localStorageKey = $attrs.localStorageKey;
                    }
                    if ($attrs.gaConfigPath != null && $attrs.gaConfigPath.indexOf('{{') !== -1) {
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
                    if (configPath != null && configPath.length > 0) {
                        //$log.info('config http request starting');
                        //$log.info(configPath);
                        $http({
                            method: 'GET',
                            url: configPath
                        }).success(processSuccessResponse).error(processErrorResponse);
                    }
                    //$log.info($scope.configLocal);
                    if($scope.configLocal) {
                        $timeout(function () {

                            processSuccessResponse($scope.$eval($attrs.configValue));
                        },1000);
                    }

                    if($scope.fromLocalStorage) {
                        $log.info('Loading config from local storage...');
                        $timeout(function () {
                            var data = window.localStorage.getItem($scope.localStorageKey);
                            processSuccessResponse(angular.copy(JSON.parse(data)));
                        },1000);
                    }
                };
            }],
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