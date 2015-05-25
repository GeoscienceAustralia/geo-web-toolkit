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
app.directive('gaMapConfig', [ '$compile', '$http', '$q', '$interpolate', '$timeout', '$parse', '$log',
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
            var modifiedControlOptions = scope.preOptionsLoaded({options: scope.controlOptions});
            scope.controlOptions = modifiedControlOptions === undefined ? scope.controlOptions : modifiedControlOptions;

            //scope.controlOptions = scope.controlOptions || {};
            //scope.controlOptions.mapOptions = mapController.getMapOptions();

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
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var jQuery = jQuery || {};

/**
 *  An object that represents a longitude and latitude position on the map in within the map instance projection.
 *  @typedef {Object} LonLat
 *  @property {Number} lat - Latitude value as a decimal
 *  @property {Number} lon - Longitude value as a decimal
 *
 *  Coordinates object of a geoJson object. This is an array of 2 value arrays representing
 *  lon, lat as [{Number},{Number}].
 *  @typedef {[][]} geoJsonCoordinates
 *
 *  Point geometry
 *  @typedef {Object} Point
 *  @property {Number} x - Value representing an X component of a point
 *  @property {Number} y - Value representing a Y component of a point
 *
 *  Layer
 *  @typedef {Object} Layer
 *  @property {string} id - A unique identifier
 *  @property {string} name - A display friendly name for the layer
 *  @property {string} type - A string indicating the type of layer, eg WMS
 *  @property {Boolean} visibility - A bool indicating if a layer is currently visible for not.
 *
 *  Distance
 *  @typedef {Object} Distance
 *  @property {Number} meansure - The number of units of distance
 *  @property {string} units - The unit type of the distance number, eg 'km'
 * */

angular.module('gawebtoolkit.core',
    [
        'gawebtoolkit.mapservices',
        'gawebtoolkit.core.map-directives',
        'gawebtoolkit.core.map-services',
        'gawebtoolkit.core.layer-directives',
        'gawebtoolkit.vendor-layers',
        'gawebtoolkit.core.layer-services',
        'gawebtoolkit.core.data-services',
        'gawebtoolkit.core.control-directives',
        'gawebtoolkit.core.feature-directives',
        'gawebtoolkit.core.marker-directives',
        'gawebtoolkit.core.map-config',
        'gawebtoolkit.utils'
    ]);
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.data-services', ['gawebtoolkit.mapservices']);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GADataService', ['$log', 'ga.config', 'dataServiceLocator',
    function ($log, GAConfig, dataServiceLocator) {
        'use strict';
        return {
            getLayersByWMSCapabilities: function (url, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(url);
            },
            getWMSFeatures: function (mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getWMSFeatures(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType);
            },
            getWMSFeaturesByLayerId: function (mapInstance, url, layerId, point, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(mapInstance, url, layerId, point);
            }
        };
    }]);

app.service('dataServiceLocator', ['$injector', function ($injector) {
    "use strict";
    var implementations = {
        'olv2': 'olv2DataService',
        'olv3': 'olv3DataService'
    };
    return {
        getImplementation: function (mapType) {
            return $injector.get(implementations[mapType]);
        }
    };
}]);
var angular = angular || {};

var app = angular.module('gawebtoolkit.core.feature-directives', [ 'gawebtoolkit.core.map-directives', 'gawebtoolkit.core.map-services',
    'gawebtoolkit.core.layer-services' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.feature-directives:gaFeatureLayer
 * @description
 * ## Overview ##
 * gaFeatureLayer adds layer to the page but only for WFS type of requests. For the other types <a href="#/api/gawebtoolkit.core.layer-directives:gaMapLayer">gaFeatureLayer</a> should be used. This tag should be placed within the gaMap tag.
 * @param {string|@} layerName - A name allocated to the layer for future reference
 * @param {string|@} url - A string value that defines the URL from which the content of the layer will be loaded
 * @param {function|@} postAddLayer -  Function callback fired after the layer is added
 * @param {string|@} controllerEmitEventName -  An string value that will be allocated to this layer as controller. This controller can be called in JS codes in order to control the layer programatically
 * @param {string|@} onLayerDestroy - Function callback fired on the destruction of a layer
 *  * Following functions are supported by this controller:
 * <ul>
     <li>hide</li>
     <li>show</li>
     <li>setOpacity</li>
     <li>getFeatures</li>
     <li>addFeature</li>
     <li>createFeatureAsync</li>
     <li>createFeature</li>
     <li>removeFeature</li>
     <li>isLayerControllerReady</li>
 </ul>
 *@param {string|@} visibility -  A boolean value ("true" or "false") that toggles the visibility of the layer on/off
 *
 * @requires gaMap
 * @scope
 * @restrict E
 * @example
<example module="simpleMapWithFeatureLayers">
    <file name="index.html">
        <div id="map"></div>
        <div ng-controller="featureExampleController">
            <ga-map map-element-id="map" datum-projection="EPSG:102100" display-projection="EPSG:4326" center-position='[130, -25]' zoom-level="4">
                <ga-map-layer layer-type="GoogleStreet" layer-name="Simple map layer name" is-base-layer="true">
                </ga-map-layer>
                <ga-feature-layer layer-name="My local geoJson features">
                    <ga-feature ng-repeat="feature in features" geo-json-feature="feature">
                    </ga-feature>
                </ga-feature-layer>
            </ga-map>
        </div>
    </file>
    <file name="style.css">#map {width: 650px;height:600px;}</file>
    <file name="script.js">
        var jsonValue = [];
        var app = angular.module('simpleMapWithFeatureLayers', ['gawebtoolkit.core']);
        app.controller('featureExampleController', ['$scope', function ($scope) {
        "use strict";
        $.ajax({type: "GET", url: "../docs-sources/geojson.json", async: false, complete: function(data){jsonValue = data.responseJSON;}});
        $scope.features = jsonValue;
        }]);
    </file>
    <file name="geojson.json">
[ { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.117919921875,
            -34.01519775390625
          ],
        "type" : "Point"
      },
    "id" : "F3__83776",
    "properties" : { "Authority" : "New South Wales",
        "Authority_ID" : "NSW",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "0",
        "Lat_seconds" : "54",
        "Latitude" : "-34.0152",
        "Long_degrees" : "151",
        "Long_minutes" : "7",
        "Long_seconds" : "4",
        "Longitude" : "151.11789999999999",
        "Map_100K" : "9129",
        "Name" : "Canberra Road Reserve",
        "NameU" : "CANBERRA ROAD RESERVE",
        "Place_ID" : "129655",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "O",
        "Status_desc" : "Official",
        "Variant_Name" : "Sylvania Oval"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.4390869140625,
            -34.58929443359375
          ],
        "type" : "Point"
      },
    "id" : "F3__167108",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "21",
        "Latitude" : "-34.589329999999997",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "20",
        "Longitude" : "118.43899999999999",
        "Map_100K" : "2528",
        "Name" : "Canberra West",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "212987",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.45330810546875,
            -34.1287841796875
          ],
        "type" : "Point"
      },
    "id" : "F3__167109",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "43",
        "Latitude" : "-34.128779999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4532",
        "Map_100K" : "2329",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212988",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1279296875,
            -33.8302001953125
          ],
        "type" : "Point"
      },
    "id" : "F3__167110",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "48",
        "Latitude" : "-33.830170000000003",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "117.1279",
        "Map_100K" : "2330",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212989",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1279296875,
            -35.2781982421875
          ],
        "type" : "Point"
      },
    "id" : "F3__176554",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "POPL",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "41",
        "Latitude" : "-35.278263000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "149.12784250000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "222433",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 150.15911865234375,
            -24.63409423828125
          ],
        "type" : "Point"
      },
    "id" : "F3__181742",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-24",
        "Lat_minutes" : "38",
        "Lat_seconds" : "2",
        "Latitude" : "-24.634091999999999",
        "Long_degrees" : "150",
        "Long_minutes" : "9",
        "Long_seconds" : "32",
        "Longitude" : "150.159075",
        "Map_100K" : "8948",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "227621",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.62530517578125,
            -38.388427734375
          ],
        "type" : "Point"
      },
    "id" : "F3__184153",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "18",
        "Latitude" : "-38.388455",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "30",
        "Longitude" : "142.62522100000001",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230032",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.6185302734375,
            -38.3870849609375
          ],
        "type" : "Point"
      },
    "id" : "F3__184288",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "13",
        "Latitude" : "-38.387099999999997",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "6",
        "Longitude" : "142.6185495",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230167",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.17633056640625,
            -35.2191162109375
          ],
        "type" : "Point"
      },
    "id" : "F3__192474",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "13",
        "Lat_seconds" : "8",
        "Latitude" : "-35.219115000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "10",
        "Long_seconds" : "34",
        "Longitude" : "149.17633799999999",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238353",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.34429931640625,
            -35.14599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__192508",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "8",
        "Lat_seconds" : "45",
        "Latitude" : "-35.146063499999997",
        "Long_degrees" : "149",
        "Long_minutes" : "20",
        "Long_seconds" : "39",
        "Longitude" : "149.34425400000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238387",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.43670654296875,
            -34.59130859375
          ],
        "type" : "Point"
      },
    "id" : "F3__194089",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "29",
        "Latitude" : "-34.591428999999998",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "12",
        "Longitude" : "118.436684",
        "Map_100K" : "2528",
        "Name" : "CANBERRA WEST",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "239968",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.453125,
            -34.131591796875
          ],
        "type" : "Point"
      },
    "id" : "F3__194873",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "53",
        "Latitude" : "-34.131582999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4530905",
        "Map_100K" : "2329",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240752",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1260986328125,
            -33.8306884765625
          ],
        "type" : "Point"
      },
    "id" : "F3__194924",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "50",
        "Latitude" : "-33.830748999999997",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "33",
        "Longitude" : "117.1259575",
        "Map_100K" : "2330",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240803",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 146.53692626953125,
            -34.7598876953125
          ],
        "type" : "Point"
      },
    "id" : "F3__201108",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "45",
        "Lat_seconds" : "35",
        "Latitude" : "-34.759879499999997",
        "Long_degrees" : "146",
        "Long_minutes" : "32",
        "Long_seconds" : "13",
        "Longitude" : "146.53694849999999",
        "Map_100K" : "8228",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "246987",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.32928466796875,
            -31.22540283203125
          ],
        "type" : "Point"
      },
    "id" : "F3__212605",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-31",
        "Lat_minutes" : "13",
        "Lat_seconds" : "31",
        "Latitude" : "-31.225390999999998",
        "Long_degrees" : "151",
        "Long_minutes" : "19",
        "Long_seconds" : "45",
        "Longitude" : "151.32918749999999",
        "Map_100K" : "9135",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "258484",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.4290771484375,
            -26.77587890625
          ],
        "type" : "Point"
      },
    "id" : "F3__220603",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-26",
        "Lat_minutes" : "46",
        "Lat_seconds" : "33",
        "Latitude" : "-26.775873000000001",
        "Long_degrees" : "148",
        "Long_minutes" : "25",
        "Long_seconds" : "44",
        "Longitude" : "148.42915450000001",
        "Map_100K" : "8544",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "266482",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1846923828125,
            -35.215087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221660",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "12",
        "Lat_seconds" : "54",
        "Latitude" : "-35.215110000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "4",
        "Longitude" : "149.18454",
        "Map_100K" : "8727",
        "Name" : "Canberra Park",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "267539",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.12188720703125,
            -35.29827880859375
          ],
        "type" : "Point"
      },
    "id" : "F3__221661",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298360000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "18",
        "Longitude" : "149.12191999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Nara Peace Park",
        "NameU" : "CANBERRA NARA PEACE PARK",
        "Place_ID" : "267540",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13330078125,
            -35.2891845703125
          ],
        "type" : "Point"
      },
    "id" : "F3__221662",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "X",
        "Classification" : "Administrative",
        "Concise_gaz" : "N",
        "Feature_code" : "DI",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "21",
        "Latitude" : "-35.289250000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13330999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Central",
        "NameU" : "CANBERRA CENTRAL",
        "Place_ID" : "267541",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.77569580078125,
            -35.48760986328125
          ],
        "type" : "Point"
      },
    "id" : "F3__221663",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "29",
        "Lat_seconds" : "15",
        "Latitude" : "-35.48771",
        "Long_degrees" : "148",
        "Long_minutes" : "46",
        "Long_seconds" : "32",
        "Longitude" : "148.77564000000001",
        "Map_100K" : "8627",
        "Name" : "Canberra Alpine Club",
        "NameU" : "CANBERRA ALPINE CLUB",
        "Place_ID" : "267542",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.19390869140625,
            -35.305908203125
          ],
        "type" : "Point"
      },
    "id" : "F3__221664",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "A",
        "Classification" : "Airfields",
        "Concise_gaz" : "N",
        "Feature_code" : "AF",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "18",
        "Lat_seconds" : "21",
        "Latitude" : "-35.305959999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "37",
        "Longitude" : "149.19388000000001",
        "Map_100K" : "8727",
        "Name" : "Canberra Airport",
        "NameU" : "CANBERRA AIRPORT",
        "Place_ID" : "267543",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.134521484375,
            -35.29840087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221665",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "URBN",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298439999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "8",
        "Long_seconds" : "4",
        "Longitude" : "149.13453999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "267544",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 141.15972900390625,
            -37.4951171875
          ],
        "type" : "Point"
      },
    "id" : "F3__251610",
    "properties" : { "Authority" : "Victoria",
        "Authority_ID" : "VIC",
        "CGDN" : "N",
        "Class_code" : "V",
        "Classification" : "Water Bodies",
        "Concise_gaz" : "N",
        "Feature_code" : "SWP",
        "Lat_degrees" : "-37",
        "Lat_minutes" : "29",
        "Lat_seconds" : "42",
        "Latitude" : "-37.495138900000001",
        "Long_degrees" : "141",
        "Long_minutes" : "9",
        "Long_seconds" : "34",
        "Longitude" : "141.15958330000001",
        "Map_100K" : "7123",
        "Name" : "CANBERRA SWAMP",
        "NameU" : "CANBERRA SWAMP",
        "Place_ID" : "297489",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13348388671875,
            -35.2833251953125
          ],
        "type" : "Point"
      },
    "id" : "F3__271252",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCB",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "59",
        "Latitude" : "-35.283332825000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13333129899999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "317131",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 145.13531494140625,
            -38.0736083984375
          ],
        "type" : "Point"
      },
    "id" : "F3__272183",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCU",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "4",
        "Lat_seconds" : "25",
        "Latitude" : "-38.073677351000001",
        "Long_degrees" : "145",
        "Long_minutes" : "8",
        "Long_seconds" : "6",
        "Longitude" : "145.13521848299999",
        "Map_100K" : "7921",
        "Name" : "Canberra Street",
        "NameU" : "CANBERRA STREET",
        "Place_ID" : "318062",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 137.597900390625,
            -35.85589599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__365723",
    "properties" : { "Authority" : "South Australia",
        "Authority_ID" : "SA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "51",
        "Lat_seconds" : "21",
        "Latitude" : "-35.855870000000003",
        "Long_degrees" : "137",
        "Long_minutes" : "35",
        "Long_seconds" : "52",
        "Longitude" : "137.59782999999999",
        "Map_100K" : "6426",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "411602",
        "State" : "South Australia",
        "State_ID" : "SA",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  }
]
    </file>
</example>
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
                visibility: '@',
                projection: '@',
                controllerEmitEventName: '@',
                postAddLayer: '&',
                onLayerDestroy: '&'
            },
            controller: ['$scope',function ($scope) {
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
            }],
            transclude: false,
            link: function ($scope, element, attrs, mapController) {
                $scope.mapAPI = {};
                $scope.mapAPI.mapController = mapController;

                var layerOptions = GALayerService.defaultLayerOptions(attrs, mapController.getFrameworkVersion());
                layerOptions.datumProjection = $scope.projection || mapController.getProjection();
                layerOptions.postAddLayer = $scope.postAddLayer;

                var layer = GALayerService.createFeatureLayer(layerOptions, mapController.getFrameworkVersion());
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
 * Wrapper for a native wfs layer<br>
 * <font color="red">NOTE: </font>This element should be placed within gsFeatureLayer directive
 * 
 * @param {string} vidibility - A boolean value in string format ("true" or "false") that toggles the feature layer on/off
 * @param {string} geoJsonFeature - A string value with the format of geoJson. This is one normaly part of the response of a WFS call
 * @param {string} inputFormat - TBA
 * @param {string} inLonLatOrderValid - TBA
 *
 * @requires gaFeatureLayer
 * @scope
 * @restrict E
 * @example
 * <example module="simpleMapWithFeatureLayers">
    <file name="index.html">
        <div ng-controller="featureExampleController">
            <button ng-click="changefeatures()" class="btn">Remove some feature layers</button>
            <div id="map"></div>
            <ga-map map-element-id="map" datum-projection="EPSG:102100" display-projection="EPSG:4326" center-position='[130, -25]' zoom-level="4">
                <ga-map-layer layer-type="GoogleStreet" layer-name="Simple map layer name" is-base-layer="true">
                </ga-map-layer>
                <ga-feature-layer layer-name="My local geoJson features">
                    <ga-feature ng-repeat="feature in features" geo-json-feature="feature">
                    </ga-feature>
                </ga-feature-layer>
            </ga-map>
        </div>
    </file>
    <file name="style.css">
        #map {width: 650px;height:600px;}
        .btn {
            padding: 7px 10px;
            background-color: #e3e3e3;
            border: 1px solid #333;
            margin-bottom: 1px;
            margin-left: 0;
            font-size: 10pt !important;
        }
    </file>
    <file name="script.js">
        var jsonValue = [];
        var app = angular.module('simpleMapWithFeatureLayers', ['gawebtoolkit.core']);
        app.controller('featureExampleController', ['$scope', function ($scope) {
        "use strict";
        $.ajax({type: "GET", url: "../docs-sources/geojson.json", async: false, complete: function(data){jsonValue = data.responseJSON;}});
        $scope.features = jsonValue;
        $scope.changefeatures = function() {
            $scope.features = $scope.features.slice(2);
        };
        }]);
    </file>
    <file name="geojson.json">
[ { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.117919921875,
            -34.01519775390625
          ],
        "type" : "Point"
      },
    "id" : "F3__83776",
    "properties" : { "Authority" : "New South Wales",
        "Authority_ID" : "NSW",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "0",
        "Lat_seconds" : "54",
        "Latitude" : "-34.0152",
        "Long_degrees" : "151",
        "Long_minutes" : "7",
        "Long_seconds" : "4",
        "Longitude" : "151.11789999999999",
        "Map_100K" : "9129",
        "Name" : "Canberra Road Reserve",
        "NameU" : "CANBERRA ROAD RESERVE",
        "Place_ID" : "129655",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "O",
        "Status_desc" : "Official",
        "Variant_Name" : "Sylvania Oval"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.4390869140625,
            -34.58929443359375
          ],
        "type" : "Point"
      },
    "id" : "F3__167108",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "21",
        "Latitude" : "-34.589329999999997",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "20",
        "Longitude" : "118.43899999999999",
        "Map_100K" : "2528",
        "Name" : "Canberra West",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "212987",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.45330810546875,
            -34.1287841796875
          ],
        "type" : "Point"
      },
    "id" : "F3__167109",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "43",
        "Latitude" : "-34.128779999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4532",
        "Map_100K" : "2329",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212988",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1279296875,
            -33.8302001953125
          ],
        "type" : "Point"
      },
    "id" : "F3__167110",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "48",
        "Latitude" : "-33.830170000000003",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "117.1279",
        "Map_100K" : "2330",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212989",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1279296875,
            -35.2781982421875
          ],
        "type" : "Point"
      },
    "id" : "F3__176554",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "POPL",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "41",
        "Latitude" : "-35.278263000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "149.12784250000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "222433",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 150.15911865234375,
            -24.63409423828125
          ],
        "type" : "Point"
      },
    "id" : "F3__181742",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-24",
        "Lat_minutes" : "38",
        "Lat_seconds" : "2",
        "Latitude" : "-24.634091999999999",
        "Long_degrees" : "150",
        "Long_minutes" : "9",
        "Long_seconds" : "32",
        "Longitude" : "150.159075",
        "Map_100K" : "8948",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "227621",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.62530517578125,
            -38.388427734375
          ],
        "type" : "Point"
      },
    "id" : "F3__184153",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "18",
        "Latitude" : "-38.388455",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "30",
        "Longitude" : "142.62522100000001",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230032",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.6185302734375,
            -38.3870849609375
          ],
        "type" : "Point"
      },
    "id" : "F3__184288",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "13",
        "Latitude" : "-38.387099999999997",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "6",
        "Longitude" : "142.6185495",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230167",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.17633056640625,
            -35.2191162109375
          ],
        "type" : "Point"
      },
    "id" : "F3__192474",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "13",
        "Lat_seconds" : "8",
        "Latitude" : "-35.219115000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "10",
        "Long_seconds" : "34",
        "Longitude" : "149.17633799999999",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238353",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.34429931640625,
            -35.14599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__192508",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "8",
        "Lat_seconds" : "45",
        "Latitude" : "-35.146063499999997",
        "Long_degrees" : "149",
        "Long_minutes" : "20",
        "Long_seconds" : "39",
        "Longitude" : "149.34425400000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238387",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.43670654296875,
            -34.59130859375
          ],
        "type" : "Point"
      },
    "id" : "F3__194089",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "29",
        "Latitude" : "-34.591428999999998",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "12",
        "Longitude" : "118.436684",
        "Map_100K" : "2528",
        "Name" : "CANBERRA WEST",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "239968",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.453125,
            -34.131591796875
          ],
        "type" : "Point"
      },
    "id" : "F3__194873",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "53",
        "Latitude" : "-34.131582999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4530905",
        "Map_100K" : "2329",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240752",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1260986328125,
            -33.8306884765625
          ],
        "type" : "Point"
      },
    "id" : "F3__194924",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "50",
        "Latitude" : "-33.830748999999997",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "33",
        "Longitude" : "117.1259575",
        "Map_100K" : "2330",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240803",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 146.53692626953125,
            -34.7598876953125
          ],
        "type" : "Point"
      },
    "id" : "F3__201108",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "45",
        "Lat_seconds" : "35",
        "Latitude" : "-34.759879499999997",
        "Long_degrees" : "146",
        "Long_minutes" : "32",
        "Long_seconds" : "13",
        "Longitude" : "146.53694849999999",
        "Map_100K" : "8228",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "246987",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.32928466796875,
            -31.22540283203125
          ],
        "type" : "Point"
      },
    "id" : "F3__212605",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-31",
        "Lat_minutes" : "13",
        "Lat_seconds" : "31",
        "Latitude" : "-31.225390999999998",
        "Long_degrees" : "151",
        "Long_minutes" : "19",
        "Long_seconds" : "45",
        "Longitude" : "151.32918749999999",
        "Map_100K" : "9135",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "258484",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.4290771484375,
            -26.77587890625
          ],
        "type" : "Point"
      },
    "id" : "F3__220603",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-26",
        "Lat_minutes" : "46",
        "Lat_seconds" : "33",
        "Latitude" : "-26.775873000000001",
        "Long_degrees" : "148",
        "Long_minutes" : "25",
        "Long_seconds" : "44",
        "Longitude" : "148.42915450000001",
        "Map_100K" : "8544",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "266482",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1846923828125,
            -35.215087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221660",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "12",
        "Lat_seconds" : "54",
        "Latitude" : "-35.215110000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "4",
        "Longitude" : "149.18454",
        "Map_100K" : "8727",
        "Name" : "Canberra Park",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "267539",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.12188720703125,
            -35.29827880859375
          ],
        "type" : "Point"
      },
    "id" : "F3__221661",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298360000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "18",
        "Longitude" : "149.12191999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Nara Peace Park",
        "NameU" : "CANBERRA NARA PEACE PARK",
        "Place_ID" : "267540",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13330078125,
            -35.2891845703125
          ],
        "type" : "Point"
      },
    "id" : "F3__221662",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "X",
        "Classification" : "Administrative",
        "Concise_gaz" : "N",
        "Feature_code" : "DI",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "21",
        "Latitude" : "-35.289250000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13330999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Central",
        "NameU" : "CANBERRA CENTRAL",
        "Place_ID" : "267541",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.77569580078125,
            -35.48760986328125
          ],
        "type" : "Point"
      },
    "id" : "F3__221663",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "29",
        "Lat_seconds" : "15",
        "Latitude" : "-35.48771",
        "Long_degrees" : "148",
        "Long_minutes" : "46",
        "Long_seconds" : "32",
        "Longitude" : "148.77564000000001",
        "Map_100K" : "8627",
        "Name" : "Canberra Alpine Club",
        "NameU" : "CANBERRA ALPINE CLUB",
        "Place_ID" : "267542",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.19390869140625,
            -35.305908203125
          ],
        "type" : "Point"
      },
    "id" : "F3__221664",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "A",
        "Classification" : "Airfields",
        "Concise_gaz" : "N",
        "Feature_code" : "AF",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "18",
        "Lat_seconds" : "21",
        "Latitude" : "-35.305959999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "37",
        "Longitude" : "149.19388000000001",
        "Map_100K" : "8727",
        "Name" : "Canberra Airport",
        "NameU" : "CANBERRA AIRPORT",
        "Place_ID" : "267543",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.134521484375,
            -35.29840087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221665",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "URBN",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298439999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "8",
        "Long_seconds" : "4",
        "Longitude" : "149.13453999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "267544",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 141.15972900390625,
            -37.4951171875
          ],
        "type" : "Point"
      },
    "id" : "F3__251610",
    "properties" : { "Authority" : "Victoria",
        "Authority_ID" : "VIC",
        "CGDN" : "N",
        "Class_code" : "V",
        "Classification" : "Water Bodies",
        "Concise_gaz" : "N",
        "Feature_code" : "SWP",
        "Lat_degrees" : "-37",
        "Lat_minutes" : "29",
        "Lat_seconds" : "42",
        "Latitude" : "-37.495138900000001",
        "Long_degrees" : "141",
        "Long_minutes" : "9",
        "Long_seconds" : "34",
        "Longitude" : "141.15958330000001",
        "Map_100K" : "7123",
        "Name" : "CANBERRA SWAMP",
        "NameU" : "CANBERRA SWAMP",
        "Place_ID" : "297489",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13348388671875,
            -35.2833251953125
          ],
        "type" : "Point"
      },
    "id" : "F3__271252",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCB",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "59",
        "Latitude" : "-35.283332825000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13333129899999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "317131",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 145.13531494140625,
            -38.0736083984375
          ],
        "type" : "Point"
      },
    "id" : "F3__272183",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCU",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "4",
        "Lat_seconds" : "25",
        "Latitude" : "-38.073677351000001",
        "Long_degrees" : "145",
        "Long_minutes" : "8",
        "Long_seconds" : "6",
        "Longitude" : "145.13521848299999",
        "Map_100K" : "7921",
        "Name" : "Canberra Street",
        "NameU" : "CANBERRA STREET",
        "Place_ID" : "318062",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 137.597900390625,
            -35.85589599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__365723",
    "properties" : { "Authority" : "South Australia",
        "Authority_ID" : "SA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "51",
        "Lat_seconds" : "21",
        "Latitude" : "-35.855870000000003",
        "Long_degrees" : "137",
        "Long_minutes" : "35",
        "Long_seconds" : "52",
        "Longitude" : "137.59782999999999",
        "Map_100K" : "6426",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "411602",
        "State" : "South Australia",
        "State_ID" : "SA",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  }
]    </file>
</example>
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
                    if ($scope.featureDto != null && $scope.featureDto.id.length > 0) {
                        featureLayerController.removeFeature($scope.featureDto.id);
                    }
                    initialCreate = false;
                    var feature = featureLayerController.createFeature($scope.geoJsonFeature);
                    featureLayerController.addFeature(feature).then(function (resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }

                if (newVal && initialCreate) {
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
                if ($scope.geoJsonFeatureWatch != null) {
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
var angular = angular || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.layer-directives', [ 'gawebtoolkit.core.map-directives', 'gawebtoolkit.core.layer-services',
	'gawebtoolkit.core.map-services' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.layer-directives:gaMapLayer
 * @description
 * ## Overview ##
 * gaMapLayer adds layer to the page. This tag should be placed within the gaMap tag
 * @param {string|@} layerAttribution - The id of the element where the map is to be rendered
 * @param {string|@} layerName - A name allocated to the layer for future reference
 * @param {string|@} layerUrl - A string value that defines the URL from which the content of the layer will be loaded.
 * @param {string|@=} layers - A comma separated value that tells the remote server which layers of data should is requested form the server. This will be used to make the right request form the remote server that is defined by layerUrl.
 * @param {number|@=} layerType - The type of the data that is being load on the layer.
 * Following types are supported:
 * <ul>
     <li>WMS</li>
     <li>arcgiscache</li>
     <li>xyzfilecache</li>
 </ul>
 * <font color="red">Note:</font> This directive does not support WFS type. In order to request for WFS type <a href="#/api/gawebtoolkit.core.feature-directives:gaFeatureLayer">gaFeatureLayer</a> should be used.
 * @param {string|@} wrapDateLine - A boolean value ('true', 'false') which defines the map in the layer should be wrapped or not. If wrapped then the map will be unlimited scrollable.
 *@param {string|@} visibility -  A boolean value ('true', 'false') for toggling layer on/off 
 *@param {string|@} isBaseLayer -  A boolean value ('true', 'false') telling the server if this layer is base layer or not 
 *@param {string|@} controllerEmitEventName -  A string value that allocates an AngularJS controller to this layer to be used in JavaScript codes. This will be used in cases that the layer should be controllable with JS codes.
 * Following functions are supported by this controller:
 * <ul>
     <li>hide</li>
     <li>show</li>
     <li>setOpacity</li>
 </ul>
 *
 * @reqires gaMap
 * @scope
 * @restrict E
 * @example
<example module="simpleMap">
<file name="index.html">
    <div id="map"></div>
    <ga-map map-element-id="map" center-position='[130, -25]' zoom-level="3">
        <ga-map-layer layer-name="baseLayer" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS"></ga-map-layer>
        
        <ga-map-layer layer-name="Topographic" layer-url="http://services.nationalmap.gov/ArcGIS/services/US_Topo_Availability/MapServer/WMSServer" map-bg-color="#194584" is-base-layer="false" layer-type="WMS"></ga-map-layer>
    </ga-map>
</file>
<file name="style.css">#map {width: 650px;height:600px;}</file>
<file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
</example>
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
                opacity: '@',
				controllerEmitEventName: '@',
				refreshLayer: '@',
				maxZoomLevel: '@',
                minZoomLevel: '@',
                onError:'&',
                format:'@'
			},
			transclude: false,
			controller: ['$scope',function ($scope) {


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
			}],
			link: function ($scope, element, attrs, mapController) {
                $scope.framework = mapController.getFrameworkVersion();
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
					layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                    layerOptions.initialExtent = mapController.getInitialExtent();
                    layerOptions.mapElementId = mapController.getMapElementId();
                    layerOptions.format = $scope.format;
					$log.info(layerOptions.layerName + ' - constructing...');
					if(layerOptions.layerType.length === 0) {
						return;
					}

                    layer = GALayerService.createLayer(layerOptions,$scope.framework);
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
//                    $timeout(function () {
//                        mapController.asyncLayerLoaded();
//                    });
				};

				attrs.$observe('visibility', function () {
					if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
						mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true");
					}
				});
                attrs.$observe('opacity', function () {
                    if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                        //$log.info('layer - ' + $scope.layerDto.name + ' - opacity changed - ' + $scope.opacity);
                        mapController.setOpacity($scope.layerDto.id, $scope.opacity);
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
						mapController.removeLayerById($scope.layerDto.id);
						$scope.layerDto = null;
						initialiseDefaults();
						layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                        layerOptions.initialExtent = mapController.getInitialExtent();
                        layerOptions.format = $scope.format;
						layer = GALayerService.createLayer(layerOptions,$scope.framework);
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

                if(attrs.refreshLayer == null && $scope.layerType != null && $scope.layerType.length > 0) {
                    $scope.initialiseLayer();
                }
			}
		};
	} ]);
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.layer-services', ['gawebtoolkit.mapservices']);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GALayerService', ['ga.config', 'mapLayerServiceLocator', function (GAConfig, mapLayerServiceLocator) {
    'use strict';
    return {
        createLayer: function (args, version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createLayer(args);
        },
        createFeatureLayer: function (args,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createFeatureLayer(args);
        },
        createGoogleLayer: function (args, version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createGoogleLayer(args);
        },
        createBingLayer: function (args, version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createBingLayer(args);
        },
        createOsmLayer: function (args, version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createOsmLayer(args);
        },
        removeLayerByName: function (mapInstance, layerName,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.removeLayerByName(mapInstance, layerName);
        },
        removeLayersByName: function (mapInstance, layerName, version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.removeLayersByName(mapInstance, layerName);
        },
        removeLayer: function (mapInstance, layerInstance,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.removeLayer(mapInstance, layerInstance);
        },
        removeLayerById: function (mapInstance, layerId,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.removeLayerById(mapInstance, layerId);
        },
        getMarkerCountForLayerName: function (mapInstance, layerName,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.getMarkerCountForLayerName(mapInstance, layerName);
        },
        registerFeatureSelected: function (mapInstance, layerId, callback, element,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.registerFeatureSelected(mapInstance, layerId, callback, element);
        },
        defaultLayerOptions: function (attrs,version) {
            //TODO if we are support multiple map types, eg google/openlayers/leaflets
            //this method should abstract the need to know what map type the instance is.
            //For now it is current assumed it's openlayers Release 2.13.1
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.defaultLayerOptions(attrs, new GAConfig());
        },
        createFeature: function (mapInstance, geoJson,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.createFeature(mapInstance, geoJson);
        },
		cleanupLayer:function (mapInstance, layerId,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
			return service.cleanupLayer(mapInstance, layerId);
		},
        registerLayerEvent: function (mapInstance, layerId, eventName, callback,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.registerLayerEvent(mapInstance, layerId, eventName, callback);
        },
        unRegisterMapEvent: function (mapInstance, layerId, eventName, callback,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.unRegisterMapEvent(mapInstance, layerId, eventName, callback);
        },
        addFeatureToLayer: function (mapInstance, layerId, feature,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.addFeatureToLayer(mapInstance, layerId, feature);
        },
        parselatLong: function (latlong) {
            if (!latlong) {
                return null;
            }
            var coords, centerPosition;
            coords = latlong.split(',');
            centerPosition = {lat: "", lon: ""};

            centerPosition.lat = coords[0];
            centerPosition.lon = coords[1];

            return centerPosition;
        },
        filterFeatureLayer: function (mapInstance, layerId, filterValue, featureAttributes,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            service.filterFeatureLayer(mapInstance, layerId, filterValue, featureAttributes);
        },
        getLayerFeatures: function (mapInstance, layerId,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.getLayerFeatures(mapInstance, layerId);
        },
        removeFeatureFromLayer: function (mapInstance, layerId, featureId,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.removeFeatureFromLayer(mapInstance, layerId, featureId);
        },
        raiseLayerDrawOrder: function (mapInstance, layerId, delta,version) {
            var useVersion = version || 'olv2';
            var service = mapLayerServiceLocator.getImplementation(useVersion);
            return service.raiseLayerDrawOrder(mapInstance, layerId, delta);
        }
    };
}]);

app.service('mapLayerServiceLocator', ['$injector', function ($injector) {
    "use strict";
    var implementations = {
        'olv2': 'olv2LayerService',
        'olv3': 'olv3LayerService'
    };
    return {
        getImplementation: function (mapType) {
            return $injector.get(implementations[mapType]);
        }
    };
}]);
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var app = angular.module('gawebtoolkit.core.map-config', []);

app.value('ga.config', function () {
    'use strict';
    //TODO These values are all OLV2 specific and these values should come from consuming application
    //to merge with defaults written for a specific implementation (like OLV2) in map services.
    var defaults = {
        standardTileSize: 256,
        largeTileSize: 1024,
        veryLargeTileSize: 2048,
        minMapWidth: 900,
        minMapHeight: 600,
        panIncrement: 30,
        smallPanIncrement: 5,
        transitionEffect: 'resize',
        visibility: true,
        isBaseLayer: false,
        wrapDateLine: true,
        sphericalMercator: true,
        bingLayerType: 'Road',
        opacity: 1.0,
        layerAttribution: '',
        displayInLayerSwitcher: true,
        projection: 'EPSG:102100',
        displayProjection: 'EPSG:4326',
        numZoomLevels: 15,
        transparent: true,
        format: 'image/png',
        tileSize: function (tileType) {
            var result;
            if (tileType) {
                if (tileType === 'large') {
                    result = new OpenLayers.Size(defaults.largeTileSize, defaults.largeTileSize);
                } else if (tileType === 'vlarge') {
                    result = new OpenLayers.Size(defaults.veryLargeTileSize, defaults.veryLargeTileSize);
                }
            } else {
                result = new OpenLayers.Size(defaults.standardTileSize, defaults.standardTileSize);
            }
            return result;
        },
        layerType: 'WMS'
    };
    return {
        //Backwards compatibility
        defaultOptions: defaults,
        olv2Options: defaults,
        cesiumOptions: {
            includeCustomTerrainProvider: false,
            customTerrainProviderUrl: null
        },
        olv3Options: {
            renderer: 'canvas'
        }
    };
});
var angular = angular || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.core.map-directives', [ 'gawebtoolkit.core.map-services', 'gawebtoolkit.core.layer-services' ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.core.map-directives:gaMap
 * @description
 * ## Overview ##
 * gaMap directive is used to create a map.
 * @param {string|@} mapElementId - The id of the element where the map is to be rendered
 * @param {string|@} datumProjection - A value representing the Datum Projection, eg 'EPSG:4326'
 * @param {string|@} displayProjection - A value representing the Display Projection, eg 'EPSG:4326'
 * @param {string|@=} centerPosition - A lat/lon value in the form of an array, eg [-55,110].
 * @param {number|@=} zoomLevel - An initial zoom value for the map to start at.
 * @param {geoJsonCoordinates|==} initialExtent - An initial extent is the form of a geoJson array of coordinates.
 * @param {string|@} framework - Optional. Default 'olv2'. Specifies which underlying mapping framework to use.
 * @param {bool|@} isStaticMap - Optional. Default to false. Creates the map without navigation/interaction controls.
 * @method addLayer - Adds a layer programmatically
 *
 * @scope
 * @restrict E
 * @example
<example module="simpleMap">
<file name="index.html">
        <div id="map"></div>
        <ga-map map-element-id="map">
            <ga-map-layer layer-name="Simple map layer name"  layer-type="WMS" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true">
                </ga-map-layer>
            <ga-map-control map-control-name="mouseposition"></ga-map-control>
        </ga-map>
</file>
<file name="style.css">#map {width: 650px;height:600px;}</file>
<file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
</example>
 */
app.directive('gaMap', [ '$timeout', '$compile', 'GAMapService', 'GALayerService','GADataService', '$q','$log',
	function ($timeout, $compile, GAMapService, GALayerService,GADataService, $q, $log) {
    'use strict';
    return {
        restrict: "E",
        scope: {
            mapElementId: '@',
            datumProjection: '@',
            displayProjection: '@',
            centerPosition: '@',
            zoomLevel: '@',
            isStaticMap:'@',
			initialExtent: '=',
            framework:'@'
        },
        controller: ['$scope',function ($scope) {
			$log.info('map creation started...');
            $('#' + $scope.mapElementId).empty();
            //$scope.asyncLayersDeferred = $q.defer();
            //$scope.waitingForNumberOfLayers = 0;
            $scope.initialPositionSet = false;

            //var waiting = false;
//            var waitForLayersWatch = $scope.$watch('waitingForNumberOfLayers', function (val) {
//                $log.info('layers remaining - ' + val);
//                if (waiting && val === 0) {
//					$scope.asyncLayersDeferred.resolve();
//                    waitForLayersWatch();
//                }
//                if (val > 0) {
//                    waiting = true;
//                }
//            });
            $scope.layerPromises = [];
            $scope.layerDtoPromises = [];
            //TODO Auto fix layer orders to match DOM of ga-map.
            function orderLayers() {
                var domLayers = $('ga-map-layer,ga-feature-layer,ga-marker-layer');
                var allLayers = self.getLayers();
                var relativeLayerIndex = 0;
                for (var i = 0; i < domLayers.length; i++) {
                    var el = domLayers[i];

                    var elementScope = $(el).isolateScope();
                    var elementLayerId = elementScope.layerDto != null ? elementScope.layerDto.id : null;
                    if(elementLayerId != null) {
                        for (var j = 0; j < allLayers.length; j++) {
                            var currentLayer = allLayers[j];
                            if(currentLayer.id === elementLayerId) {
                                if(relativeLayerIndex !== j) {
                                    //raise/lower layer to correct order
//                                    self.raiseLayerDrawOrder(currentLayer.id,relativeLayerIndex - j);
                                }
                            }
                        }
                        relativeLayerIndex++;
                    }
                }
            }
            var self = this;
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#addLayer
             * @description
             * Adds a layer to the underlying mapInstance calling the appropriate implementation specific service.
             * @param {*} layer - An implementation object for a layer, eg an olv2 layer object
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {Layer} - layer object representing implementation.
             * @example
             * <code><pre>
             *     var args {
             *      layerName: 'foo',
             *      layerUrl: 'http://wmsserver/wmsaddress',
             *		layers: 'comma, separated, list of, layers',
             *		layerType: 'WMS'
             * }
             * var layer = $scope.mapController.createLayer(args);
             * var dto = $scope.mapController.addLayer(layer);</pre></code>
             * */
            self.addLayer = function (layer) {
                var deferredAll = $q.defer();
                var deferredLayer = $q.defer();
				if(layer.then !== null && typeof layer.then === 'function') {
                    deferredAll = layer;
					if ($scope.layersReady) {
                        layer.then(function (resultLayer) {
                            if(resultLayer == null) {
                                //Failed to load, skip
                                //Lower layer throws error with data
                                $log.info("failed to load layer");
                            } else {
                                var layerDto = GAMapService.addLayer($scope.mapInstance, resultLayer, $scope.framework);
                                deferredLayer.resolve(layerDto);
                                orderLayers();
                                $scope.$emit('layerAdded', layerDto);
                            }
						});
					} else {
						$scope.layerPromises.push(deferredAll);
                        $scope.layerDtoPromises.push(deferredLayer);
					}
				}else {
					if ($scope.layersReady) {
						//$log.info(layer);
						var layerDto = GAMapService.addLayer($scope.mapInstance, layer, $scope.framework);
                        deferredLayer.resolve(layerDto);
                        orderLayers();
						$scope.$emit('layerAdded', layerDto);
					} else {
						$scope.layerPromises.push(deferredAll.promise);
                        $scope.layerDtoPromises.push(deferredLayer);
                        //Wait for digest
                        deferredAll.resolve(layer);
					}
				}
                return deferredLayer.promise;
            };

            self.getMapOptions = function () {
                return  {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
            };

            self.createLayer = function(layerArgs) {
                var layerOptions = GALayerService.defaultLayerOptions(layerArgs,$scope.framework);
                return GALayerService.createLayer(layerOptions,$scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomToMaxExtent
             * @description
             * Zooms to the maximum extent of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @example
             * <example module="zoomToMax">
             * <file name="zoomToMax.html">
             * <div ng-controller="zoomToMax">
             * <a class="btn btn-primary" ng-click="mapController.zoomToMaxExtent()">Zoom to Max</a>
             * <div id="zoomToMax"></div>
             * <ga-map map-element-id="zoomToMax" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="zoomToMaxJS.js">
             * angular.module("zoomToMax",['gawebtoolkit.core'])
             * .controller("zoomToMax", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * })
             * }]);
             * </file>
             * <file name="zooToMax.css">
             * #zoomToMax {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.zoomToMaxExtent = function () {
                GAMapService.zoomToMaxExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#currentZoomLevel
             * @description
             * Gets the current zoom level of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {Number} - Zoom level.
             * @example
             * <example module="currentZoomLevel">
             * <file name="currentZoomLevel.html">
             * <div ng-controller="currentZoomLevel">
             * <a class="btn btn-primary" ng-click="currentZoomLevel = mapController.currentZoomLevel()">Get the current zoom level : <span ng-model="currentZoomLevel" class="bg-primary">{{currentZoomLevel}}</span></a>
             * <div id="currentZoomLevel"></div>
             * <ga-map map-element-id="currentZoomLevel" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="currentZoomLevel.js">
             * angular.module("currentZoomLevel",['gawebtoolkit.core'])
             * .controller("currentZoomLevel", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * })
             * }]);
             * </file>
             * <file name="currentZoomLevel.css">
             * #currentZoomLevel {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.currentZoomLevel = function () {
                return GAMapService.currentZoomLevel($scope.mapInstance, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapMouseMove
             * @description
             * Registers a mouse movement event and calls provided callback.
             * Event details coming back will be implementation specific
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {function} callback - callback function that fires when the mouse move event occurs.
             * @example
             * <example module="mapMouseMove">
             * <file name="mapMouseMove.html">
             * <div ng-controller="ourMapController">
                <div id="toolbar">
                    <a class="btn btn-primary" ng-click="toggleMouseMoveRegistration($event)">{{registerMouseMapMoveButton}}</a>
                    <span class="alert alert-danger messagebox">
                        {{mouseMoveStatus}}</span>
                </div>

                <div id="mapMouseMove"></div>
                <ga-map
                    map-element-id="mapMouseMove"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='[130, -25]'
                zoom-level="4">
                <ga-map-layer
                    layer-name="Overview World Screen"
                    layer-type="GoogleStreet"
                    is-base-layer="true">
                </ga-map-layer>
                <ga-map-layer
                    layer-name="Topographic" 
                    layer-type="WMS"
                    layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                    is-base-layer="false"
                    layers="hazardContours"
                    background-color="#ffffff">
                </ga-map-layer>
            </ga-map>
            </div>
             * </div>
             * </file>
             * <file name="mapMouseMove.js">
             * var app = angular.module('mapMouseMove', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.registerMouseMapMoveButton = "Register mouse move"
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseMoveStatus = "mouseMoveStatus";
                        $scope.toggleMouseMoveRegistration = function(e) {
                            $scope.mouseMoveRegistered = true;
                            $scope.mapController.registerMapMouseMove(function() {
                                $scope.mouseMoveStatus = "Mouse moving";
                                $scope.$apply();
                            });
                            angular.element(e.target).attr("disabled", true);
                        };
                    });
                }]);
             * </file>
             * <file name="ourMapController.css">
             *  #mapMouseMove {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.registerMapMouseMove = function (callback) {
                GAMapService.registerMapMouseMove($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapMouseMoveEnd
             * @description
             * Registers an event callback with mapInstance when the mouse stops moving over the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {function} callback - callback function that fires when the mouse move end event occurs.
             * @example
             * <example module="mapMouseMoveEnd">
             * <file name="mapMouseMoveEnd.html">
             * <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="toggleMouseMoveRegistration($event)">Enable mouse move end track</a>
                        <span class="alert alert-danger messagebox">
                            {{registrationStatus + " | " + mouseMoveStatus}}</span>
                    </div>

                    <div id="mapMouseMoveEnd"></div>
                    <ga-map
                        map-element-id="mapMouseMoveEnd"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='[130, -25]'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>

             * </file>
             * 
             * <file name="mapMouseMoveEnd.js">
             * var app = angular.module('mapMouseMoveEnd', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.registrationStatus = "Click on the button";
                        $scope.mouseMoveStatus = "mouseMoveStatus";
                        $scope.toggleMouseMoveRegistration = function(e) {
                            $scope.registrationStatus = "Click and drag the map";
                            $scope.mapController.registerMapMouseMoveEnd(function() {
                                $scope.mouseMoveStatus = "Mouse move end";
                                setTimeout(function () {
                                    $scope.mouseMoveStatus = "mouseMoveStatus";
                                    $scope.$apply();
                                }, 1000);
                                $scope.$apply();
                            });
                            angular.element(e.target).attr("disabled", true);
                        };
                    });
                }]);
             * </file>
             * 
             * <file name="mapMouseMoveEnd.css">
             *  #mapMouseMoveEnd {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }

             * </file>
             * 
             * </example>
             * */
            self.registerMapMouseMoveEnd = function (callback) {
                GAMapService.registerMapMouseMoveEnd($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#registerMapClick
             * @description
             * Registers an event that will fire when the rendered map is clicked.
             * Event details coming back will be implementation specific
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {function} callback - callback function that fires when the map is clicked.
             * @example
             * <example module="mouseMapClick">
             * <file name="mouseMapClick.html">
             * <div ng-controller="ourMapController">
             *      <div id="toolbar">
                        <a class="btn btn-primary" ng-click="toggleMouseClickRegistration($event)">{{mouseMapClickButton}}</a>
                        <span class="alert alert-danger messagebox">
                            {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                    </div>
            
                    <div id="mouseMapClick"></div>
                    <ga-map
                        map-element-id="mouseMapClick"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='[130, -25]'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
             * </div>
             * </file>
             * <file name="mouseMapClick.js">
             * var app = angular.module('mouseMapClick', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.mouseMapClickButton = "Register mouse click";
                        $scope.toggleMouseClickRegistration = function(e) {
                                $scope.mouseClickStatus = "Map click registered";
                                angular.element(e.target).attr("disabled", "");
                                $scope.mapController.registerMapClick(mapClickCallback);
                            };

                        var mapClickCallback = function() {
                            $scope.mouseClickMsg = "Map Clicked";
                            setTimeout(function() {
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.$apply();
                            }, 1000);
                            $scope.$apply();
                        };
                    });
                }]);
             * </file>
             * <file name="mouseMapClick.css">
             *  #mouseMapClick {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.registerMapClick = function (callback) {
                GAMapService.registerMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#unRegisterMapClick
             * @description
             * Unregisters a map click event from the map instance.
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {function} callback - callback function that was originally registered.
             * @example
             * <example module="unRegisterMouseMapClick">
             * <file name="unRegisterMouseMapClick.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="unRegisterMouseClickRegistration($event)">{{registerMapClickButton}}</a>
                        <span class="alert alert-danger messagebox">
                            {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                    </div>
                    <div id="unRegisterMouseMapClick"></div>
                <ga-map
                    map-element-id="unRegisterMouseMapClick"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='[130, -25]'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
            </div>
             * </file>
             * <file name="unRegisterMouseMapClick.js">
             *  var app = angular.module('unRegisterMouseMapClick', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.registerMapClickButton = "Register map click";
                        $scope.unRegisterMouseClickRegistration = function() {
                            if(!$scope.mouseClickRegistered) {
                                $scope.mouseClickStatus = "Map click registered";
                                $scope.mouseClickRegistered = true;
                                $scope.registerMapClickButton = "Unregister Map Click";
                                $scope.mapController.registerMapClick(unRegisterMapClickCallback);
                            }

                            else {
                                $scope.mouseClickStatus = "Map click not registered";
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.mouseClickRegistered = false;
                                $scope.registerMapClickButton = "Register Map Click";
                                $scope.mapController.unRegisterMapClick(unRegisterMapClickCallback);
                            }
                        };
                        var unRegisterMapClickCallback = function() {
                            $scope.mouseClickMsg = "Map Clicked";
                            setTimeout(function() {
                                $scope.mouseClickMsg = "mouseClickMsg";
                                $scope.$apply();
                            }, 1000)
                            $scope.$apply();
                        };
                    });
                }]);
             * </file>
             * <file name="unRegisterMouseMapClick.css">
             * #unRegisterMouseMapClick {
                    width:600px;
                    height:550px;
                    display: inline-block;
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.unRegisterMapClick = function (callback) {
                GAMapService.unRegisterMapClick($scope.mapInstance, callback, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#addControl
             * @description
             * Creates and adds a control to the map instance
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} controlName - the name of the type of control to be created
             * @param {Object} controlOptions - an objet with implementation specific controlOptions
             * @param {string=} elementId - a DOM element to add the control to.
             * @param {string=} controlId - An id to help interact with the control when using 'ById' methods
             * @example
             * <example module="addOurControl">
             * <file name="addOurControl.html">
             * <div ng-controller="addOurControl">
             * <a class="btn btn-primary" ng-click="addOurControl()">Add Control</a>
             * <div id="addOurControl"></div>
             * <ga-map map-element-id="addOurControl" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="addOurControl.js">
             * angular.module("addOurControl",['gawebtoolkit.core'])
             * .controller("addOurControl", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.addOurControl = function() {
             * $scope.mapController.addControl("panzoombar", "", "addOurControl", "ourCustomControl");
             * }
             * })
             * }]);
             * </file>
             * <file name="addOurControl.css">
             * #addOurControl {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.addControl = function (controlName, controlOptions, elementId, controlId) {
                return GAMapService.addControl($scope.mapInstance, controlName, controlOptions, elementId, controlId, self.getMapOptions(), $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLonLatFromPixel
             * @description
             * Gets a latlon object from implementation service
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Number} x - number of pixels from the left of the div containing the map
             * @param {Number} y - number of pixels from the top of the div containing the map
             * @param {string} projection - a projection to convert to from the maps projection
             * @return {LonLat} An object containing Latitude and Longitude in the projection of the map
             * @example
             * <code><pre>var lonLat = mapController.getLonLatFromPixel(200,500)
             * // eg, lonLat equals lat: -30.967, lon: 108.552</pre></code>
             * <example module="getLonLat">
             * <file name="getLonLat.html">
             * <div ng-controller="ourMapController">
                <div id="toolbar">
                    <a class="btn btn-primary" ng-click="toggleMouseClickRegistration($event)">{{registerMapClickButton}}</a>
                    <span ng-show="isMapClickRegistered" class="alert alert-danger messagebox">
                        {{mouseClickStatus + " | " + mouseClickMsg}}</span>
                </div>        
                <div id="getLonLat"></div>
                <ga-map
                    map-element-id="getLonLat"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='[130, -25]'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Topographic" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
              </div>
             * </file>
             * <file name="getLonLat.js">
             *  var app = angular.module('getLonLat', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                        $scope.mouseClickStatus = "mouseClickStatus";
                        $scope.mouseClickMsg = "mouseClickMsg";
                        $scope.registerMapClickButton = "Register map click";
                        $scope.toggleMouseClickRegistration = function(e) {
                                $scope.isMapClickRegistered = true;
                                $scope.mouseClickStatus = "Map click registered";
                                angular.element(e.target).attr("disabled", "");
                                $scope.mapController.registerMapClick(mapClickCallback);
                            };

                        var mapClickCallback = function(e) {
                            LonLatObj = $scope.mapController.getLonLatFromPixel(e.pageX, e.pageY, $scope.mapController.getProjection());
                            $scope.mouseClickMsg = "Longitude: " + LonLatObj.lon + " | Latitude: " + LonLatObj.lat;
                            $scope.$apply();
                        };
                    });
                }]);
             * </file>
             * <file name="getLonLat.css">
             *  #getLonLat {
                    width:600px;
                    height:500px;
                    display: inline-block
               }
               #toolbar {
                   padding: 0;
                   float: left;
               }
               #toolbar > * {
                   float: left;
               }
               .btn {
                   margin: 5px 20px;
               }
             * </file>
             * </example>
             * */
            self.getLonLatFromPixel = function (x, y, projection) {
                return GAMapService.getLonLatFromPixel($scope.mapInstance, x, y, projection, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getPixelFromLonLat
             * @description
             * Gets a latlon object from implementation service
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Number} lon - The latitude of the location to transform
             * @param {Number} lat - The longitude of the location to transform
             * @return {Point} - An object containing Latitude and Longitude in the projection of the map
             * @example <code><pre>var point = mapController.getPixelFromLonLat(-20,-100);
             * // eg, point equals x: 25, y: 63</pre></code>
             * */
            self.getPixelFromLonLat = function (lon, lat) {
                return GAMapService.getPixelFromLonLat($scope.mapInstance, lon, lat, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getPointFromEvent
             * @description
             * Extracts a point from an event coming from implementation service layer.
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Object} event - An event from implementation, eg OpenLayers,
             * worked out from number of pixels from the left of the div containing the map
             * @return {Point} - A point object extracted from the event.
             * */
            self.getPointFromEvent = function (event) {
                return GAMapService.getPointFromEvent(event, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLayers
             * @description
             * Gets all the layers currently associated with the map instance
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayers">
             * <file name="dumpLayers.html">
             * <div ng-controller="dumpLayers">
             * <a class="btn btn-primary" ng-click="dumpLayers()">Dump layers object to console</a>
             * <div id="dumpLayers"></div>
             * <ga-map map-element-id="dumpLayers" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="dumpLayers.js">
             * angular.module("dumpLayers",['gawebtoolkit.core'])
             * .controller("dumpLayers", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.dumpLayers = function() {
             * console.log( $scope.mapController.getLayers() );
             * }
             * })
             * }]);
             * </file>
             * <file name="dumpLayers.css">
             * #dumpLayers {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.getLayers = function () {
                return GAMapService.getLayers($scope.mapInstance, $scope.framework);
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getLayersByName
             * @description
             * Finds and returns the layer's details by its name
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} LayerName - The name of the layer, which is defined on gaMapLayer directive
             * @return {Layer[]} - An array of layers currently on the map
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="dumpLayersByName">
             * <file name="dumpLayersByName.html">
             * <div ng-controller="dumpLayersByName">
             * <a class="btn btn-primary" ng-click="dumpLayersByName()">Dump base layer's details object to console</a>
             * <div id="dumpLayersByName"></div>
             * <ga-map map-element-id="dumpLayersByName" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="dumpLayersByName.js">
             * angular.module("dumpLayersByName",['gawebtoolkit.core'])
             * .controller("dumpLayersByName", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.dumpLayersByName = function() {
             * console.log( $scope.mapController.getLayersByName("Simple map layer name") );
             * }
             * })
             * }]);
             * </file>
             * <file name="dumpLayersByName.css">
             * #dumpLayersByName {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.getLayersByName = function (layerName) {
                return GAMapService.getLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomToLayer
             * @description
             * If possible, performs an action to zoom in on the extent of a layer associated with Id
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer to zoom too.
             * @example
             * <code><pre>var layers = $scope.mapController.getLayers();
             * $scope.mapController.zoomToLayer(layers[0].id);</pre></code>
             * <example module="zoomToLayer">
             * <file name="zoomToLayer.html">
             * <div ng-controller="zoomToLayer">
             * <a class="btn btn-primary" ng-click="zoomToLayer()">Zoom to base layer extent</a>
             * <div id="zoomToLayer"></div>
             * <ga-map map-element-id="zoomToLayer" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="zoomToLayer.js">
             * angular.module("zoomToLayer",['gawebtoolkit.core'])
             * .controller("zoomToLayer", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.zoomToLayer = function() {
             * var baseLayerId = $scope.mapController.getLayers()[0].id;
             * $scope.mapController.zoomToLayer( baseLayerId );
             * }
             * })
             * }]);
             * </file>
             * <file name="zoomToLayer.css">
             * #zoomToLayer {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.zoomToLayer = function (layerId) {
                GAMapService.zoomToLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getMapProjection">
             * <file name="getProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getProjection()">Get Projection: {{projection}}</a>
                    </div>
                    <div id="getMapProjection"></div>
                    <ga-map
                        map-element-id="getMapProjection"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='[130, -25]'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>
             * </file>
             * <file name="getProjection.js">
             *  var app = angular.module('getMapProjection', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                    });
                }]);
             * </file>
             * <file name="getProjection.css">
             *  #getMapProjection {
                    width: 600px;
                    height:500px;
                    display: inline-block;
                }
                #toolbar {
                   padding: 0;
                   float: left;
                }
                #toolbar > * {
                   float: left;
                }
                .btn {
                   margin: 5px 20px;
                }
             * </file>
             * </example>
             * */
            self.getProjection = function () {
                return $scope.datumProjection;
            };
            /**
             *
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#getDisplayProjection
             * @description
             * Get original datum projection provided to the map on initialisation, eg $scope.datumProjection
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @return {string} Returns the projection value in string format
             * @example
             * <example module="getDisplayProjection">
             * <file name="getDisplayProjection.html">
             *  <div ng-controller="ourMapController">
                    <div id="toolbar">
                        <a class="btn btn-primary" ng-click="projection = mapController.getDisplayProjection()">Get Display Projection: {{projection}}</a>
                    </div>
                    <div id="getDisplayProjection"></div>
                    <ga-map
                        map-element-id="getDisplayProjection"
                        datum-projection='EPSG:102100'
                        display-projection='EPSG:4326'
                        center-position='[130, -25]'
                        zoom-level="4">
                        <ga-map-layer
                            layer-name="Overview World Screen"
                            layer-type="GoogleStreet"
                            is-base-layer="true">
                        </ga-map-layer>
                        <ga-map-layer
                            layer-name="Topographic" 
                            layer-type="WMS"
                            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                            is-base-layer="false"
                            layers="hazardContours"
                            background-color="#ffffff">
                        </ga-map-layer>
                    </ga-map>
                </div>
             * </file>
             * <file name="getDisplayProjection.js">
             *  var app = angular.module('getDisplayProjection', ['gawebtoolkit.core']);
                app.controller('ourMapController',['$scope', function ($scope) {
                    $scope.mouseMoveRegistered = false;
                    $scope.$on('mapControllerReady', function(event,args) {
                        $scope.mapController = args;
                    });
                }]);
             * </file>
             * <file name="getProjection.css">
             *  #getDisplayProjection {
                    width: 600px;
                    height:500px;
                    display: inline-block;
                }
                #toolbar {
                   padding: 0;
                   float: left;
                }
                #toolbar > * {
                   float: left;
                }
                .btn {
                   margin: 5px 20px;
                }
             * </file>
             * </example>
             * */
            self.getDisplayProjection = function () {
                return $scope.displayProjection;
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setLayerVisibility
             * @description
             * Changes the associated layerId visibility
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer
             * @param {boolean} visibility - Boolean indicating if the layer should be hidden(false) or shown(true)
             * @example
             * <example module="setVisibility">
             * <file name="setVisibility.html">
             * <div ng-controller="setVisibility">
             * <input type="checkbox" ng-model="layerVisibility" ng-change="setVisibility()" /> Toggle base layer visibility on/off
             * <div id="setVisibility"></div>
             * <ga-map map-element-id="setVisibility" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * <ga-map-control map-control-name="mouseposition"></ga-map-control>
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setVisibility.js">
             * angular.module("setVisibility",['gawebtoolkit.core'])
             * .controller("setVisibility", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.$on('layersReady', function() {
             * $scope.layerVisibility = $scope.mapController.getLayers()[0].visibility;
             * });
             * $scope.setVisibility = function() {
             * $scope.mapController.setLayerVisibility($scope.mapController.getLayers()[0].id, $scope.layerVisibility);
             * }
             * })
             * }]);
             * </file>
             * <file name="setVisibility.css">
             * #setVisibility {width: 570px; height: 400px; margin-top: 10px !important;}
             * </file>
             * </example>
             * */
            self.setLayerVisibility = function (layerId, visibility) {
                GAMapService.setLayerVisibility($scope.mapInstance, layerId, visibility, $scope.framework);
            };

            /**
             * Creates a bounding box and returns an implementation specific object
             *
             * @param lonLatArray {geoJsonCoordinates}
             * @return {Object}
             * */
            self.createBoundingBox = function (lonLatArray) {
                return GAMapService.createBoundingBox($scope.mapInstance, lonLatArray, $scope.framework);
            };
            /**
             * Creates a bounding object and returns an implementation specific object
             * Implementation to extend bounding box to encompass all LonLat's provided.
             *
             * @param geoJsonCoordinates {geoJsonCoordinates}
             * @param projection {string}
             * @return {Object}
             * */
            self.createBounds = function (geoJsonCoordinates, projection) {
                return GAMapService.createBounds($scope.mapInstance, geoJsonCoordinates, projection, $scope.framework);
            };
            /**
             * Zooms map to bounds around provided LonLat array
             *
             * @param lonLatArray {LonLat[]} - array of LonLat to build a bounds to zoom too.
             * */
            self.zoomToExtent = function (lonLatArray) {
                GAMapService.zoomToExtent($scope.mapInstance, lonLatArray, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#zoomTo
             * @description
             * Sets the zoom level of the map
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {number} zoomLevel - A number value to be used as zoom level

             * @example
             * <example module="setZoomLevel">
             * <file name="setZoomLevel.html">
             * <div ng-controller="setZoomLevel">
             * <input placeholder="0-19" type="number" ng-model="zoomLevel" style="width: 50px" /><a class="btn btn-primary" ng-click="setZoomLevel()">  Set zoom level to {{zoomLevel}}</a>
             * <div id="setZoomLevel"></div>
             * <ga-map map-element-id="setZoomLevel" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setZoomLevel.js">
             * angular.module("setZoomLevel",['gawebtoolkit.core'])
             * .controller("setZoomLevel", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.setZoomLevel = function() {
             * $scope.mapController.zoomTo($scope.zoomLevel);
             * }
             * })
             * }]);
             * </file>
             * <file name="setZoomLevel.css">
             * #setZoomLevel {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.zoomTo = function (zoomLevel) {
                GAMapService.zoomTo($scope.mapInstance, zoomLevel, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setBaseLayer
             * @description
             * Changes the current base layer to the layer associated with the Id provided
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - id of the new base layer.
             * @example
             * <example module="setBaseLayer">
             * <file name="setBaseLayer.html">
             * <div ng-controller="ourMapController">
                <select
                    id="selectBaseLayer"
                    ng-model="selectedBaseLayer"
                    ng-change="mapController.setBaseLayer(selectedBaseLayer)"
                    ng-options="baseLayer.id as baseLayer.name for baseLayer in baseLayers"></select>
                <div id="setBaseLayer"></div>
                <ga-map
                    map-element-id="setBaseLayer"
                    datum-projection='EPSG:102100'
                    display-projection='EPSG:4326'
                    center-position='[130, -25]'
                    zoom-level="4">
                    <ga-map-layer
                        layer-name="World Image"
                        layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
                        wrap-date-line="true"
                        layer-type="XYZTileCache"
                        is-base-layer="true"
                        visibility="false">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="World Political Boundaries" 
                        layer-url="http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer" 
                        wrap-date-line="true" 
                        layer-type="XYZTileCache"
                        is-base-layer="true"
                        visibility="false">
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Overview World Screen"
                        layer-type="GoogleStreet"
                        is-base-layer="true">
                    </ga-map-layer>
                    </ga-map-layer>
                    <ga-map-layer
                        layer-name="Earthquake hazard contours" 
                        layer-type="WMS"
                        layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
                        is-base-layer="false"
                        layers="hazardContours"
                        background-color="#ffffff">
                    </ga-map-layer>
                </ga-map>
               </div>
             * </file>
             * <file name="setBaseLayer.js">
             * var app = angular.module('setBaseLayer',
                ['gawebtoolkit.core']);
                app.controller("ourMapController",["$scope", function($scope) {
                    $scope.$on("mapControllerReady", function(event, args) {
                        $scope.mapController = args;
                        $scope.$on("layersReady", function() {
                            $scope.layers = $scope.mapController.getLayers();
                            $scope.baseLayers = $scope.layers.filter(function(layer) {
                                return $scope.mapController.isBaseLayer(layer.id);
                            });
                            $scope.selectedBaseLayer = $scope.baseLayers[0].id;
                        });
                    });
                }]);
             * </file>
             * <file name="setBaseLayer.css">
             *  #setBaseLayer {
                    background-color: #21468b;
                    margin-top: 10px !important;
                    width: 600px;
                    height: 500px;
                }
             * </file>
             * </example>
             * */
            self.setBaseLayer = function (layerId) {
                GAMapService.setBaseLayer($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setCenter
             * @description
             * Changes the centred position of the map to the provided lat, lon
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {Number} lat - Latitude value to move the view too.
             * @param {Number} lon - Longitude value to move the view too.
             * @param {String} projection - Projection of {LonLat}
             * @example
             * <example module="setCenterPosition">
             * <file name="setCenterPosition.html">
             * <div ng-controller="setCenterPosition">
             * <a class="btn btn-primary" ng-click="setCenterPosition()">Move to Australia</a>
             * <div id="setCenterPosition"></div>
             * <ga-map map-element-id="setCenterPosition" zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setCenterPosition.js">
             * angular.module("setCenterPosition",['gawebtoolkit.core'])
             * .controller("setCenterPosition", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.setCenterPosition = function() {
             * $scope.mapController.setCenter(130, -25);
             * $scope.mapController.zoomTo(4);
             * }
             * })
             * }]);
             * </file>
             * <file name="setCenterPosition.css">
             * #setCenterPosition {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.setCenter = function (lat, lon, projection) {
                GAMapService.setCenter($scope.mapInstance, lat, lon, projection, $scope.framework);
            };

            self.getInitialExtent = function () {
                return $scope.initialExtent;
            };

            self.setInitialPositionAndZoom = function () {

                var args = {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
                if(!$scope.centerPosition) {
                    $scope.centerPosition = {
                        lon: 0,
                        lat: 0
                    };
                }
                if (!$scope.initialPositionSet) {
                    GAMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework);
                }

                $scope.initialPositionSet = true;
            };

            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#isBaseLayer
             * @description
             * Returns true if layer with the associated Id is a base layer
             * @param {string} layerId - Id of the layer
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @example
             * <code><pre>anogular.module("ourMapApp", ["geowebtoolkit.core"])
             * .controller("ourAppController",["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function (event, args) {
             * $scope.mapController = args;
             * var layerId = $scope.mapController.getLayers[0].id;
             * isLayerBaseLayer = $scope.mapController(layerId);
             * });
             * }]);</pre></code>
             * <example module="checkBaseLayer">
             * <file name="checkBaseLayer.html">
             * <div ng-controller="checkBaseLayerController">
             * <a class="btn btn-primary" ng-click="chklayer1 = checklayer(0)">  Check base layer : {{chklayer1}}</a>
             * <a class="btn btn-primary" ng-click="chklayer2 = checklayer(1)">  Check base layer : {{chklayer2}}</a>
             * <div id="checkBaseLayer"></div>
             * <ga-map map-element-id="checkBaseLayer" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             *<ga-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="checkBaseLayer.js">
             * angular.module("checkBaseLayer",['gawebtoolkit.core'])
             * .controller("checkBaseLayerController", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.checklayer = function(layerNumber) {
             * layerId = $scope.mapController.getLayers()[layerNumber].id;
             * chklayer = $scope.mapController.isBaseLayer(layerId);
             * return chklayer;
             * }
             * })
             * }]);
             * </file>
             * <file name="checkBaseLayer.css">
             * #checkBaseLayer {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>
             * */
            self.isBaseLayer = function (layerId) {
                return GAMapService.isBaseLayer($scope.mapInstance, layerId, $scope.framework);
            };

            /**
             * @deprecated
             * Returns the map instance
             *
             * @return {Object}
             * */
            self.getMapInstance = function () {
                return $scope.mapInstance;
            };
            /**
             * @ngdoc method
             * @name gawebtoolkit.core.map-directives:gaMap#setOpacity
             * @description 
             * Changes the opacity of the associated layer to the value provided (Number between 0 and 1.0
             * <br>This function only works on non-base layers
             * @methodOf gawebtoolkit.core.map-directives:gaMap
             * @param {string} layerId - Id of the layer
             * @param {Number} opacity - Value between 0 and 1.0 representing the layer's new opacity.
             * @example
             * <example module="setOpacity">
             * <file name="setOpacity.html">
             * <div ng-controller="setOpacityController">
             * <input placeholder="0-1" type="number" ng-model="opacityLevel" style="width: 50px; height: auto;" /><a class="btn btn-primary" ng-click="setOpacityLevel()">  Set top layer's opacity to {{opacityLevel}}</a>
             * <div id="setOpacity"></div>
             * <ga-map map-element-id="setOpacity" center-position='[130, -25]' zoom-level="4">
             * <ga-map-layer layer-name="Simple map layer name"  layer-type="GoogleStreet" is-base-layer="true">
             * </ga-map-layer>
             *<ga-map-layer layer-name="Topographic" layer-type="WMS" layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" is-base-layer="false" layers="hazardContours" background-color="#ffffff">
        </ga-map-layer>
             * </ga-map>
             * </div>
             * </file>
             * <file name="setOpacityLevel.js">
             * angular.module("setOpacity",['gawebtoolkit.core'])
             * .controller("setOpacityController", ["$scope", function($scope) {
             * $scope.$on("mapControllerReady", function(event, args) {
             * $scope.mapController = args;
             * $scope.$on("layersReady", function() {
             * $scope.baseLayerId = $scope.mapController.getLayers()[1].id;
             * })
             * $scope.setOpacityLevel = function() {
             * $scope.mapController.setOpacity($scope.baseLayerId, $scope.opacityLevel);
             * }
             * })
             * }]);
             * </file>
             * <file name="setOpacity.css">
             * #setOpacity {width: 570px; height: 400px; margin-top: 10px !important;}
             * .btn {margin-left: 20px;}
             * input {margin: 0 !important}
             * </file>
             * </example>             
             * */
            self.setOpacity = function (layerId, opacity) {
                GAMapService.setOpacity($scope.mapInstance, layerId, opacity, $scope.framework);
            };
            /**
             * Returns the map element Id that was originally passed to gaMap
             *
             * @return {string}
             * */
            self.getMapElementId = function () {
                return $scope.mapElementId;
            };
            /**
             * Adds a marker to an existing marker group/layer or creates a new group/layer to add
             * the marker too.
             *
             * @param point {Point} - screen point to place the marker
             * @param markerGroupName {string} - group name associated with the new marker
             * @param iconUrl {string} - A url to the desired icon for the marker
             *
             * */
            self.setMapMarker = function (point, markerGroupName, iconUrl, args) {
                GAMapService.setMapMarker($scope.mapInstance, point, markerGroupName, iconUrl, args, $scope.framework);
            };
            /**
             * Removes the first layer found that matches the name provided
             *
             * @param layerName {string} - Name of a named layer
             *
             * */
            self.removeLayerByName = function (layerName) {
                GALayerService.removeLayerByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes all layers matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * */
            self.removeLayersByName = function (layerName) {
                GALayerService.removeLayersByName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Removes layer by reference to a layer object
             *
             * @deprecated
             * */
            self.removeLayer = function (layerInstance) {
                GALayerService.removeLayer($scope.mapInstance, layerInstance, $scope.framework);
            };

            /**
             * Removed layer by id
             * @param layerId {string} - Id of a layer to remove
             * */
            self.removeLayerById = function (layerId) {
                GALayerService.removeLayerById($scope.mapInstance, layerId, $scope.framework);
            };
            /**
             * Gets the count of markers of the first layer matching the name provided
             *
             * @param layerName {string} - Name of the named layer
             * @return {Number}
             * */
            self.getMarkerCountForLayerName = function (layerName) {
                return GALayerService.getMarkerCountForLayerName($scope.mapInstance, layerName, $scope.framework);
            };
            /**
             * Draws a polyline on the map provided an array of LatLons on a new layer of the provided name.
             *
             * @param layerName {string} - Name of the new layer to draw on.
             * @param points {LonLat[]} - Array of LonLat to draw.
             * */
            self.drawPolyLine = function (points, layerName) {
                GAMapService.drawPolyLine($scope.mapInstance, points, layerName, $scope.framework);
            };
            
            self.startRemoveSelectedFeature = function (layerName) {
                return GAMapService.startRemoveSelectedFeature($scope.mapInstance, layerName, $scope.framework);
            };

            self.stopRemoveSelectedFeature = function () {
                return GAMapService.stopRemoveSelectedFeature($scope.mapInstance, $scope.framework);
            };
            
            self.removeFeature = function (layerName, feature) {
                return GAMapService.removeFeature($scope.mapInstance, layerName, feature, $scope.framework);
            };

            self.startDrawingOnLayer = function (layerName, args) {
                return GAMapService.startDrawingOnLayer($scope.mapInstance,layerName, args,$scope.framework);
            };

            self.stopDrawing = function () {
                return GAMapService.stopDrawing($scope.mapInstance,$scope.framework);
            };
            
            self.drawLabel = function (layerName, args) {
                return GAMapService.drawLabel($scope.mapInstance, layerName, args, $scope.framework);
            };   
            
            self.drawLabelWithPoint = function (layerName, args) {
                return GAMapService.drawLabelWithPoint($scope.mapInstance, layerName, args, $scope.framework);
            };           

            self.isControlActive = function (controlId, controlName) {
                return GAMapService.isControlActive($scope.mapInstance, controlId,controlName, $scope.framework);
            };

            self.getLayersByWMSCapabilities = function(url) {
                return GADataService.getLayersByWMSCapabilities(url, $scope.framework);
            };

            self.getWMSFeatures = function (url, layerNames, wmsVersion, pointEvent, contentType) {
                return GADataService.getWMSFeatures($scope.mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, $scope.framework);
            };

            self.getWMSFeaturesByLayerId = function (url, layerId, pointEvent) {
                return GADataService.getWMSFeaturesByLayerId($scope.mapInstance,url, layerId, pointEvent,$scope.framework);
            };

            /**
             * TBC
             * */
            self.registerFeatureSelected = function (layerId, callback, element) {
                return GALayerService.registerFeatureSelected($scope.mapInstance, layerId, callback, element, $scope.framework);
            };

			self.getFeatureInfo = function (callback,url,featureType, featurePrefix, geometryName, point, tolerance) {
				return GAMapService.getFeatureInfo($scope.mapInstance,callback, url,featureType, featurePrefix, geometryName, point, tolerance, $scope.framework);
			};

			self.getFeatureInfoFromLayer = function (callback,layerId, point,tolerance) {
				return GAMapService.getFeatureInfoFromLayer($scope.mapInstance,callback,layerId, point,tolerance, $scope.framework);
			};

            self.resetMapFired = function () {
                $scope.$emit('resetMapFired');

            };            
            /**
             * TBC
             * */
            self.activateControl = function (controlId) {
                GAMapService.activateControl($scope.mapInstance, controlId, $scope.framework);
            };

            self.deactivateControl = function (controlId) {
                GAMapService.deactivateControl($scope.mapInstance, controlId, $scope.framework);
            };
            /**
             * TBC
             * */
            self.registerControlEvent = function (controlId, eventName, callback) {
                GAMapService.registerControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            /**
             * TBC
             * */
            self.unRegisterControlEvent = function (controlId, eventName, callback) {
                GAMapService.unRegisterControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            };

            self.registerMapEvent = function (eventName, callback) {
                GAMapService.registerMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            self.registerLayerEvent = function (layerId, eventName, callback) {
                GALayerService.registerLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            self.unRegisterLayerEvent = function(layerId,eventName,callback) {
                GALayerService.unRegisterLayerEvent($scope.mapInstance,layerId,eventName,callback, $scope.framework);
            };

            self.unRegisterMapEvent = function (eventName, callback) {
                GAMapService.unRegisterMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            };

            self.getCurrentMapExtent = function () {
                return GAMapService.getCurrentMapExtent($scope.mapInstance, $scope.framework);
            };

            /**
             * @private
             *
             * Helper function to ensure all layers are loaded, async or other wise.
             * */
//            self.waitingForAsyncLayer = function () {
//                $scope.waitingForNumberOfLayers++;
//            };

            /**
             * @private
             *
             * Helper function to ensure all layers are loaded, async or other wise.
             * */
//            self.asyncLayerLoaded = function () {
//                $scope.waitingForNumberOfLayers--;
//            };

//            self.asyncLayerError = function (layer) {
//                $scope.waitingForNumberOfLayers--;
//                var index = $scope.layerPromises.indexOf(layer);
//                if (index > -1) {
//                    $scope.layerPromises.splice(index, 1);
//                }
//            };

            self.switch3d = function () {
                if(!GAMapService.is3dSupported($scope.mapInstance,$scope.framework)) {
                    return;
                }
                if(!GAMapService.is3d($scope.mapInstance,$scope.framework)) {
                    GAMapService.switchTo3dView($scope.mapInstance,$scope.framework);
                } else {
                    GAMapService.switchTo2dView($scope.mapInstance,$scope.framework);
                }
            };

            self.is3d = function () {
                if(!GAMapService.is3dSupported($scope.mapInstance,$scope.framework)) {
                    return false;
                }
                return GAMapService.is3d($scope.mapInstance,$scope.framework);
            };

            self.filterFeatureLayer = function (layerId, filterValue, featureAttributes) {
                GALayerService.filterFeatureLayer($scope.mapInstance, layerId, filterValue, featureAttributes, $scope.framework);
            };

            self.getLayerFeatures = function (layerId) {
                return GALayerService.getLayerFeatures($scope.mapInstance, layerId, $scope.framework);
            };

            self.createFeature = function (geoJson) {
                return GALayerService.createFeature($scope.mapInstance, geoJson, $scope.framework);
            };

            self.addFeatureToLayer = function (layerId, feature) {
                return GALayerService.addFeatureToLayer($scope.mapInstance, layerId, feature, $scope.framework);
            };

            self.createWfsClient = function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                return GAMapService.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid, $scope.framework);
            };

            self.addWfsClient = function (wfsClient) {
                return GAMapService.addWfsClient(wfsClient, $scope.framework);
            };

            self.searchWfs = function (clientId, query, attribute) {
                return GAMapService.searchWfs($scope.mapInstance, clientId, query, attribute, $scope.framework);
            };

            self.getMeasureFromEvent = function (event) {
                return GAMapService.getMeasureFromEvent($scope.mapInstance, event, $scope.framework);
            };

            self.removeFeatureFromLayer = function (layerId, featureId) {
                GALayerService.removeFeatureFromLayer($scope.mapInstance, layerId, featureId, $scope.framework);
            };

            self.raiseLayerDrawOrder = function (layerId, delta) {
                GALayerService.raiseLayerDrawOrder($scope.mapInstance, layerId, delta, $scope.framework);
            };
//            var layersReadyDeferred = $q.defer();
//            self.layersReady = function () {
//                return layersReadyDeferred.promise;
//            };
            self.getFrameworkVersion = function () {
                return $scope.framework;
            };
            $scope.gaMap = self;

            /**
             * @function
             * Default bind to handle window resizing
             * */
            $(window).bind('resize', function () {
                GAMapService.mapResized($scope.mapInstance, $scope.framework);
            });

            //Allowing other directives to get mapInstance from scope could lead
            //to map manipulation outside services and mapcontroller.
            //Though would make things easier.
            /*self.getMapInstance = function() {
             return $scope.mapInstance;
             };*/

            //Initialise map
            $scope.mapInstance = GAMapService.initialiseMap({
                mapElementId: $scope.mapElementId,
                datumProjection: $scope.datumProjection,
                displayProjection: $scope.displayProjection,
                initialExtent: $scope.initialExtent,
                centerPosition: $scope.centerPosition,
                zoomLevel: $scope.zoomLevel,
                isStaticMap: $scope.isStaticMap
            }, $scope.framework);

            /**
             * Sends an instance of the map to any parent listens
             * @eventType emit
             * @event mapInstanceReady
             * */
            $scope.$emit('mapInstanceReady', $scope.mapInstance);
            /**
             * Sends an instance of the map controller to any parent listens
             * @eventType emit
             * @event mapControllerReady
             * */
            $scope.$emit('mapControllerReady', self);
            /**
             * Sends an instance of the map controller to any child listens
             * @eventType broadcast
             * @event mapControllerReady
             * */
            $scope.$broadcast('mapControllerReady', self);

            $scope.$on('$destroy', function () {
				$log.info('map destruction started...');
                //clean up resources
                $(window).off("resize.Viewport");
				//Wait for digestion
				$timeout(function () {
                    $log.info('map destruction finishing...');
                    $log.info('removing ' + $scope.gaMap.getLayers().length +' layers...');
                    var allLayers = $scope.gaMap.getLayers();
                    for (var i = 0; i < allLayers.length; i++) {
                        var layer = allLayers[i];
                        $scope.gaMap.removeLayerById(layer.id);
                    }
				});
            });
        }],
        link: function (scope,element,attrs) {
			//Wait for full digestion
            $timeout(function () {
                $q.allSettled(scope.layerPromises).then(function(layers) {
                    processLayers(layers);
                }, function (layersWithErrors) {
                    processLayers(layersWithErrors);
                });
                //scope.layersReady = true;
            });

            function processLayers(layers) {
                $log.info('resolving all layers');
                var allLayerDtos = [];
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if(typeof layer === 'string') {
                        //$log.info(layer);
                        scope.layerDtoPromises[i].reject(layer);
                    } else {
                        var layerDto = GAMapService.addLayer(scope.mapInstance, layer, scope.framework);
                        scope.layerDtoPromises[i].resolve(layerDto);
                        allLayerDtos.push(layerDto);
                    }
                }
                /**
                 * Sends an instance of all map layers when they are all loaded to parent listeners
                 * @eventType emit
                 * @event layersReady
                 * */
                scope.$emit('layersReady', allLayerDtos);
                /**
                 * Sends an instance of all map layers when they are all loaded to child listeners
                 * @eventType broadcast
                 * @event layersReady
                 * */
                scope.$broadcast('layersReady', allLayerDtos);
                //layersReadyDeferred.resolve(allLayerDtos);

                scope.layersReady = true;
                scope.gaMap.setInitialPositionAndZoom();
            }
		},
        transclude: false
    };
} ]);

app.config(['$provide', function ($provide) {
    $provide.decorator('$q', ['$delegate', function ($delegate) {
        var $q = $delegate;

        // Extention for q
        $q.allSettled = $q.allSettled || function (promises) {
            var deferred = $q.defer();
            if (angular.isArray(promises)) {
                var states = [];
                var results = [];
                var didAPromiseFail = false;

                // First create an array for all promises with their state
                angular.forEach(promises, function (promise, key) {
                    states[key] = false;
                });

                // Helper to check if all states are finished
                var checkStates = function (states, results, deferred, failed) {
                    var allFinished = true;
                    angular.forEach(states, function (state) {
                        if (!state) {
                            allFinished = false;
                        }
                    });
                    if (allFinished) {
                        if (failed) {
                            deferred.reject(results);
                        } else {
                            deferred.resolve(results);
                        }
                    }
                };

                // Loop through the promises
                // a second loop to be sure that checkStates is called when all states are set to false first
                angular.forEach(promises, function (promise, key) {
                    $q.when(promise).then(function (result) {
                        states[key] = true;
                        results[key] = result;
                        checkStates(states, results, deferred, didAPromiseFail);
                    }, function (reason) {
                        states[key] = true;
                        results[key] = reason;
                        didAPromiseFail = true;
                        checkStates(states, results, deferred, didAPromiseFail);
                    });
                });
            } else {
                throw 'allSettled can only handle an array of promises (for now)';
            }

            return deferred.promise;
        };

        return $q;
    }]);
}]);

var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.map-services', ['gawebtoolkit.mapservices']);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GAMapService', ['$log', 'ga.config', 'mapServiceLocator',
    function ($log, GAConfig, mapServiceLocator) {
        'use strict';
        return {
            initialiseMap: function (args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                try {
                    return service.initialiseMap(args, new GAConfig());
                } catch (e) {
                    $log.error('Failed to initialise map');
                    throw e;
                }
            },
            zoomToMaxExtent: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToMaxExtent(mapInstance);
            },
            zoomTo: function (mapInstance, zoomLevel, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.zoomTo(mapInstance, zoomLevel);
            },
            currentZoomLevel: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.currentZoomLevel(mapInstance);
            },
            addLayer: function (mapInstance, layer, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.addLayer(mapInstance, layer);
            },
            registerMapMouseMove: function (mapInstance, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapMouseMove(mapInstance, callback);
            },
            registerMapMouseMoveEnd: function (mapInstance, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapMouseMoveEnd(mapInstance, callback);
            },
            registerMapClick: function (mapInstance, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapClick(mapInstance, callback);
            },
            unRegisterMapClick: function (mapInstance, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterMapClick(mapInstance, callback);
            },
            registerMapEvent: function (mapInstance, eventName, callback, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapEvent(mapInstance, eventName, callback, version);
            },
            unRegisterMapEvent: function (mapInstance, eventName, callback, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterMapEvent(mapInstance, eventName, callback, version);
            },
            getCurrentMapExtent: function (mapInstance, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                return service.getCurrentMapExtent(mapInstance);
            },
            addControl: function (mapInstance, controlName, controlOptions, elementId, controlId, mapOptions, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.addControl(mapInstance, controlName, controlOptions, elementId, controlId, mapOptions);
            },
            isControlActive: function (mapInstance, controlId,controlName, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.isControlActive(mapInstance, controlId, controlName);
            },
            activateControl: function (mapInstance, controlId, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.activateControl(mapInstance, controlId);
            },
            deactivateControl: function (mapInstance, controlId, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.deactivateControl(mapInstance, controlId);
            },
            registerControlEvent: function (mapInstance, controlId, eventName, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.registerControlEvent(mapInstance, controlId, eventName, callback);
            },
            unRegisterControlEvent: function (mapInstance, controlId, eventName, callback, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterControlEvent(mapInstance, controlId, eventName, callback);
            },
            getLayers: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getLayers(mapInstance);
            },
            getLayersByName: function (mapInstance, layerName, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getLayersByName(mapInstance, layerName);
            },
            zoomToLayer: function (mapInstance, layerId, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToLayer(mapInstance, layerId);
            },
            setLayerVisibility: function (mapInstance, layerId, visibility, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setLayerVisibility(mapInstance, layerId, visibility);
            },
            createBoundingBox: function (mapInstance, lonLatArray, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.createBoundingBox(mapInstance, lonLatArray);
            },
            createBounds: function (mapInstance, lonLatArray, projection, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.createBounds(mapInstance, lonLatArray, projection);
            },
            zoomToExtent: function (mapInstance, extent, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToExtent(mapInstance, extent);
            },
            setCenter: function (mapInstance, lat, lon, projection, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setCenter(mapInstance, lat, lon, projection);
            },
            setInitialPositionAndZoom: function (mapInstance, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setInitialPositionAndZoom(mapInstance, args, new GAConfig());
            },
            setBaseLayer: function (mapInstance, layerId, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setBaseLayer(mapInstance, layerId);
            },
            isBaseLayer: function (mapInstance, layerId, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.isBaseLayer(mapInstance, layerId);
            },
            setOpacity: function (mapInstance, layerId, opacity, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setOpacity(mapInstance, layerId, opacity);
            },
            mapResized: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.mapResized(mapInstance);
            },
            setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.setMapMarker(mapInstance, coords, markerGroupName, iconUrl, args);
            },
            getLonLatFromPixel: function (mapInstance, x, y, projection, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getLonLatFromPixel(mapInstance, x, y, projection);
            },
            getPixelFromLonLat: function (mapInstance, lon, lat, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getPixelFromLonLat(mapInstance, lon, lat);
            },
            getPointFromEvent: function (e, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getPointFromEvent(e);
            },
            drawPolyLine: function (mapInstance, points, layerName, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.drawPolyLine(mapInstance, points, layerName);
            },
            startRemoveSelectedFeature: function (mapInstance, layerName, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.startRemoveSelectedFeature(mapInstance, layerName);
            },
            stopRemoveSelectedFeature: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.stopRemoveSelectedFeature(mapInstance);
            },
            removeFeature: function (mapInstance, layerName, feature, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.removeFeature(mapInstance, layerName, feature);
            },
            drawFeature: function (mapInstance, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.drawFeature(mapInstance, args);
            },
            startDrawingOnLayer: function (mapInstance,layerName, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.startDrawingOnLayer(mapInstance,layerName,args);
            },
            stopDrawing: function (mapInstance,version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.stopDrawing(mapInstance);
            },
            drawLabel: function (mapInstance, layerName, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.drawLabel(mapInstance,layerName, args);
            },
            drawLabelWithPoint: function (mapInstance, layerName, args, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.drawLabelWithPoint(mapInstance,layerName, args);
            },
            createWfsClient: function (url, featureType, featurePrefix, wfsVersion, geometryName, datumProjection, isLonLatOrderValid, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.createWfsClient(url, featureType, featurePrefix, wfsVersion, geometryName, datumProjection, isLonLatOrderValid);
            },
            getFeatureInfo: function (mapInstance, callback, url, featureType, featurePrefix, geometryName, point, tolerance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getFeatureInfo(mapInstance, callback, url, featureType, featurePrefix, geometryName, point, tolerance);
            },
            getFeatureInfoFromLayer: function (mapInstance, callback, layerId, point, tolerance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getFeatureInfoFromLayer(mapInstance, callback, layerId, point, tolerance);
            },
            getMeasureFromEvent: function (mapInstance, e, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getMeasureFromEvent(mapInstance, e);
            },
            addWfsClient: function (wfsClient, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.addWfsClient(wfsClient);
            },
            is3dSupported: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.is3dSupported(mapInstance);
            },
            is3d: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.is3d(mapInstance);
            },
            switchTo3dView: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.switchTo3dView(mapInstance);
            },
            switchTo2dView: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.switchTo2dView(mapInstance);
            },
            searchWfs: function (mapInstance, clientId, query, attribute, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.searchWfs(mapInstance, clientId, query, attribute);
            }
        };
    }]);

app.service('mapServiceLocator', ['$injector', function ($injector) {
    "use strict";
    var implementations = {
        'olv2': 'olv2MapService',
        'olv3': 'olv3MapService'
    };
    return {
        getImplementation: function (mapType) {
            return $injector.get(implementations[mapType]);
        }
    };
}]);
var angular = angular || {};

var app = angular.module('gawebtoolkit.core.marker-directives',
    [
        'gawebtoolkit.core.map-directives',
        'gawebtoolkit.core.map-services',
        'gawebtoolkit.core.layer-services'
    ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.core.marker-directives:gaMapMarker
 * @description
 * A wrapper for a native map marker
 * @scope
 * @restrict E
 * @require gaMap
 * @example
 */
app.directive('gaMapMarker', [ function () {
    'use strict';
    return {
        restrict: "E",
        require: "^gaMap",
        scope: {
            markerIcon: "@",
            markerLong: "@",
            markerLat: "@",
            markerId: "@",
            mapMarkerClicked: "&"
        },
        link: function (scope, element, attrs, mapController) {
            element.bind("click", function () {
                scope.mapMarkerClicked({
                    id: scope.markerId
                });
            });

            if (!scope.mapControlName) {
                return;
            }
            mapController.addControl(scope.mapControlName, scope.controlOptions, element);
        }
    };
} ]);
var angular = angular || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.utils', []);
app.service('GAWTUtils', [ function() {
   'use strict';
   return {
      generateUuid : function() {
         //Code from - https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
         //Author https://github.com/broofa
         return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x'
                  ? r
                  : (r & 0x3 | 0x8);
            return v.toString(16);
         });
      },
      convertHexToRgb: function (hexVal) {
         function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
         function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
         function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
         function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
         return [hexToR(hexVal),hexToG(hexVal),hexToB(hexVal)];
      },
      convertHexAndOpacityToRgbArray: function (hexVal, opacity) {
         function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
         function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
         function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
         function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
         return [hexToR(hexVal),hexToG(hexVal),hexToB(hexVal), opacity];
      }


   };
} ]);
/* global angular, OpenLayers, $ */
(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.data.openlayersv2', []);

    var olv2DataService = ['$q', '$http', function ($q, $http) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var projection = mapInstance.projection;
            var bounds = mapInstance.getExtent();
            var bbox = bounds.toBBOX();
            var point = (event instanceof MouseEvent) ? pointEvent.xy : pointEvent;
            var halfHeight = mapInstance.getSize().h / 2;
            var halfWidth = mapInstance.getSize().w / 2;
            var centerPoint = new OpenLayers.Geometry.Point(halfWidth, halfHeight);

            var requestWidth = mapInstance.getSize().w;
            var requestHeight = mapInstance.getSize().h;
            var finalPoint = {
                x: point.x,
                y: point.y
            };
            var newBounds;
            // Split the screen into a quadrant and re-calculate the bounding box, some WMS servers have issues with screen width of greater than 2050
            if (mapInstance.getSize().w >= 2050) {
                if (point.x > centerPoint.x) {
                    // right
                    if (point.y > centerPoint.y) {
                        // bottom
                        var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, centerPoint.y));
                        var bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(mapInstance.getSize().w, mapInstance.getSize().h));
                        newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);

                        finalPoint.x = point.x - halfWidth;
                        finalPoint.y = point.y - halfHeight;
                    } else {
                        // top
                        var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, 0));
                        var bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(mapInstance.getSize().w, mapInstance.getSize().h));
                        newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);

                        finalPoint.x = point.x - halfWidth;
                    }
                } else {
                    // left
                    if (point.y > centerPoint.y) {
                        // bottom
                        var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(0, centerPoint.y));
                        var bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, mapInstance.getSize().h));
                        newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);

                        finalPoint.y = point.y - halfHeight;
                    } else {
                        // top
                        var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(0, 0));
                        var bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, centerPoint.y));
                        newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);
                    }
                }

                bbox = newBounds.toBBOX();
                requestHeight = Math.floor(halfHeight);
                requestWidth = Math.floor(halfWidth);
            }

            return OpenLayers.Util.extend({
                    service: "WMS",
                    version: version,
                    request: "GetFeatureInfo",
                    bbox: bbox,
                    feature_count: 100,
                    height: requestHeight,
                    width: requestWidth,
                    format: OpenLayers.Format.WMSGetFeatureInfo,
                    info_format: infoTextContentType
                }, (parseFloat(version) >= 1.3) ?
                {
                    crs: projection,
                    i: parseInt(finalPoint.x),
                    j: parseInt(finalPoint.y)
                } :
                {
                    srs: projection,
                    x: parseInt(finalPoint.x),
                    y: parseInt(finalPoint.y)
                }
            );

        }

        function resolveOpenLayersFormatConstructorByInfoFormat(infoFormat) {
            var result;
            var infoType;
            if (infoFormat && typeof infoFormat === 'string' && infoFormat.indexOf('application/vnd.ogc.gml/3') === 0) {
                infoType = 'application/vnd.ogc.gml/3';
            } else {
                infoType = infoFormat;
            }
            switch (infoType) {
                case 'application/vnd.ogc.gml':
                    result = OpenLayers.Format.GML.v2;
                    break;
                case 'application/vnd.ogc.gml/3':
                    result = OpenLayers.Format.GML.v3;
                    break;
                case 'text/html':
                case 'text/plain':
                    result = OpenLayers.Format.Text;
                    break;
                case 'application/json':
                    result = OpenLayers.Format.GeoJSON;
                    break;
                default:
                    result = OpenLayers.Format.WMSGetFeatureInfo;
                    break;
            }
            return result;
        }

        return {
            getLayersByWMSCapabilities: function (url) {
                var deferred = $q.defer();
                $http.get(url + "?request=GetCapabilities").success(function (data, status, headers, config) {
                    var format = new OpenLayers.Format.WMSCapabilities();
                    var allLayers = format.read(data).capability.layers;
                    deferred.resolve(allLayers);
                });
                return deferred.promise;
            },
            getWMSFeatures: function (mapInstance, url, layerNames, version, pointEvent, contentType) {
                var infoTextContentType = contentType || 'text/xml';
                var deferred = $q.defer();
                var params = generateRequestParams(mapInstance, pointEvent, version, infoTextContentType);
                if (layerNames.length !== 0) {
                    params = OpenLayers.Util.extend({
                        layers: layerNames,
                        query_layers: layerNames
                    }, params);
                }
                OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function (request) {
                        var format = new (resolveOpenLayersFormatConstructorByInfoFormat(infoTextContentType))();
                        var features = format.read(request.responseText);
                        var geoJsonFormat = new OpenLayers.Format.GeoJSON();
                        var geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            },
            getWMSFeaturesByLayerId: function (mapInstance, url, layerId, point) {
                //This is a modified version of methods used within an OpenLayers control
                //This control was dealing with a data request internally, here we are trying
                //to get extract the data interactions to expose them via this service.
                var getStyleNames = function (layer) {
                    // in the event of a WMS layer bundling multiple layers but not
                    // specifying styles,we need the same number of commas to specify
                    // the default style for each of the layers.  We can't just leave it
                    // blank as we may be including other layers that do specify styles.
                    var styleNames;
                    if (layer.params.STYLES) {
                        styleNames = layer.params.STYLES;
                    } else {
                        if (OpenLayers.Util.isArray(layer.params.LAYERS)) {
                            styleNames = new Array(layer.params.LAYERS.length);
                        } else {
                            styleNames = layer.params.LAYERS.toString().replace(/[^,]/g, "");
                        }
                    }
                    return styleNames;
                };
                var deferred = $q.defer();
                var layerNames = [], styleNames = [];
                var layers = [mapInstance.getLayersBy('id', layerId)[0]];
                for (var i = 0, len = layers.length; i < len; i++) {
                    if (layers[i].params.LAYERS != null) {
                        layerNames = layerNames.concat(layers[i].params.LAYERS);
                        styleNames = styleNames.concat(getStyleNames(layers[i]));
                    }
                }
                var firstLayer = layers[0];
                // use the firstLayer's projection if it matches the map projection -
                // this assumes that all layers will be available in this projection
                var projection = mapInstance.getProjection();
                var layerProj = firstLayer.projection;
                if (layerProj && layerProj.equals(mapInstance.getProjectionObject())) {
                    projection = layerProj.getCode();
                }
                //noinspection JSHint
                var params = OpenLayers.Util.extend({
                        service: "WMS",
                        version: firstLayer.params.VERSION,
                        request: "GetFeatureInfo",
                        exceptions: firstLayer.params.EXCEPTIONS,
                        bbox: mapInstance.getExtent().toBBOX(null,
                            firstLayer.reverseAxisOrder()),
                        feature_count: 100,
                        height: mapInstance.getSize().h,
                        width: mapInstance.getSize().w,
                        format: OpenLayers.Format.WMSGetFeatureInfo,
                        info_format: firstLayer.params.INFO_FORMAT || 'text/xml'
                    }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
                    {
                        crs: projection,
                        i: parseInt(point.x),
                        j: parseInt(point.y)
                    } :
                    {
                        srs: projection,
                        x: parseInt(point.x),
                        y: parseInt(point.y)
                    }
                );
                if (layerNames.length !== 0) {
                    params = OpenLayers.Util.extend({
                        layers: layerNames,
                        query_layers: layerNames,
                        styles: styleNames
                    }, params);
                }
                OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function (request) {
                        var format = new OpenLayers.Format.WMSGetFeatureInfo();
                        var features = format.read(request.responseText);
                        var geoJsonFormat = new OpenLayers.Format.GeoJSON();
                        var geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            }
        };
    }];

//Maintain support for previous version name if used outside the toolkit
    app.service('WMSDataService', olv2DataService);

    app.service('olv2DataService', olv2DataService);
})();

/* global angular, ol, $ */

// OpenLayers V2 is still used here due to better support. This is used only to make data requests so we are not manipulating the map instance itself.
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.mapservices.data.openlayersv3', []);

    var olv2DataService = ['$q', '$http', function ($q, $http) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var projection = mapInstance.getView().getProjection().getCode();
            var bounds = mapInstance.getView().calculateExtent(mapInstance.getSize());
            var olv2Bounds = new OpenLayers.Bounds(bounds[0],bounds[1],bounds[2],bounds[3]);
            var bbox = olv2Bounds.toBBOX();
            var point = (pointEvent instanceof ol.MapBrowserPointerEvent) ? pointEvent.pixel : pointEvent;
            var halfHeight = mapInstance.getSize()[1] / 2;
            var halfWidth = mapInstance.getSize()[0] / 2;

            var centerPoint = [halfWidth, halfHeight];

            var requestWidth = mapInstance.getSize()[0];
            var requestHeight = mapInstance.getSize()[1];

            var finalPoint = {
                x: point[0],
                y: point[1]
            };
            var newBounds;
            // Split the screen into a quadrant and re-calculate the bounding box, WMS has issues with screen width of greater than 2050
            if (mapInstance.getSize()[0] >= 2050) {
                if (point[0] > centerPoint[0]) {
                    // right
                    if (point[1] > centerPoint[1]) {
                        // bottom
                        var topLeft = mapInstance.getCoordinateFromPixel([centerPoint[0], centerPoint[1]]);
                        var bottomRight = mapInstance.getCoordinateFromPixel([mapInstance.getSize()[0], mapInstance.getSize()[1]]);
                        newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]);

                        finalPoint.x = point[0] - halfWidth;
                        finalPoint.y = point[1] - halfHeight;
                    } else {
                        // top
                        var topLeft = mapInstance.getCoordinateFromPixel([centerPoint[0], 0]);
                        var bottomRight = mapInstance.getCoordinateFromPixel([mapInstance.getSize()[0], mapInstance.getSize()[1]]);
                        newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]);

                        finalPoint.x = point[0] - halfWidth;
                    }
                } else {
                    // left
                    if (point[1] > centerPoint[1]) {
                        // bottom
                        var topLeft = mapInstance.getCoordinateFromPixel([0, centerPoint[1]]);
                        var bottomRight = mapInstance.getCoordinateFromPixel([centerPoint[0], mapInstance.getSize()[1]]);
                        newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]);

                        finalPoint.y = point[1] - halfHeight;
                    } else {
                        // top
                        var topLeft = mapInstance.getCoordinateFromPixel([0, 0]);
                        var bottomRight = mapInstance.getCoordinateFromPixel([centerPoint[0], centerPoint[1]]);
                        newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]);
                    }
                }
                bbox = newBounds.toBBOX();
                requestHeight = Math.floor(halfHeight);
                requestWidth = Math.floor(halfWidth);
            }
            
            var params = OpenLayers.Util.extend({
                    service: "WMS",
                    version: version,
                    request: "GetFeatureInfo",
//					exceptions: firstLayer.params.EXCEPTIONS,
                    bbox: bbox,
                    feature_count: 100,
                    height: requestHeight,
                    width: requestWidth,
                    format: OpenLayers.Format.WMSGetFeatureInfo,
                    info_format: infoTextContentType
                }, (parseFloat(version) >= 1.3) ?
                {
                    crs: projection,
                    i: parseInt(finalPoint.x),
                    j: parseInt(finalPoint.y)
                } :
                {
                    srs: projection,
                    x: parseInt(finalPoint.x),
                    y: parseInt(finalPoint.y)
                }
            );
            return params;
        }

        function resolveOpenLayersFormatConstructorByInfoFormat(infoFormat) {
            var result;
            var infoType;
            if (infoFormat && typeof infoFormat === 'string' && infoFormat.indexOf('application/vnd.ogc.gml/3') === 0) {
                infoType = 'application/vnd.ogc.gml/3';
            } else {
                infoType = infoFormat;
            }
            switch (infoType) {
                case 'application/vnd.ogc.gml':
                    result = OpenLayers.Format.GML.v2;
                    break;
                case 'application/vnd.ogc.gml/3':
                    result = OpenLayers.Format.GML.v3;
                    break;
                case 'text/html':
                case 'text/plain':
                    result = OpenLayers.Format.Text;
                    break;
                case 'application/json':
                    result = OpenLayers.Format.GeoJSON;
                    break;
                default:
                    result = OpenLayers.Format.WMSGetFeatureInfo;
                    break;
            }
            return result;
        }

        return {
            getLayersByWMSCapabilities: function (url) {
                var deferred = $q.defer();
                $http.get(url + "?request=GetCapabilities").success(function (data, status, headers, config) {
                    var format = new OpenLayers.Format.WMSCapabilities();
                    var allLayers = format.read(data).capability.layers;
                    deferred.resolve(allLayers);
                });
                return deferred.promise;
            },
            getWMSFeatures: function (mapInstance, url, layerNames, version, pointEvent, contentType) {
                var infoTextContentType = contentType || 'text/xml';
                var deferred = $q.defer();
                var params = generateRequestParams(mapInstance, pointEvent, version, infoTextContentType);
                if (layerNames.length !== 0) {
                    
                    params = OpenLayers.Util.extend({
                        layers: layerNames,
                        query_layers: layerNames
//					styles: styleNames
                    }, params);
                }
                OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function (request) {
                        var format = new (resolveOpenLayersFormatConstructorByInfoFormat(infoTextContentType))();
                        var features = format.read(request.responseText);
                        var geoJsonFormat = new OpenLayers.Format.GeoJSON();
                        var geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            },
            getWMSFeaturesByLayerId: function (mapInstance, url, layerId, point) {
                //This is a modified version of methods used within an OpenLayers control
                //This control was dealing with a data request internally, here we are trying
                //to get extract the data interactions to expose them via this service.
                var getStyleNames = function (layer) {
                    // in the event of a WMS layer bundling multiple layers but not
                    // specifying styles,we need the same number of commas to specify
                    // the default style for each of the layers.  We can't just leave it
                    // blank as we may be including other layers that do specify styles.
                    var styleNames;
                    if (layer.getParams().STYLES) {
                        styleNames = layer.getParams().STYLES;
                    } else {
                        if (OpenLayers.Util.isArray(layer.getParams().LAYERS)) {
                            styleNames = new Array(layer.getParams().LAYERS.length);
                        } else {
                            styleNames = layer.getParams().LAYERS.toString().replace(/[^,]/g, "");
                        }
                    }
                    return styleNames;
                };
                var deferred = $q.defer();
                var layerNames = [], styleNames = [];
                var layers = [mapInstance.getLayersBy('id', layerId)[0]];
                for (var i = 0, len = layers.length; i < len; i++) {
                    if (layers[i].getParams().LAYERS != null) {
                        layerNames = layerNames.concat(layers[i].getParams().LAYERS);
                        styleNames = styleNames.concat(getStyleNames(layers[i]));
                    }
                }
                var firstLayer = layers[0];
                // use the firstLayer's projection if it matches the map projection -
                // this assumes that all layers will be available in this projection
                var projection = mapInstance.getView().getProjection().getCode();

                var params = OpenLayers.Util.extend({
                        service: "WMS",
                        version: firstLayer.getParams().VERSION,
                        request: "GetFeatureInfo",
                        bbox: mapInstance.getExtent().toBBOX(null),
                        feature_count: 100,
                        height: mapInstance.getSize()[1],
                        width: mapInstance.getSize()[0],
                        format: OpenLayers.Format.WMSGetFeatureInfo,
                        info_format: firstLayer.params.INFO_FORMAT || 'text/xml'
                    }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
                    {
                        crs: projection,
                        i: parseInt(point.x),
                        j: parseInt(point.y)
                    } :
                    {
                        srs: projection,
                        x: parseInt(point.x),
                        y: parseInt(point.y)
                    }
                );
                if (layerNames.length !== 0) {
                    
                    params = OpenLayers.Util.extend({
                        layers: layerNames,
                        query_layers: layerNames,
                        styles: styleNames
                    }, params);
                }
                OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function (request) {
                        var format = new OpenLayers.Format.WMSGetFeatureInfo();
                        var features = format.read(request.responseText);
                        var geoJsonFormat = new OpenLayers.Format.GeoJSON();
                        var geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            }
        };
    }];

    app.service('olv3DataService', olv2DataService);
})();

var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

var app = angular.module('gawebtoolkit.mapservices.layer.openlayersv2', []);

/*
 * This service wraps olv2 layer functionality that is used via the GAMaps and GALayer service
 * */
app.service('olv2LayerService', [ '$log', '$q','$timeout', function ($log, $q,$timeout) {
    'use strict';
    var service = {
        xyzTileCachePath: "/tile/${z}/${y}/${x}",
        createLayer: function (args) {
            var layer;
            //var options = service.defaultLayerOptions(args);
            switch (args.layerType) {
                case 'WMS':
                    layer = service.createWMSLayer(args);
                    break;
                case 'XYZTileCache':
                    layer = service.createXYZLayer(args);
                    break;
                case 'ArcGISCache':
                    layer = service.createArcGISCacheLayer(args);
                    break;
                case 'Vector':
                    layer = service.createFeatureLayer(args);
                    break;
                case 'GoogleStreet':
                case 'GoogleHybrid':
                case 'GoogleSatellite':
                case 'GoogleTerrain':
                    //Deprecated
                    layer = service.createGoogleMapsLayer(args);
                    break;
                default:
                    throw new Error(
                            "Invalid layerType used to create layer of name " +
                            args.layerName +
                            " - with layerType - " +
                            args.layerType
                    );
            }
			layer.geoLayerType = args.layerType;
            return layer;
        },
        createGoogleLayer: function (args) {
            if(args.layerType == null) {
                throw new Error("'layerType' not specified for creating a Google Maps layer. Please specify a valid layer type, eg 'hybrid");
            }
            var googleLayerType;
            switch(args.layerType.toLocaleLowerCase()) {
                case 'hybrid':
                    googleLayerType = google.maps.MapTypeId.HYBRID;
                    break;
                case 'satellite':
                    googleLayerType = google.maps.MapTypeId.SATELLITE;
                    break;
                case 'street':
                    googleLayerType = google.maps.MapTypeId.STREET;
                    break;
                case 'terrain':
                    googleLayerType = google.maps.MapTypeId.TERRAIN;
                    break;
                default:
                    googleLayerType = google.maps.MapTypeId.HYBRID;
                    break;
            }

            var options = {
                visibility: args.visibility === true || args.visibility === 'true',
                type: googleLayerType
            };
            return new OpenLayers.Layer.Google(args.layerType, options);
        },
        createBingLayer: function (args) {
            var bingLayerType;
            var bingLayerName = args.layerName;
            switch(args.layerType.toLocaleLowerCase()) {
                case 'aerial':
                    bingLayerType = 'Aerial';
                    bingLayerName = bingLayerName || 'Bing Aerial';
                    break;
                case 'aerialwithlabels':
                    bingLayerType = 'AerialWithLabels';
                    bingLayerName = bingLayerName || 'Bing Aerial With Labels';
                    break;
                case 'birdseye':
                    bingLayerType = 'Birdseye';
                    bingLayerName = bingLayerName || 'Bing Birdseye';
                    break;
                case 'birdseyewithlabels':
                    bingLayerType = 'BirdseyeWithLabels';
                    bingLayerName = bingLayerName || 'Bing Birdseye With Labels';
                    break;
                case 'road':
                    bingLayerType = 'Road';
                    bingLayerName = bingLayerName || 'Bing Roads';
                    break;
                default:
                    bingLayerType = 'Road';
                    bingLayerName = bingLayerName || 'Bing Roads';
                    break;
            }
            var result = new OpenLayers.Layer.Bing({
                key: args.bingApiKey,
                type: bingLayerType,
                name: bingLayerName,
                visibility: args.visibility === true || args.visibility === 'true'
            });
            result.wrapDateLine = args.wrapDateLine || false;
            return result;
        },
        createOsmLayer: function (args) {
            var result = new OpenLayers.Layer.OSM(args.layerName || "OpenCycleMap");
            result.wrapDateLine = args.wrapDateLine || false;
            result.visibility = args.visibility === true || args.visibility === 'true';
            return result;
        },
        createFeatureLayer: function (args) {
            // Truthy coercion with visibility causes issues possible bug in open layers,
            // 1 is true and 0 is false seems to always work
            // args.serverType defaults to WFS, implementation should support others eg, geoJson
            //If args.url is not provided, give blank layer that supports features.
            var layer;

            if (args.url == null) {
                layer = new OpenLayers.Layer.Vector(args.layerName);
            } else {
                service.postAddLayerCache = service.postAddLayerCache || [];
                //TODO remove fixed style, should default out of config
                layer = new OpenLayers.Layer.Vector(args.layerName, {
                    strategies: [ new OpenLayers.Strategy.Fixed() ],
                    styleMap: new OpenLayers.StyleMap({
                        'default': new OpenLayers.Style({
                            pointRadius: '10',
                            fillOpacity: 0.6,
                            fillColor: '#ffcc66',
                            strokeColor: '#cc6633'
                        }),
                        'select': {
                            fillColor: '#8aeeef'
                        }
                    }),
                    protocol: new OpenLayers.Protocol.WFS({
                        url: args.url,
                        featureType: args.wfsFeatureType,
                        featurePrefix: args.wfsFeaturePrefix,
                        version: args.wfsVersion,
                        geometryName: args.wfsGeometryName,
                        srsName: args.datumProjection
                    }),
                    visibility: args.visibility
                });
            }
            if (args.postAddLayer != null) {
                service.postAddLayerCache[layer.id] = args.postAddLayer;
            }
			//Clean up any references to layers that no longer exist.


            return layer;
        },
        createGoogleMapsLayer: function (args) {
            var googleLayerType;
            switch (args.layerType) {
                case 'GoogleStreet':
                    googleLayerType = google.maps.MapTypeId.STREET;
                    break;
                case 'GoogleHybrid':
                    googleLayerType = google.maps.MapTypeId.HYBRID;
                    break;
                case 'GoogleSatellite':
                    googleLayerType = google.maps.MapTypeId.SATELLITE;
                    break;
                case 'GoogleTerrain':
                    googleLayerType = google.maps.MapTypeId.TERRAIN;
                    break;
            }

            var options = {
                wrapDateLine: args.wrapDateLine,
                transitionEffect: args.transitionEffect,
                visibility: args.visibility === true || args.visibility === 'true',
                isBaseLayer: args.isBaseLayer === true || args.isBaseLayer === 'true',
                tileSize: args.tileSize(args.tileType),
                sphericalMercator: args.sphericalMercator,
                centerPosition: args.centerPosition,
                attribution: args.layerAttribution,
                numZoomLevels: 20,
                type: googleLayerType,
                animationEnabled: true
            };
            return new OpenLayers.Layer.Google(args.layerName, options);
        },
        clearFeatureLayer: function (mapInstance, layerId) {

        },
        createXYZLayer: function (args) {
            //TODO incorporate default options to args via extend
            var resultArgs = {
                layerName: args.layerName,
                layerUrl: args.layerUrl,
                options: {
                    wrapDateLine: args.wrapDateLine,
                    transitionEffect: args.transitionEffect,
                    visibility: args.visibility === true || args.visibility === 'true',
                    isBaseLayer: args.isBaseLayer === true || args.isBaseLayer === 'true',
                    tileSize: args.tileSize(args.tileType),
                    sphericalMercator: args.sphericalMercator,
                    centerPosition: args.centerPosition,
                    attribution: args.layerAttribution,
                    opacity: args.opacity
                }
            };
            
            if(resultArgs.options.isBaseLayer) {
                if(args.resolutions) {
                    resultArgs.options.resolutions = args.resolutions;
                }
                if(args.zoomOffset) {
                    resultArgs.options.zoomOffset = args.zoomOffset;
                }
            }

            if (args.maxZoomLevel != null) {
                if (args.maxZoomLevel.length > 0) {
	            	resultArgs.options.numZoomLevels = parseInt(args.maxZoomLevel) ;
                }
            }    
            
            return new OpenLayers.Layer.XYZ(resultArgs.layerName, resultArgs.layerUrl + service.xyzTileCachePath, resultArgs.options);
        },
        createWMSLayer: function (args) {
            //TODO incorporate default options to args via extend
            var resultArgs = {
                layerName: args.layerName,
                layerUrl: args.layerUrl,
                layers: args.layers,
                wrapDateLine: args.wrapDateLine,
                visibility: args.visibility === true || args.visibility === 'true',
                isBaseLayer: args.isBaseLayer === true || args.isBaseLayer === 'true',
                transitionEffect: args.transitionEffect,
                tileSize: args.tileSize(args.tileType),
                sphericalMercator: args.sphericalMercator,
                tileType: args.tileType,
                projection: args.datumProjection,
                transparent: args.transparent,
                attribution: args.layerAttribution,
                opacity: args.opacity
                //centerPosition: args.centerPosition
            };
            
            if (args.maxZoomLevel != null) {
                if (args.maxZoomLevel.length > 0) {
	            	resultArgs.numZoomLevels = parseInt(args.maxZoomLevel) ;
                }
            }

            return new OpenLayers.Layer.WMS(resultArgs.layerName, resultArgs.layerUrl, {
                layers: resultArgs.layers,
                format: resultArgs.format,
                transparent: resultArgs.transparent
            }, resultArgs);
        },
        createArcGISCacheLayer: function (args) {
            //TODO incorporate default options to args via extend
            var deferred = $q.defer();
            var jsonp = new OpenLayers.Protocol.Script();
            //Due to the way OpenLayers.Protocol.Script works with a adding a new script tag to the head
            //of the page, we have to manually set a timeout here for 404 layers
            var scriptTimeout = $timeout(function () {
                deferred.reject("LayerTimeout");
            }, 10000);
            jsonp.createRequest(args.layerUrl, {
                f: 'json',
                pretty: 'true'
            }, function (data) {
                //cancel timeout
                $timeout.cancel(scriptTimeout);
                if(data.error != null && data.error.code != null) {
                    deferred.reject('LayerError - ' + data.error.code);
                    return;
                }
                var resultArgs = {
                    layerName: args.layerName,
                    layerUrl: args.layerUrl,
                    options: {
                        transitionEffect: args.transitionEffect,
                        visibility: args.visibility === true || args.visibility === 'true',
                        isBaseLayer: args.isBaseLayer === true || args.isBaseLayer === 'true',
                        tileSize: args.tileSize(),
                        alwaysInRange: false,
                        displayInLayerSwitcher: false,
                        opacity: args.opacity,
                        attribution: args.layerAttribution
                    }
                };

                if (args.maxZoomLevel != null) {
                    if (args.maxZoomLevel.length > 0) {
    	            	resultArgs.options.numZoomLevels = parseInt(args.maxZoomLevel);
                    }
                }
                //TODO server can respond with a 200 status code even with an error. Needs to be handled.
                if (data) {
                    resultArgs.options.layerInfo = data;
                    if (resultArgs.options.numZoomLevels == null) {
                    	resultArgs.options.numZoomLevels = data.tileInfo.lods.length + 1;
                    }
                }

                var layerResult = new OpenLayers.Layer.ArcGISCache(resultArgs.layerName, resultArgs.layerUrl, resultArgs.options);
                deferred.resolve(layerResult);
            });

            return deferred.promise;
        },
        defaultLayerOptions: function (args, config) {
            var layerOptions = angular.extend(config.defaultOptions, args);
            layerOptions.centerPosition = service.parselatLong(layerOptions.centerPosition);
            return layerOptions;
        },
		cleanupLayer: function (mapInstance, layerId) {
            if(mapInstance.layers == null || mapInstance.layers.length === 0) {
                return;
            }
            var layer = service.getLayerById(mapInstance, layerId);
			if(layer != null) {
				mapInstance.removeLayer(layer);
			}
		},
        createFeature: function (mapInstance, geoJson) {
			var reader;
			if(mapInstance.projection !== geoJson.crs.properties.name) {
				reader = new OpenLayers.Format.GeoJSON({
					'externalProjection': geoJson.crs.properties.name,
					'internalProjection': mapInstance.projection
				});
			} else {
				reader = new OpenLayers.Format.GeoJSON();
			}

            return reader.read(angular.toJson(geoJson), geoJson.type);
        },
        addFeatureToLayer: function (mapInstance, layerId, feature) {
            var layer = service.getLayerById(mapInstance, layerId);

            if (feature instanceof Array) {
                layer.addFeatures(feature);
            } else {
                layer.addFeatures([ feature ]);
            }
            var writer = new OpenLayers.Format.GeoJSON();
            var featureDto = angular.fromJson(writer.write(feature));
            featureDto.id = feature.id;
            return featureDto;
        },
        parselatLong: function (latlong) {
            if (!latlong) {
                return null;
            }
            return angular.fromJson(latlong);
        },
        //Should this be labeled as an internal method?
        getLayerById: function (mapInstance, layerId) {
            var currentLayer;

            for (var i = 0; i < mapInstance.layers.length; i++) {
                if (mapInstance.layers[i].id === layerId) {
                    currentLayer = mapInstance.layers[i];
                    break;
                }
            }

            return currentLayer;
        },
        //Should this be labeled as an internal method?
        removeLayerByName: function (mapInstance, layerName) {
            // If more than one layer has the same name then only the first will be destroyed
            var layers = mapInstance.getLayersByName(layerName);

            if (layers.length > 0) {
                mapInstance.removeLayer(layers[0]);
            }
        },
        //Should this be labeled as an internal method?
        removeLayersByName: function (mapInstance, layerName) {
            // Destroys all layers with the specified layer name
            var layers = mapInstance.getLayersByName(layerName);
            for (var i = 0; i < layers.length; i++) {
                mapInstance.removeLayer(layers[i]);
            }
        },
        //Deprecated. Anything using this method needs to change.
        //If external, to use removeLayerById
        //If internal to olv2server, just use olv2 removeLayer method
        removeLayer: function (mapInstance, layerInstance) {
            mapInstance.removeLayer(layerInstance);
        },
        removeLayerById: function (mapInstance, layerId) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            mapInstance.removeLayer(layer);
        },
        removeFeatureFromLayer: function (mapInstance, layerId, featureId) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            var feature = layer.getFeatureById(featureId);
            layer.removeFeatures(feature);
        },
        registerFeatureSelected: function (mapInstance, layerId, callback, element) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            var layerType = layer.geoLayerType;
            var layerProtocol;
            if (layerType === 'WMS') {
                layerProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(layer);
            }
            var control = mapInstance.getControl("ctrlGetFeature");
            if (control) {
                mapInstance.removeControl(control);
            }

            control = new OpenLayers.Control.GetFeature({
                protocol: layerProtocol,
                box: true,
                hover: true,
                multipleKey: "shiftKey",
                toggleKey: "ctrlKey"
            });
            control.metadata = control.metadata || {};
            control.metadata.type = 'getfeature';
            control.events.register("featureselected", element, callback);
            return {
                id: "ctrlGetFeature", //Only one at a time
                name: "getfeature"
            };
        },
        registerLayerEvent: function (mapInstance, layerId, eventName, callback) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            layer.events.register(eventName, layer, callback);
        },
        unRegisterLayerEvent: function (mapInstance, layerId, eventName, callback) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            layer.events.unregister(eventName,layer,callback);
        },
        //Should this be moved to a separate service as it is more of a helper?
        getMarkerCountForLayerName: function (mapInstance, layerName) {
            var layers = mapInstance.getLayersByName(layerName);
            var count = 0;
            if (layers.length > 0) {
                // Returns count of markers for the first marker layer

                count = layers[0].markers == null ?
                    0 :
                    layers[0].markers.length;
            }
            return count;
        },
        filterFeatureLayer: function (mapInstance, layerId, filterValue, featureAttributes) {
            var layer = service.getLayerById(mapInstance, layerId);
            var filterArray = service.parseFeatureAttributes(featureAttributes);
            var olFilters = [];

            for (var i = 0; i < filterArray.length; i++) {
                olFilters.push(new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LIKE,
                    property: filterArray[i],
                    matchCase: false,
                    value: filterValue.toUpperCase() + '*'
                }));
            }

            var filter = new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.OR,
                filters: olFilters
            });

            if (filter.filters.length === 1) {
                layer.filter = olFilters[0];
                layer.refresh({
                    force: true
                });
            } else {
                layer.filter = filter;
                layer.refresh({
                    force: true
                });
            }
        },
        parseFeatureAttributes: function (featureAttributes) {
            if (!featureAttributes) {
                return null;
            }

            var results = [];
            if (featureAttributes.indexOf(',') === -1) {
                results.push(featureAttributes);
            } else {
                results = featureAttributes.split(',');
            }

            return results;
        },
        getLayerFeatures: function (mapInstance, layerId) {
            var features = [];

            var layer = service.getLayerById(mapInstance, layerId);

            for (var i = 0; i < layer.features.length; i++) {
                features.push(layer.features[i]);
            }

            return features;
        },
        raiseLayerDrawOrder: function (mapInstance, layerId, delta) {
            var layer = service.getLayerById(mapInstance, layerId);
            mapInstance.raiseLayer(layer, delta);
        },
        postAddLayerCache: {}
    };
    return service;
} ]);
/* global angular, ol, $, google*/

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.layer.openlayersv3', []);

    /*
     * This service wraps olv3 layer functionality that is used via the GAMaps and GALayer service
     * */
    app.service('olv3LayerService', [ '$log', '$q','$timeout', 'GeoLayer','GAWTUtils', function ($log, $q,$timeout,GeoLayer,GAWTUtils) {
        var service = {
            xyzTileCachePath: "/tile/{z}/{y}/{x}",
            createLayer: function (args) {
                var layer;
                //var options = service.defaultLayerOptions(args);
                switch (args.layerType) {
                    case 'WMS':
                        layer = service.createWMSLayer(args);
                        break;
                    case 'XYZTileCache':
                        layer = service.createXYZLayer(args);
                        break;
                    case 'ArcGISCache':
                        layer = service.createArcGISCacheLayer(args);
                        break;
                    case 'Vector':
                        layer = service.createFeatureLayer(args);
                        break;
                    case 'GoogleStreet':
                    case 'GoogleHybrid':
                    case 'GoogleSatellite':
                    case 'GoogleTerrain':
                        throw new Error("Google map layers are not supported with OpenLayers 3. To use a Google maps layer, consider falling back to framework 'olv2'.");
                    default:
                        throw new Error(
                            "Invalid layerType used to create layer of name " +
                            args.layerName +
                            " - with layerType - " +
                            args.layerType
                        );
                }
                layer.geoLayerType = args.layerType;
                if(args.maxZoomLevel) {
                    layer.geoMaxZoom = parseInt(args.maxZoomLevel);
                }
                if(args.minZoomLevel) {
                    layer.geoMinZoom = parseInt(args.minZoomLevel);
                }

                return layer;
            },
            createFeatureLayer: function (args) {
                // Truthy coercion with visibility causes issues possible bug in open layers,
                // 1 is true and 0 is false seems to always work
                // args.serverType defaults to WFS, implementation should support others eg, geoJson
                //If args.url is not provided, give blank layer that supports features.
                var layer;

                if (args.url == null) {
                    layer = new ol.layer.Vector({ source: new ol.source.Vector(), format: new ol.format.GeoJSON() });
                } else {
                    service.postAddLayerCache = service.postAddLayerCache || [];
                    //TODO remove fixed style, should default out of config
                    //Place holder style
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.6)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#319FD3',
                            width: 1
                        }),
                        text: new ol.style.Text({
                            font: '12px Calibri,sans-serif',
                            fill: new ol.style.Fill({
                                color: '#000'
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#fff',
                                width: 3
                            })
                        })
                    });

                    layer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            url: args.url,
                            format: new ol.format.GeoJSON(),
                            style: style
                        })
                    });
                }
                //TODO Layer IDs are not provided by OLV3, UUIDs should be generated for each layer created.
                /*if (args.postAddLayer != null) {
                    service.postAddLayerCache[layer.id] = args.postAddLayer;
                }*/
                //Clean up any references to layers that no longer exist.
                layer.set('name',args.layerName);
                layer.set('isBaseLayer', args.isBaseLayer || false);

                return layer;
            },
            createGoogleLayer: function (args) {
                throw new Error("Google map layers are not supported with OpenLayers 3. To use a Google maps layer, consider falling back to framework 'olv2'.");
            },
            createBingLayer: function (args) {
                var bingLayerType;
                var bingLayerName = args.layerName;
                switch(args.layerType.toLocaleLowerCase()) {
                    case 'aerial':
                        bingLayerType = 'Aerial';
                        bingLayerName = bingLayerName || 'Bing Aerial';
                        break;
                    case 'aerialwithlabels':
                        bingLayerType = 'AerialWithLabels';
                        bingLayerName = bingLayerName || 'Bing Aerial With Labels';
                        break;
                    case 'birdseye':
                        bingLayerType = 'Birdseye';
                        bingLayerName = bingLayerName || 'Bing Birdseye';
                        break;
                    case 'birdseyewithlabels':
                        bingLayerType = 'BirdseyeWithLabels';
                        bingLayerName = bingLayerName || 'Bing Birdseye With Labels';
                        break;
                    case 'road':
                        bingLayerType = 'Road';
                        bingLayerName = bingLayerName || 'Bing Roads';
                        break;
                    default:
                        bingLayerType = 'Road';
                        break;
                }
                var layer = new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        key: args.bingApiKey,
                        imagerySet: bingLayerType
                    })
                });

                layer.set('name',bingLayerName);
                layer.setVisible(args.visibility === true || args.visibility === 'true');
                return layer;
            },
            createOsmLayer: function (args) {
                var layer =  new ol.layer.Tile({
                    source: new ol.source.OSM()
                });
                layer.setVisible(args.visibility === true || args.visibility === 'true');
                return layer;
            },
            clearFeatureLayer: function (mapInstance, layerId) {

            },
            createXYZLayer: function (args) {
                var sourceOptions = {
                    url: args.layerUrl + service.xyzTileCachePath,
                    crossOrigin: '*/*'
                };

                if(args.layerAttribution != null) {
                    sourceOptions.attributions = [new ol.Attribution({
                        html: args.layerAttribution
                    })];
                }

                var layerOptions = {
                    opacity: args.opacity,
                    source: new ol.source.XYZ(sourceOptions),
                    visible: args.visibility === true || args.visibility === 'true'
                };

                var result = new ol.layer.Tile(layerOptions);
                result.set('name',args.layerName);
                result.set('isBaseLayer', args.isBaseLayer || false);
                // Due to the lack of support for ids or names from OLV3, inject the name parsed from the directive.
                // More info at - https://github.com/openlayers/ol3/issues/2907
                return result;
            },
            createWMSLayer: function (args) {
                var sourceOptions = {};
                sourceOptions.url = args.layerUrl;

                sourceOptions.crossOrigin = 'anonymous';
                sourceOptions.params = {
                    'LAYERS': args.layers,
                    'TILED': true
                };
                if(args.format) {
                    sourceOptions.params.FORMAT = args.format;
                }

                //default wrap
                sourceOptions.wrapX = true;
                if(args.wrapDateLine != null) {
                    sourceOptions.wrapX = args.wrapDateLine === 'true' || args.wrapDateLine === true;
                }

                sourceOptions.serverType = ('mapserver');

                if(args.layerAttribution != null) {
                    sourceOptions.attributions = [new ol.Attribution({
                        html: args.layerAttribution
                    })];
                }


                var wmsSource = new ol.source.TileWMS(sourceOptions);
                var layerOptions = {};

                layerOptions.source = wmsSource;
                layerOptions.visible = args.visibility === 'true' || args.visibility === true;
                layerOptions.opacity = args.opacity;
                var result = new ol.layer.Tile(layerOptions);
                // Due to the lack of support for ids or names from OLV3, inject the name parsed from the directive.
                // More info at - https://github.com/openlayers/ol3/issues/2907
                result.set('name',args.layerName);
                result.set('isBaseLayer', args.isBaseLayer || false);
                return result;
            },
            createArcGISCacheLayer: function (args) {
                var sourceOptions = {
                    url: args.layerUrl + service.xyzTileCachePath,
                    crossOrigin: '*/*'
                };

                var layerOptions = {
                    opacity: args.opacity,
                    source: new ol.source.XYZ(sourceOptions),
                    visible: args.visibility === true || args.visibility === 'true'
                };
                var result = new ol.layer.Tile(layerOptions);
                result.set('name',args.layerName);
                result.set('isBaseLayer', args.isBaseLayer || false);
                return result;
            },
            defaultLayerOptions: function (args, config) {
                var layerOptions = angular.extend(config.defaultOptions, args);
                layerOptions.centerPosition = service.parselatLong(layerOptions.centerPosition);
                return layerOptions;
            },
            cleanupLayer: function (mapInstance, layerId) {
                var layer = service.getLayerBy(mapInstance,'id',layerId);
                if(layer != null) {
                    mapInstance.removeLayer(layer);
                }
            },
            createFeature: function (mapInstance, geoJson) {
                var reader;
                if(mapInstance.getView().getProjection() !== geoJson.crs.properties.name) {
                    reader = new ol.format.GeoJSON({
                        'defaultDataProjection': geoJson.crs.properties.name
                    });
                } else {
                    reader = new new ol.format.GeoJSON({
                        'defaultDataProjection': mapInstance.getView().getProjection()
                    });
                }

                return reader.readFeature(angular.toJson(geoJson), {
                    'dataProjection': geoJson.crs.properties.name,
                    'featureProjection': mapInstance.getView().getProjection()
                });
            },
            addFeatureToLayer: function (mapInstance, layerId, feature) {
                var layer = service.getLayerById(mapInstance, layerId);
                var source = layer.getSource();
                if(typeof source.getFeatures !== 'function') {
                    throw new Error('Layer does not have a valid source for features.');
                }
                var writer = new ol.format.GeoJSON();
                var featureJson;
                if (feature instanceof Array) {
                    source.addFeatures(feature);
                    featureJson = writer.writeFeatures(feature);
                } else {
                    source.addFeature(feature);
                    featureJson = writer.writeFeature(feature);
                }

                var featureDto = angular.fromJson(featureJson);
                feature.id = feature.getId() || GAWTUtils.generateUuid();
                featureDto.id = feature.id;
                return featureDto;
            },
            parselatLong: function (latlong) {
                if (!latlong) {
                    return null;
                }
                return angular.fromJson(latlong);
            },
            //Should this be labeled as an internal method?
            getLayerById: function (mapInstance, layerId) {
                return service.getLayerBy(mapInstance,'id',layerId);
            },
            getLayerBy: function (mapInstance, propertyName, propertyValue) {

                var layer = null;
                var foundResult = false;
                mapInstance.getLayers().forEach(function (lyr) {
                    if (propertyValue === lyr.get(propertyName) && foundResult === false) {
                        layer = lyr;
                        foundResult = true;
                    }
                });
                return layer;
            },
            getLayerByName: function (mapInstance,layerName) {
                // If more than one layer has the same name then only the first will be destroyed
                return service.getLayerBy(mapInstance,'name',layerName);
            },
            getLayersBy: function (mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers();
                var results = [];
                layers.forEach(function (layer) {
                    var propVal = layer.get(propertyName);
                    if(propVal && propVal.indexOf(propertyValue) !== -1) {
                        results.push(GeoLayer.fromOpenLayersV3Layer(layer));
                    }
                });
                return results;
            },
            _getLayersBy: function (mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers();
                var results = [];
                layers.forEach(function (layer) {
                    var propVal = layer.get(propertyName);
                    if(propVal && propVal.indexOf(propertyValue) !== -1) {
                        results.push(layer);
                    }
                });
                return results;
            },
            //Should this be labeled as an internal method?
            removeLayerByName: function (mapInstance, layerName) {
                // If more than one layer has the same name then only the first will be destroyed
                var layers = service._getLayersBy(mapInstance,'name', layerName);
                if (layers.length > 0) {
                    mapInstance.removeLayer(layers[0]);
                }
            },
            //Should this be labeled as an internal method?
            removeLayersByName: function (mapInstance, layerName) {
                // Destroys all layers with the specified layer name
                var layers = service._getLayersBy(mapInstance,'name', layerName);
                for (var i = 0; i < layers.length; i++) {
                    mapInstance.removeLayer(layers[i]);
                }
            },
            //Deprecated. Anything using this method needs to change.
            //If external, to use removeLayerById
            //If internal to olv2server, just use olv2 removeLayer method
            removeLayer: function (mapInstance, layerInstance) {
                mapInstance.removeLayer(layerInstance);
            },
            removeLayerById: function (mapInstance, layerId) {
                var layer = service._getLayersBy(mapInstance,'id', layerId)[0];
                mapInstance.removeLayer(layer);
            },
            removeFeatureFromLayer: function (mapInstance, layerId, featureId) {
                var layer = service.getLayerById(mapInstance, layerId);
                var features = layer.getSource().getFeatures();
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if(feature.id === featureId) {
                        layer.getSource().removeFeature(feature);
                        break;
                    }
                }
            },
            registerFeatureSelected: function (mapInstance, layerId, callback, element) {
                service.registeredInteractions = service.registeredInteractions || [];
                for (var i = 0; i < service.registeredInteractions.length; i++) {
                    var interaction = service.registeredInteractions[i];
                    if(interaction.id === '' + layerId + '_features') {
                        //Remove existing, limitation, only one feature selection event at once...?
                        mapInstance.removeInteraction(interaction.select);
                    }
                }
                var selectClick = new ol.interaction.Select({
                    condition: ol.events.condition.click
                });
                selectClick.on('select', function (e) {
                    if(e.target.get('id') === layerId) {
                        callback(e);
                    }
                });
                service.registeredInteractions.push({
                    id: layerId + '_features',
                    select: selectClick
                });
                mapInstance.addInteraction(selectClick);
            },
            registerLayerEvent: function (mapInstance, layerId, eventName, callback) {
                //$log.info(layerId);
                var layer = service.getLayerBy(mapInstance,'id', layerId);
                layer.getSource().on(eventName,callback);
            },
            unRegisterLayerEvent: function (mapInstance, layerId, eventName, callback) {
                //$log.info(layerId);
                var layer = service.getLayerBy(mapInstance,'id', layerId);
                layer.getSource().un(eventName,callback);
            },
            //Should this be moved to a separate service as it is more of a helper?
            getMarkerCountForLayerName: function (mapInstance, layerName) {
                var layer = service.getLayerBy(mapInstance,'name',layerName);
                return layer == null ? 0 : typeof layer.getSource().getFeatures === "undefined" ? 0 : layer.getSource().getFeatures().length;
            },
            filterFeatureLayer: function (mapInstance, layerId, filterValue) {
                //TODO The value of this function needs to be considered.
                // Varied implementations of filtering (server) makes it hard to wrap.
                // Maybe this should be converted to client side only filtering?
                throw new Error("NotImplementedError");
            },
            parseFeatureAttributes: function (featureAttributes) {
                if (!featureAttributes) {
                    return null;
                }

                var results = [];
                if (featureAttributes.indexOf(',') === -1) {
                    results.push(featureAttributes);
                } else {
                    results = featureAttributes.split(',');
                }

                return results;
            },
            //TODO Returning OL features, should return standard format, not leak implementation
            getLayerFeatures: function (mapInstance, layerId) {
                var features = [];

                var layer = service.getLayerById(mapInstance, layerId);
                var source = layer.getSource();
                if(source.getFeatures == null) {
                    return features;
                }
                var existingFeatures = source.getFeatures();
                for (var i = 0; i < existingFeatures.length; i++) {
                    var f = existingFeatures[i];
                    features.push(f);
                }
                return features;
            },
            raiseLayerDrawOrder: function (mapInstance, layerId, delta) {

                var layer = service.getLayerById(mapInstance, layerId);
                var allLayers = mapInstance.getLayers();
                var layerIndex;
                for (var i = 0; i < allLayers.getLength(); i++) {
                    var currentLayer = allLayers.item(i);
                    if(currentLayer.get('id') === layerId) {
                        layerIndex = i;
                        break;
                    }
                }
                var updatedIndex = layerIndex + delta;
                var layerAtUpdatedIndex = mapInstance.getLayers().getArray()[updatedIndex];
                mapInstance.getLayers().getArray()[updatedIndex] = layer;
                mapInstance.getLayers().getArray()[layerIndex] = layerAtUpdatedIndex;
                mapInstance.updateSize();
            },
            postAddLayerCache: {}
        };
        return service;
    } ]);
})();
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var darwin = darwin || {};
var app = angular.module('gawebtoolkit.mapservices.controls.openlayersv2', [ ]);

app.service('olv2MapControls', [function () {
	"use strict";
	var supportControls = [
		{name:'permalink', constructor: OpenLayers.Control.Permalink},
		{name:'overviewmap', constructor: OpenLayers.Control.OverviewMap},
		{name:'scale', constructor: OpenLayers.Control.Scale},
		{name:'scaleline', constructor: OpenLayers.Control.ScaleLine},
        {name:'panzoombar', constructor: OpenLayers.Control.PanZoomBar},
        {name:'zoomslider', constructor: OpenLayers.Control.PanZoomBar},
        {name:'zoom', constructor: OpenLayers.Control.Zoom},
		{name:'mouseposition', constructor: OpenLayers.Control.MousePosition},
		{name:'attribution', constructor: OpenLayers.Control.Attribution},
		{name:'measureline', constructor: OpenLayers.Control.Measure, customParams: [OpenLayers.Handler.Path]},
		{name:'measurepolygon', constructor: OpenLayers.Control.Measure, customParams: [OpenLayers.Handler.Polygon]},
		{name:'wmsgetfeatureinfo', constructor: OpenLayers.Control.WMSGetFeatureInfo}
	];
	var service = {
		resolveSupportedControl: function (name) {
			var control;
			for (var i = 0; i < supportControls.length; i++) {
				var con = supportControls[i];
				if(con.name === name) {
					control = con;
					break;
				}
			}
			return control;
		},
		createControl: function (name,controlOptions, div) {
			var control;
			if(div && !controlOptions.div) {
				controlOptions.div = div;
			}
			var supportedControl = service.resolveSupportedControl(name);
			if(supportedControl == null || supportedControl.constructor == null) {
				throw new Error("Error in map control construction. Unsupported control or missing source for control constructor.");
			}
			if(supportedControl.customParams) {
				//handle first custom param..
				if(controlOptions) {
					control = new supportedControl.constructor(supportedControl.customParams[0],controlOptions);
				} else {
					control = new supportedControl.constructor(supportedControl.customParams[0]);
				}
			} else {
				if(controlOptions) {
					control = new supportedControl.constructor(controlOptions);
				} else {
					control = new supportedControl.constructor();
				}
			}
			return control;
		},
        registerControl: function (name, constructor) {
            supportControls.push({name:name,constructor: constructor});
        }
	};
	return service;
}]);
/* global angular, ol*/

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.controls.openlayersv3', [ ]);

    app.service('olv3MapControls', [function () {
        var supportControls = [
            {name:'overviewmap', constructor: ol.control.OverviewMap},
            {name:'scaleline', constructor: ol.control.ScaleLine},
            {name:'zoomslider', constructor: ol.control.ZoomSlider},
            {name:'panzoombar', constructor: ol.control.ZoomSlider},
            {name:'zoom', constructor: ol.control.Zoom},
            {name:'mouseposition', constructor: ol.control.MousePosition, resolveCustomParams: mousePositionDefaults},
            {name:'attribution', constructor: ol.control.Attribution}
        ];
        function mousePositionDefaults(controlOptions, mapOptions) {
            var result = {};
            var wgs84Default = function(dgts)
            {
                return (
                    function(coord) {
                        if(coord[0] > 180) {
                            coord[0] = coord[0] - 360;
                        }
                        if(coord[0] < -180) {
                            coord[0] = coord[0] + 360;
                        }

                        if(coord[1] > 90) {
                            coord[1] = coord[1] - 180;
                        }
                        if(coord[1] < -90) {
                            coord[1] = coord[1] + 180;
                        }
                        return ol.coordinate.toStringXY(coord,dgts);
                    });
            };
            var wrappedFormatOutput = function (formatFn) {
                return (
                    function(coord) {
                        if(coord[0] > 180) {
                            coord[0] = coord[0] - 360;
                        }
                        if(coord[0] < -180) {
                            coord[0] = coord[0] + 360;
                        }

                        if(coord[1] > 90) {
                            coord[1] = coord[1] - 180;
                        }
                        if(coord[1] < -90) {
                            coord[1] = coord[1] + 180;
                        }
                        return formatFn({ lon : coord[0], lat: coord[1]});
                    });
            };
            if(controlOptions.formatOutput != null) {
                result.coordinateFormat = wrappedFormatOutput(controlOptions.formatOutput);
            } else {
                result.coordinateFormat = controlOptions.coordinateFormat == null ? wgs84Default(4) : controlOptions.coordinateFormat(4);
            }
            result.projection = controlOptions.projection || mapOptions.displayProjection;
            return result;
        }
        var service = {
            resolveSupportedControl: function (name) {
                var control;
                for (var i = 0; i < supportControls.length; i++) {
                    var con = supportControls[i];
                    if(con.name === name) {
                        control = con;
                        break;
                    }
                }
                return control;
            },
            createControl: function (name,controlOptions, div, mapOptions) {
                var control;
                if(div && !controlOptions.div) {
                    controlOptions.element = div;
                }
                var supportedControl = service.resolveSupportedControl(name);
                if(supportedControl == null || supportedControl.constructor == null) {
                    var message = "Error in map control construction for '" + name + "'. Unsupported control or missing source for control constructor.";
                    message += "\r\nSupported controls names are: ";
                    for (var i = 0; i < supportControls.length; i++) {
                        var con = supportControls[i];
                        message += "\r\n" + con.name;
                    }
                    throw new Error(message);
                }

                if(supportedControl.resolveCustomParams) {
                    controlOptions = angular.extend(controlOptions,angular.copy(supportedControl.resolveCustomParams(controlOptions, mapOptions)));
                    control = new supportedControl.constructor(controlOptions);
                } else if(supportedControl.customParams) {
                    controlOptions = angular.extend(controlOptions,angular.copy(supportedControl.customParams[0]));
                    control = new supportedControl.constructor(controlOptions);
                } else {
                    if(controlOptions) {
                        control = new supportedControl.constructor(controlOptions);
                    } else {
                        control = new supportedControl.constructor();
                    }
                }
                return control;
            },
            registerControl: function (name, constructor) {
                supportControls.push({name:name,constructor: constructor});
            }
        };
        return service;
    }]);

    //If exists as v3 may not be included if apps are only using v2.
    if(ol != null && ol.control != null && ol.control.ZoomSlider != null) {
        ol.control.ZoomSlider.prototype.getPositionForResolution_ = function(res) {
            try {
                var fn = this.getMap().getView().getValueForResolutionFunction();
                return 1 - fn(res);
            } catch (error) {

            }
        };
    }
})();
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.mapservices.map.openlayersv2',
	[
		'gawebtoolkit.mapservices.layer.openlayersv2',
		'gawebtoolkit.mapservices.controls.openlayersv2'
	]);

app.service('olv2MapService', [
	'olv2LayerService',
	'olv2MapControls',
	'GAWTUtils',
	'GeoLayer',
	'$q',
	'$log',
	function (olv2LayerService, olv2MapControls, GAWTUtils,GeoLayer, $q, $log) {
		'use strict';
		function updateToolkitMapInstanceProperty(mapInstance,propertyName, propertyValue) {
			mapInstance._geowebtoolkit = mapInstance._geowebtoolkit || {};
			mapInstance._geowebtoolkit[propertyName] = propertyValue;
		}
		function getToolkitMapInstanceProperty(mapInstance, propertyName) {
			var result = null;
			if(mapInstance._geowebtoolkit != null) {
				result = mapInstance._geowebtoolkit[propertyName];
			}
			return result;
		}
		var service = {
			/**
			 * Initialises/Creates map object providing applications defaults from 'ga.config' module provided by
			 * 'gawebtoolkit.services' module, or application above, and attributes passed to gaMap directive.
			 * @param args {Object} - arguments passed from ga-map directive
			 * @param mapConfig {Object} - defaults passed from either toolkit or overridden in consuming application
			 * */
			initialiseMap: function (args, mapConfig) {
				var config = {};
				//.controls = [];

				if (args.displayProjection == null) {
					args.displayProjection = mapConfig.defaultOptions.displayProjection;
				}

				service.displayProjection = args.displayProjection;
				if (args.datumProjection == null) {
					args.datumProjection = mapConfig.defaultOptions.projection;
				}
				config.projection = args.datumProjection;
				config.numZoomLevels = mapConfig.defaultOptions.numZoomLevels;
				config.displayProjection = args.displayProjection;

				if ((!args.isStaticMap) && (config.controls === undefined || config.controls === null)) {
					//TODO move defaults into angular config constant
					config.controls = [ new OpenLayers.Control.Navigation() ];
				} else {
					config.controls = [];
				}

				return new OpenLayers.Map(args.mapElementId, config);
			},
			// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
			getParameterByName: function (name) {
				name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
				var regex = new RegExp("[\\?&]" + name +
					"=([^&#]*)"), results = regex.exec(document.URL);

				return results == null ?
					"" :
					decodeURIComponent(results[1].replace(/\+/g, " "));
			},
			zoomToMaxExtent: function (mapInstance) {
				mapInstance.zoomToMaxExtent();
			},
			currentZoomLevel: function (mapInstance) {
				return mapInstance.getZoom();
			},
			addLayer: function (mapInstance, layer) {
				if (layer.then != null && typeof layer.then === 'function') {
					layer.then(function (resultLayer) {
						mapInstance.addLayer(resultLayer);
						service.postLayerAddAction(mapInstance, layer);
						return GeoLayer.fromOpenLayersV2Layer(layer);
					});
				} else {
					if (layer.geoLayerType != null && layer.geoLayerType.indexOf('Google') !== -1) {
						mapInstance.zoomDuration = 0;
					}
					mapInstance.addLayer(layer);
					service.postLayerAddAction(mapInstance, layer);
					return GeoLayer.fromOpenLayersV2Layer(layer);
				}
			},
			postLayerAddAction: function (mapInstance, layer) {
				$log.info('post layer add fired');
				if (olv2LayerService.postAddLayerCache[layer.id]) {
					olv2LayerService.postAddLayerCache[layer.id]({map:mapInstance,layer:layer});
				}
				cleanClientCache(mapInstance,olv2LayerService);
			},
			registerMapMouseMove: function (mapInstance, callback) {
				mapInstance.events.register("mousemove", mapInstance, callback);
			},
			registerMapClick: function (mapInstance, callback) {
				mapInstance.events.register("click", mapInstance, callback);
			},
			unRegisterMapClick: function (mapInstance, callback) {
				mapInstance.events.unregister("click", mapInstance, callback);
			},
			registerMapMouseMoveEnd: function (mapInstance, callback) {
				mapInstance.events.register('moveend', mapInstance, callback);
			},
			registerMapEvent: function (mapInstance, eventName, callback) {
				mapInstance.events.register(eventName, mapInstance, callback);
			},
			unRegisterMapEvent: function (mapInstance, eventName, callback) {
				mapInstance.events.unregister(eventName, mapInstance, callback);
			},
			getCurrentMapExtent: function (mapInstance) {
				var currentExtent = mapInstance.getExtent();
				if (currentExtent == null) {
					return null;
				}
				currentExtent = currentExtent.transform(mapInstance.projection, service.displayProjection);
				var result = [];
				var topLeft = [ currentExtent.left, currentExtent.top ];
				var topRight = [ currentExtent.right, currentExtent.top ];
				var bottomLeft = [ currentExtent.left, currentExtent.bottom ];
				var bottomRight = [ currentExtent.right, currentExtent.bottom ];
				result.push(topLeft);
				result.push(topRight);
				result.push(bottomLeft);
				result.push(bottomRight);

				return result;
			},
			isControlActive: function (mapInstance, controlId, controlName) {
				var control;
				for (var i = 0; mapInstance.controls.length; i++) {
					var existingControl = mapInstance.controls[i];
					if (existingControl.id === controlId) {
						control = existingControl;
						break;
					}
				}
				return control.active === true;
			},
			addControl: function (mapInstance, controlName, controlOptions, elementId, controlId, mapOptions) {
				controlName = controlName.toLowerCase();
				var resultControl = {};
				var div;
				if (elementId) {
					div = $('#' + elementId)[0];
				}
				//Sensible default for mouse position
				if (controlName === 'mouseposition') {
                    controlOptions = controlOptions || {};
				}
				var con = olv2MapControls.createControl(controlName, controlOptions, div);
				con.id = controlId || con.id;
				mapInstance.addControl(con);
				resultControl.id = con.id;
				return resultControl;
			},
			getControls: function (mapInstance) {
				var controls = [];
				var olv2Controls = mapInstance.controls;
				for (var i = 0; i < olv2Controls.length; i++) {
					var control = olv2Controls[i];
					controls.push({
						id: control.metadata.id || control.id,
						name: control.metadata.type
					});
				}
				return controls;
			},
			getControlById: function (mapInstance, controlId) {
				var result;
				var olv2Controls = mapInstance.controls;

				for (var i = 0; i < olv2Controls.length; i++) {
					var control = olv2Controls[i];
					if (control.id === controlId) {
						result = control;
						break;
					}
				}
				return result;
			},
			activateControl: function (mapInstance, controlId) {
				var control = service.getControlById(mapInstance, controlId);
				control.activate();
			},
			deactivateControl: function (mapInstance, controlId) {
				var control = service.getControlById(mapInstance, controlId);
				control.deactivate();
			},
			registerControlEvent: function (mapInstance, controlId, eventName, callback) {
				var control = service.getControlById(mapInstance, controlId);
				control.events.register(eventName, undefined, callback);
			},
			unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
				var control = service.getControlById(mapInstance, controlId);
				control.events.unregister(eventName, undefined, callback);
			},
			/**
			 * Gets the current list of layers in the map instance and returns as Layer type
			 * @param {Object} mapInstance - the map instance that ga-map directive holds, implementation specific
			 * @returns {Layer[]}
			 * */
			getLayers: function (mapInstance) {
				var layers = [];
				angular.forEach(mapInstance.layers, function (layer) {
					layers.push(GeoLayer.fromOpenLayersV2Layer(layer));
				});
				return layers;
			},
			getLayersByName: function (mapInstance, layerName) {
				if (typeof layerName !== 'string' && typeof layerName !== 'number') {
					throw new TypeError('Expected number');
				}
				var layers = mapInstance.getLayersBy('name', layerName);
				var results = [];
				for (var i = 0; i < layers.length; i++) {
					var currentLayer = layers[i];
					results.push(GeoLayer.fromOpenLayersV2Layer(currentLayer));
				}
				return results;
			},
			/**
			 * Updated the layer visibility on the map instance via the provided layerId
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param layerId {string} - unique ID of the layer to set the new visibility
			 * @param visibility {Boolean} - true or false indicating if the layer is to be visible or not
			 * */
			setLayerVisibility: function (mapInstance, layerId, visibility) {
				if (typeof visibility === 'object') {
					throw new TypeError('Expected boolean');
				}
				var currentLayer = mapInstance.getLayersBy('id', layerId)[0];
				currentLayer.setVisibility(visibility);
			},
			/**
			 * Methods that takes a geoJson coordinates array and returns OpenLayers boundingbox
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
			 * @return {Object} - OpenLayers bounding box
			 * */
			createBoundingBox: function (mapInstance, geoJsonCoordinateArray) {
				var bounds = new OpenLayers.Bounds();
				for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
					bounds.extend(new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]));
				}
				//TODO return a geoJson equivalent?
				return bounds.toBBOX();
			},
			/**
			 * Method that takes a geoJson coordinates array and returns OpenLayers.Bounds
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
			 * @param projection {string} - projection that the provided coordinates are in
			 * @returns {Object} - OpenLayers.Bounds object
			 * */
			createBounds: function (mapInstance, geoJsonCoordinateArray, projection) {
				var bounds = new OpenLayers.Bounds();
				for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
					var lonLat = new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]);
					lonLat = lonLat.transform(projection, mapInstance.projection);
					bounds.extend(lonLat);
				}
				//TODO return a geoJson equivalent
				return bounds;
			},
			/**
			 * Zooms to a specified extent
			 * //TODO What is common data structure for 'extent' object, current takes OpenLayers bounds
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param extent {Object} - OpenLayers.Bounds object
			 * @example
			 * var bounds = mapController.createBounds([[100.0,-20.0],[160.0,-20.0],[100.0,-40.0],[160.0,-40.0]]);
			 * mapController.zoomToExtent(bounds);
			 * */
			zoomToExtent: function (mapInstance, extent) {
                var bounds = service.createBounds(mapInstance, extent, service.displayProjection);
				mapInstance.zoomToExtent(bounds, false);
			},
			//TODO sensible errors when unsupported layerId is used.
			zoomToLayer: function (mapInstance, layerId) {
				var layer = mapInstance.getLayersBy('id', layerId)[0];
                if(layer == null) {
                    throw new ReferenceError('Layer not found - id: "' + layerId + '".');
                }
				//Only valid for some layers
				var extent = layer.getExtent();
				//var transformedExtent = extent.transform(new OpenLayers.Projection(mapInstance.getProjection()), layer.projection);
				mapInstance.zoomToExtent(extent);
			},
			/**
			 * Sets a new zoom level of on the map instance
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param zoomLevel {Number} - zoom level between 1-19, not all zoom levels are valid for every map.
			 * */
			zoomTo: function (mapInstance, zoomLevel) {
				if (typeof zoomLevel === 'object') {
					throw new TypeError('Expected number');
				}
				mapInstance.zoomTo(zoomLevel);
			},
			/**
			 * Changes base layer to specified layer ID
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param layerId {string} - ID of the layer that is to be the new base layer
			 * */
			setBaseLayer: function (mapInstance, layerId) {
				var layer = mapInstance.getLayersBy('id', layerId)[0];
                mapInstance.setBaseLayer(layer, false);
			},
			/**
			 * Updates the maps view to center on the lon/lat provided.
			 * Assumed same projection unless projection provided.
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
			 * @param lat {Number} - Latitude of the new centre position.
			 * @param lon {Number} - Longitude of the new centre position.
			 * @param projection {string} - Projection of the provided lat and lon.
			 * */
			setCenter: function (mapInstance, lat, lon, projection) {
				var extent = new OpenLayers.LonLat(lon, lat);
				if (projection == null) {
					mapInstance.setCenter(extent);
				} else {
					var transformedExtent = extent.transform(new OpenLayers.Projection(projection), new OpenLayers.Projection(mapInstance.getProjection()));
					mapInstance.setCenter(transformedExtent);
				}
			},
			setInitialPositionAndZoom: function (mapInstance, args) {
				// If a permalink has been provided use th zoom level and current position provided,
				// other wise use the defaults provided by the config
				if (service.getParameterByName('zoom') !== '' && args.centerPosition != null) {
                    var nPosition =  new OpenLayers.LonLat(
                        service.getParameterByName('lon'),
                        service.getParameterByName('lat')).transform();
                    var srcProj = new OpenLayers.Projection(service.displayProjection);
                    var destProj = new OpenLayers.Projection(mapInstance.getProjection());
                    var transformedExtent = nPosition.transform(srcProj,destProj);
                    mapInstance.setCenter(
                        transformedExtent,
                        service.getParameterByName('zoom'));
				} else if (args.initialExtent != null) {
					var bounds = service.createBounds(mapInstance, args.initialExtent, service.displayProjection);
                    mapInstance.zoomToExtent(bounds, true);
				} else if (args.centerPosition) {
					var position = JSON.parse(args.centerPosition);
                    var centerPos = new OpenLayers.LonLat(position[0], position[1]);
                    var srcProjection = new OpenLayers.Projection(service.displayProjection);
                    var destProjection = new OpenLayers.Projection(mapInstance.getProjection());
                    var transformedCenter = centerPos.transform(srcProjection,destProjection);
					mapInstance.setCenter(transformedCenter, args.zoomLevel);

				} else {
					//No options passed, zoom to max
					mapInstance.zoomToMaxExtent();
				}
			},
			isBaseLayer: function (mapInstance, layerId) {
				var result = false;
				var currentLayer;
				var numOfLayers = mapInstance.layers.length;

				//Find current layer
				for (var i = 0; i < numOfLayers; i++) {
					if (mapInstance.layers[i].id === layerId) {
						currentLayer = mapInstance.layers[i];
						break;
					}
				}
				if (currentLayer) {
					//To get around a bug in OpenLayers where ArcGISCacheLayer.isBaseLayer returning incorrect value
					//due to prototypal inheritance from XYZTileCache, we need to check if the layer we are dealing
					//with is an ArcGISCache layer. Work around is to check if 'ArcGISCache' is in the name of the
					//layerId. Check base layer options instead.
					//TODO this might be due to OpenLayers failing silently rather than a bug, needs checking/reviewing
					if (currentLayer.id.indexOf('ArcGISCache') !== -1) {
						result = currentLayer.options.isBaseLayer;
					} else {
						result = currentLayer.isBaseLayer;
					}
				} else {
					result = false;
				}
				return result;
			},
			/**
			 * Updates the layer with the specified layerId with the provided opacity
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
			 * @param layerId {string} - ID of the layer to have opacity updated.
			 * @param opacity {Number} - new opacity value between 0 and 1.0.
			 * */
			setOpacity: function (mapInstance, layerId, opacity) {
				if (typeof opacity === 'object') {
					throw new TypeError("Expected number");
				}
				var layer = mapInstance.getLayersBy('id', layerId)[0];
				layer.setOpacity(opacity);
			},
			/**
			 * Updates all layers as the map contains size has been changed.
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
			 * */
			mapResized: function (mapInstance) {
				mapInstance.updateSize();
				for (var i = 0; i < mapInstance.layers.length; i++) {
					mapInstance.layers[i].redraw(true);
				}
			},
			setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl, args) {
				var markerLayer = mapInstance.getLayersBy('name', markerGroupName);

				var opx = mapInstance.getLonLatFromPixel(coords);

				var size = new OpenLayers.Size(args.width, args.height);
				var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
				var icon = new OpenLayers.Icon(iconUrl, size, offset);
				var marker = new OpenLayers.Marker(opx, icon.clone());
				marker.map = mapInstance;

				// Marker layer exists so get the layer and add the marker
				if (markerLayer != null && markerLayer.length > 0) {
					markerLayer[0].addMarker(marker);
				} else { // Marker layer does not exist so we create the layer then add the marker
					var markers = new OpenLayers.Layer.Markers(markerGroupName);

					mapInstance.addLayer(markers);
					markers.addMarker(marker);
				}
			},
			getLonLatFromPixel: function (mapInstance, x, y, projection) {
				//TODO return gaMaps data structure, eg obj = { lat: Number,lon: Number }
				//If olv2 returns this structure then, should a new object get created instead
				//of reference to olv2 obj?
				if (x == null) {
					throw new ReferenceError("'x' value cannot be null or undefined");
				}
				if (y == null) {
					throw new ReferenceError("'y' value cannot be null or undefined");
				}
				var result = mapInstance.getLonLatFromPixel({
					x: x,
					y: y
				});

				if(projection) {
					result = result.transform(mapInstance.projection, projection);
				} else if (service.displayProjection && service.displayProjection !== mapInstance.projection) {
					result = result.transform(mapInstance.projection, service.displayProjection);
				}
				return result;
			},
			getPixelFromLonLat: function (mapInstance, lon, lat) {
				if (lon == null) {
					throw new ReferenceError("'lon' value cannot be null or undefined");
				}
				if (lat == null) {
					throw new ReferenceError("'lat' value cannot be null or undefined");
				}
				return mapInstance.getPixelFromLonLat(new OpenLayers.LonLat(lon, lat));
			},
			getPointFromEvent: function (e) {
				// Open layers requires the e.xy object, be careful not to use e.x and e.y will return an
				// incorrect value in regards to your screen pixels
				return {
					x: e.xy.x,
					y: e.xy.y
				};
			},
			drawPolyLine: function (mapInstance, points, layerName, datum) {
				var startPoint = new OpenLayers.Geometry.Point(points[0].lon, points[0].lat);
				var endPoint = new OpenLayers.Geometry.Point(points[1].lon, points[1].lat);

				// TODO get datum from config
				var projection = datum || 'EPSG:4326';

				var vector = new OpenLayers.Layer.Vector(layerName);
				var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([ endPoint, startPoint ]).transform(new OpenLayers.Projection(
					projection), mapInstance.getProjection()));

				// Style the feature
				var featureStyle = OpenLayers.Util.applyDefaults(featureStyle, OpenLayers.Feature.Vector.style['default']);
				featureStyle.strokeWidth = 4;
				feature.style = featureStyle;

				vector.addFeatures([ feature ]);
				mapInstance.addLayer(vector);
			},
			startRemoveSelectedFeature: function (mapInstance, layerName) {
				var vectors = mapInstance.getLayersByName(layerName);
				var vector;
				if (vectors.length > 0) {
					vector = vectors[0];
				} else {
					//Do nothing, no layer to remove features from
					$log.warn('Layer not found ("' + layerName + '") when starting the selection to remove features.')
					return;
				}
				// Function is called when a feature is selected
				function onFeatureSelect(feature) {
					vector.removeFeatures(feature);
	            }

				// Create the select control
				var selectCtrl = new OpenLayers.Control.SelectFeature(vector, {
	                onSelect: onFeatureSelect
	            });

				mapInstance.addControl(selectCtrl);
				selectCtrl.activate();
				updateToolkitMapInstanceProperty(mapInstance,'removeFeaturesControl', selectCtrl);
			},
			stopRemoveSelectedFeature: function (mapInstance) {
				var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance,'removeFeaturesControl');
				if(removeFeaturesControl != null) {
					removeFeaturesControl.deactivate();
					mapInstance.removeControl(removeFeaturesControl);
					updateToolkitMapInstanceProperty(mapInstance,'removeFeaturesControl',null);
				}
			},
			removeFeature: function (mapInstance, layerName, feature) {
				var vectors = mapInstance.getLayersByName(layerName);
				vectors[0].removeFeatures(feature);
			},
			startDrawingOnLayer: function (mapInstance,layerName, args) {
	            var vectors = mapInstance.getLayersByName(layerName || args.layerName);
				var vector;

				// Create the layer if it doesn't exist
	            if (vectors.length > 0) {
	            	vector = vectors[0];
	            } else {
	            	vector = new OpenLayers.Layer.Vector(layerName || args.layerName);
					mapInstance.addLayer(vector);
	            }
				vector.style =
				{
					fillColor: args.fillColor || args.color,
					fillOpacity : args.fillOpacity || args.opacity,
					pointRadius : args.pointRadius || args.radius,
					strokeColor: args.strokeColor || args.color,
					strokeOpacity : args.strokeOpacity || args.opacity
				};
				var existingDrawControl = getToolkitMapInstanceProperty(mapInstance,'drawingControl');
				if(!existingDrawControl) {
					var control;
					// Create a new control with the appropriate style
					if (args.featureType.toLowerCase() === 'point') {
						control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Point);
					} else if (args.featureType.toLowerCase() === 'line' || args.featureType.toLowerCase() === 'linestring') {
						control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Path);
					} else if (args.featureType.toLowerCase() === 'box') {
						control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.RegularPolygon, {
							handlerOptions: {
								sides: 4,
								irregular: true
							}
						});
					} else if (args.featureType.toLowerCase() === 'polygon') {
						control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Polygon);
					}

					if (args.featureType.toLowerCase() === 'circle') {
						throw new Error("'startDrawingOnLayer' failed due to feature type 'Circle' is not a valid feature type for OpenLayers 2.");
					}
					updateToolkitMapInstanceProperty(mapInstance,'drawingControl',control);
					mapInstance.addControl(control);
					control.activate();
				}

			},
			stopDrawing: function (mapInstance) {
				var existingDrawControl = getToolkitMapInstanceProperty(mapInstance,'drawingControl');
				if(existingDrawControl) {
					existingDrawControl.deactivate();
					mapInstance.removeControl(existingDrawControl);
					updateToolkitMapInstanceProperty(mapInstance,'drawingControl',null);
				}
			},
			drawLabel: function (mapInstance, layerName, args) {
				var vectors = mapInstance.getLayersByName(layerName || args.layerName);
				var vector;
				if (vectors.length > 0) {
					vector = vectors[0];
				} else {
					vector = new OpenLayers.Layer.Vector(layerName || args.layerName);
					mapInstance.addLayer(vector);
				}

				// Create a point to display the text
	            var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection());
	            var pointFeature = new OpenLayers.Feature.Vector(point);

	            // Add the text to the style of the layer
	            vector.style = {
					label: args.text,
					fontColor : args.fontColor || args.color,
					fontSize: args.fontSize,
					align : args.align,
					labelSelect: true
				};
				vector.addFeatures([pointFeature]);
				var featureId = GAWTUtils.generateUuid();
				pointFeature.id = featureId;
				var geoJsonWriter = new OpenLayers.Format.GeoJSON();
				var geoJsonFeature = geoJsonWriter.write(pointFeature);
				var result = angular.fromJson(geoJsonFeature);
				result.id = featureId;
				return result;
			},
			drawLabelWithPoint: function (mapInstance, layerName, args) {
				var vectors = mapInstance.getLayersByName(layerName || args.layerName);
				var vector;

				if (vectors.length > 0) {
					vector = vectors[0];
				} else {
					vector = new OpenLayers.Layer.Vector(layerName || args.layerName);
					mapInstance.addLayer(vector);
				}

				// Create a point to display the text
				var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection());
	            var pointFeature = new OpenLayers.Feature.Vector(point);

				var pointFeatureId = GAWTUtils.generateUuid();
				pointFeature.id = pointFeatureId;
	            // Add the text to the style of the layer
	            vector.style = {
					label: args.text,
					pointRadius: args.pointRadius || '8',
					fontColor : args.fontColor || args.color || '#000000',
					fontSize: args.fontSize || '14px',
					align : args.align || 'cm',
					labelYOffset : args.labelYOffset || 15,
					labelSelect: true,
					fillColor : args.pointColor || args.color || '#000000',
					strokeColor : args.pointColor || args.color || '#000000',
					fillOpacity : args.pointOpacity || args.fillOpacity || 0.5,
					strokeOpacity : args.pointOpacity || args.strokeOpacity || 1.0};
	            vector.addFeatures([pointFeature]);
				var geoJsonWriter = new OpenLayers.Format.GeoJSON();
				var geoJsonFeature = geoJsonWriter.write([pointFeature]);
				var result = angular.fromJson(geoJsonFeature);
				result.features[0].id = pointFeatureId;
				return result;
			},
			getFeatureInfo: function (mapInstance, url, featureType, featurePrefix, geometryName, pointEvent, tolerance) {
				tolerance = tolerance || 0;
				var deferred = $q.defer();
				var point = event instanceof MouseEvent ? pointEvent.xy : pointEvent;
				var originalPx = new OpenLayers.Pixel(point.x, point.y);
				var llPx = originalPx.add(-tolerance, tolerance);
				var urPx = originalPx.add(tolerance, -tolerance);
				var ll = mapInstance.getLonLatFromPixel(llPx);
				var ur = mapInstance.getLonLatFromPixel(urPx);
				var bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
				var protocol = new OpenLayers.Protocol.WFS({
					formatOptions: {
						outputFormat: 'text/xml'
					},
					url: url,
					version: '1.1.0',
					srsName: mapInstance.projection,
					featureType: featureType,
					featurePrefix: featurePrefix,
					geometryName: geometryName,
					maxFeatures: 100
				});
				var filter = new OpenLayers.Filter.Spatial({
					type: OpenLayers.Filter.Spatial.BBOX,
					value: bounds
				});
				protocol.read({
					filter: filter,
					callback: function (result) {
						if (result.success()) {
							var geoJSONFormat = new OpenLayers.Format.GeoJSON();
							var geoJson = geoJSONFormat.write(result.features);
							var geoObject = angular.fromJson(geoJson);

							for (var j = 0; j < geoObject.features.length; j++) {
								geoObject.features[j].crs = {
									"type": "name",
									"properties": {
										"name": mapInstance.projection
									}
								};
							}
							deferred.resolve(geoObject);
						}
					}
				});
				return deferred.promise;
			},
			getFeatureInfoFromLayer: function (mapInstance, callback, layerId, pointEvent,tolerance) {
                tolerance = tolerance || 0;
				var point = event instanceof MouseEvent ? pointEvent.xy : pointEvent;
				var originalPx = new OpenLayers.Pixel(point.x, point.y);
				var llPx = originalPx.add(-tolerance, tolerance);
				var urPx = originalPx.add(tolerance, -tolerance);
				var ll = mapInstance.getLonLatFromPixel(llPx);
				var ur = mapInstance.getLonLatFromPixel(urPx);
				var bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
				var layers = mapInstance.getLayersBy('id', layerId);
				var layer;
				if (layers.length > 0) {
					layer = layers[0];
				} else {
					//Throw error;
                    throw new Error("Invalid layer id");
				}
				var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(layer);
				var filter = new OpenLayers.Filter.Spatial({
					type: OpenLayers.Filter.Spatial.BBOX,
					value: bounds
				});
				protocol.read({
					filter: filter,
					callback: function (result) {
						if (result.success()) {
							var geoJSONFormat = new OpenLayers.Format.GeoJSON();
							var geoJson = geoJSONFormat.write(result.features);
							var geoObject = angular.fromJson(geoJson);

							for (var j = 0; j < geoObject.features.length; j++) {
								geoObject.features[j].crs = {
									"type": "name",
									"properties": {
										"name": mapInstance.projection
									}
								};
							}
							callback(geoObject);
						}
					}
				});
			},
			createWfsClient: function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
				var protocol = new OpenLayers.Protocol.WFS({
					url: url,
					featureType: featureType,
					featurePrefix: featurePrefix,
					version: version,
					geometryName: geometryName,
					srsName: datumProjection
				});

				protocol.isLonLatOrderValid = isLonLatOrderValid;

				return protocol;
			},
			addWfsClient: function (wfsClient) {
				service.wfsClientCache = service.wfsClientCache || [];

				var wfsClientId = GAWTUtils.generateUuid();
				service.wfsClientCache[wfsClientId] = wfsClient;

				return {
					clientId: wfsClientId
				};
			},
			is3dSupported: function (mapInstance, version) {
				//Always return false due to OpenLayers 2 having no support for 3D.
				return false;
			},
			is3d: function (mapInstance, version) {
				return false;
			},
			switchTo3dView: function (mapInstance, version) {
				throw new Error("3D not supported in current map");
			},
			switchTo2dView: function (mapInstance, version) {
				//No op as always 3D.
			},
			searchWfs: function (mapInstance, clientId, query, attribute) {
				var client = service.wfsClientCache[clientId];
				var deferred = $q.defer();

				var callBackFn = function (response) {
					if (response.priv.status !== '200' || response.priv.status === 200) {
						deferred.resolve(null);
						return;
					}
					for (var i = 0; i < response.features.length; i++) {
						if (service.wfsClientCache[clientId].isLonLatOrderValid === false) {
							var invalidLat = response.features[i].geometry.x;
							var invalidLon = response.features[i].geometry.y;

							response.features[i].geometry.x = invalidLon;
							response.features[i].geometry.y = invalidLat;
						}
					}

					var geoJSONFormat = new OpenLayers.Format.GeoJSON();
					var geoJson = geoJSONFormat.write(response.features);
					var geoObject = angular.fromJson(geoJson);

					for (var j = 0; j < geoObject.features.length; j++) {
						geoObject.features[j].crs = {
							"type": "name",
							"properties": {
								"name": client.srsName
							}
						};
					}

					deferred.resolve(geoObject);
				};

				var filter = new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.LIKE,
					property: attribute,
					matchCase: false,
					value: query.toUpperCase() + '*'
				});

				client.read({
					filter: filter,
					callback: callBackFn
				});

				return deferred.promise;
			},
			getMeasureFromEvent: function (mapInstance, e) {
				var points;
				var format = new OpenLayers.Format.GeoJSON({
					externalProjection: service.displayProjection,
					internalProjection: mapInstance.projection
				});
				var geoJsonString = format.write(e.geometry);
				points = angular.fromJson(geoJsonString);
				return {
					measurement: e.measure,
					units: e.units,
					geoJson: points
				};
			},
			wfsClientCache: {}
		};
		function cleanClientCache(mapInstance, layerService) {
			for(var cache in layerService.postAddLayerCache) {
				if(layerService.postAddLayerCache.hasOwnProperty(cache)) {
					var cacheInUse = false;
					for (var i = 0; i < mapInstance.layers.length; i++) {
						var layer = mapInstance.layers[i];
						if(cache === layer.id) {
							cacheInUse = true;
						}
					}
					if(!cacheInUse) {
						layerService.postAddLayerCache[cache] = null;
					}
				}
			}
		}
		return service;
	} ]);
/* global angular, ol, olcs, $, Cesium */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.openlayersv3',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3'
        ]);

    var olCesiumInstance;
    var cesiumMousePositionHandler;

    app.service('olv3MapService', [
        'olv3LayerService',
        'olv3MapControls',
        'GAWTUtils',
        'GeoLayer',
        'ga.config',
        '$q',
        '$log',
        '$timeout',
        function (olv3LayerService, olv3MapControls, GAWTUtils, GeoLayer,appConfig, $q, $log, $timeout) {

            function updateToolkitMapInstanceProperty(mapInstance,propertyName, propertyValue) {
                var _geowebtoolkit = mapInstance.get('_geowebtoolkit') || {};
                _geowebtoolkit[propertyName] = propertyValue;
                mapInstance.set('_geowebtoolkit', _geowebtoolkit);
            }
            function getToolkitMapInstanceProperty(mapInstance, propertyName) {
                var result = null;
                if(mapInstance.get('_geowebtoolkit')) {
                    var temp = mapInstance.get('_geowebtoolkit');
                    result = temp[propertyName];
                }
                return result;
            }

            var service = {
                /**
                 * Initialises/Creates map object providing applications defaults from 'ga.config' module provided by
                 * 'gawebtoolkit.services' module, or application above, and attributes passed to gaMap directive.
                 * @param args {Object} - arguments passed from ga-map directive
                 * @param mapConfig {Object} - defaults passed from either toolkit or overridden in consuming application
                 * */
                initialiseMap: function (args, mapConfig) {
                    var config = {};
                    //.controls = [];
                    //convert olv2 params to olv3.
                    var viewOptions = {};
                    if(args.datumProjection == null) {
                        $log.warn('Datum projection has not been provided. Defaulting to EPSG:3857');
                        args.datumProjection = 'EPSG:3857';
                    }
                    if(args.displayProjection == null) {
                        $log.warn('Display projection has not been provided. Defaulting to EPSG:4326');
                        args.displayProjection = 'EPSG:4326';
                    }
                    viewOptions.projection = ol.proj.get(args.datumProjection);
                    if (args.centerPosition) {
                        var center = JSON.parse(args.centerPosition);
                        viewOptions.center = ol.proj.transform([center[0], center[1]], args.displayProjection, args.datumProjection);
                    }

                    viewOptions.zoom = parseInt(args.zoomLevel);
                    viewOptions.extent = viewOptions.projection.getExtent();
                    var view = new ol.View(viewOptions);
                    view.geoMaxZoom = 28; //Default max zoom;
                    view.geoMinZoom = 0; //Default min zoom;
                    config.target = args.mapElementId;

                    config.renderer = appConfig.olv3Options == null ? 'canvas' : (appConfig.olv3Options.renderer || 'canvas');

                    config.view = view;
                    if(args.isStaticMap) {
                        config.interactions = [];
                    }
                    config.controls = [];

                    service.displayProjection = args.displayProjection;
                    var map = new ol.Map(config);

                    //HACK TODO Move to a post create map register (not created yet)
                    window.setTimeout(function () {
                        if (args.initialExtent) {
                            var extent = [
                                args.initialExtent[0][0],
                                args.initialExtent[0][1],
                                args.initialExtent[1][0],
                                args.initialExtent[1][1]
                            ];

                            var transformedCenter = ol.proj.transformExtent(extent, args.displayProjection, args.datumProjection);
                            map.getView().fitExtent(transformedCenter, map.getSize());
                        }
                    }, 10);

                    return map;
                },
                // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
                getParameterByName: function (name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name +
                    "=([^&#]*)"), results = regex.exec(document.URL);

                    return results == null ?
                        "" :
                        decodeURIComponent(results[1].replace(/\+/g, " "));
                },
                zoomToMaxExtent: function (mapInstance) {
                    //TODO, no 'maxExtent' in olv3. Look for alternative or way to compute.
                    mapInstance.getView().setZoom(18);
                },
                currentZoomLevel: function (mapInstance) {
                    return mapInstance.getView().getZoom();
                },
                addLayer: function (mapInstance, layer) {
                    var layerMaxZoomLevel = layer.geoMaxZoom || mapInstance.getView().geoMaxZoom;
                    var layerMinZoomLevel = layer.geoMinZoom || mapInstance.getView().geoMinZoom;
                    if (layerMaxZoomLevel < mapInstance.getView().geoMaxZoom || layerMinZoomLevel > mapInstance.getView().geoMinZoom) {
                        var exiistingView = mapInstance.getView();
                        var options = {
                            projection: exiistingView.getProjection(),
                            center: exiistingView.getCenter(),
                            zoom: exiistingView.getZoom(),
                            maxZoom: layerMaxZoomLevel,
                            minZoom: layerMinZoomLevel
                        };
                        var nView = new ol.View(options);
                        mapInstance.setView(nView);
                    }

                    if (layer.disableDefaultUI) {
                        //TODO Google maps not supported by OLV3, need to handle vendor maps differently so toolkit can give
                        //better feedback to developers about what isn't supported and possible alternatives.
                        return;
                        //var view = mapInstance.getView();
                        //view.on('change:center', function() {
                        //    var center = ol.proj.transform(view.getCenter(), view.getProjection(), 'EPSG:4326');
                        //    layer.setCenter(new google.maps.LatLng(center[1], center[0]));
                        //});
                        //view.on('change:resolution', function() {
                        //    layer.setZoom(view.getZoom());
                        //});
                        //return GeoLayer.fromOpenLayersV3Layer(layer)
                    }

                    if (layer.then != null && typeof layer.then === 'function') {
                        layer.then(function (resultLayer) {
                            mapInstance.addLayer(resultLayer);
                            service.postLayerAddAction(mapInstance, layer);
                            return GeoLayer.fromOpenLayersV3Layer(layer);
                        });
                    } else {
                        if (layer.geoLayerType != null && layer.geoLayerType.indexOf('Google') !== -1) {
                            mapInstance.zoomDuration = 0;
                        }

                        mapInstance.addLayer(layer);
                        service.postLayerAddAction(mapInstance, layer);
                        return GeoLayer.fromOpenLayersV3Layer(layer);
                    }
                },
                postLayerAddAction: function (mapInstance, layer) {
                    $log.info('post layer add fired');
                    if (olv3LayerService.postAddLayerCache[layer.id]) {
                        olv3LayerService.postAddLayerCache[layer.id]({map: mapInstance, layer: layer});
                    }
                    cleanClientCache(mapInstance, olv3LayerService);
                },
                registerMapMouseMove: function (mapInstance, callback) {
                    $(mapInstance.getViewport()).on('mousemove', callback);
                },
                registerMapClick: function (mapInstance, callback) {
                    if (callback != null) {
                        mapInstance.on('click', callback);
                    }
                },
                unRegisterMapClick: function (mapInstance, callback) {
                    if (callback != null) {
                        mapInstance.un('click', callback);
                    }
                },
                //TODO unregister
                registerMapMouseMoveEnd: function (mapInstance, callback) {
                    $(mapInstance.getViewport()).on('mousemove', function (obj, e) {
                        if (service.mousemoveTimeout !== undefined) {
                            window.clearTimeout(service.mousemoveTimeout);
                        }
                        service.mousemoveTimeout = window.setTimeout(function () {
                            callback(obj, e);
                        }, 100);
                    });
                },
                registerMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.on(eventName, callback);
                },
                unRegisterMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.un(eventName, callback);
                },
                getCurrentMapExtent: function (mapInstance) {
                    var ext = mapInstance.getView().calculateExtent(mapInstance.getSize());
                    if (ext == null) {
                        return null;
                    }
                    var result = [];
                    var topLeft = ol.proj.transform([ext[0], ext[3]], mapInstance.getView().getProjection(), service.displayProjection);
                    var topRight = ol.proj.transform([ext[2], ext[3]], mapInstance.getView().getProjection(), service.displayProjection);
                    var bottomLeft = ol.proj.transform([ext[0], ext[1]], mapInstance.getView().getProjection(), service.displayProjection);
                    var bottomRight = ol.proj.transform([ext[2], ext[1]], mapInstance.getView().getProjection(), service.displayProjection);
                    result.push(topLeft);
                    result.push(topRight);
                    result.push(bottomLeft);
                    result.push(bottomRight);
                    return result;
                },
                //return bool
                isControlActive: function (mapInstance, controlId, controlName) {
                    //Handle UI control compatibility.
                    if(controlName === 'measureline') {
                        return service.measureEventDrawInteraction != null;
                    }
                    //TODO no active state in olv3
                    var controls = mapInstance.getControls();
                    for (var i = 0; i < controls.getLength(); i++) {
                        var control = controls.item(i);
                        if (control.get('id') === controlId) {
                            return true;
                        }
                    }
                    return false;
                },
                //return geo-web-toolkit control dto
                addControl: function (mapInstance, controlName, controlOptions, elementId, controlId, mapOptions) {
                    controlName = controlName.toLowerCase();
                    var resultControl = {};
                    var div;
                    if (elementId) {
                        div = $('#' + elementId)[0];
                    }
                    //Sensible default for mouse position
                    if (controlName === 'mouseposition') {
                        controlOptions = controlOptions || {};
                    }

                    //OLV3 changed name for 'maximized' option. Parse if present.
                    if (controlName === 'overviewmap' && controlOptions != null && controlOptions.maximized != null) {
                        controlOptions.collapsed = !controlOptions.maximized;
                    }
                    var con = olv3MapControls.createControl(controlName, controlOptions, div, mapOptions);
                    con.set('id', controlId || con.get('id') || GAWTUtils.generateUuid());
                    con.set('name', controlName || '');
                    //Overview map can't be added after the map creation unless the map has performed a render.
                    //HACK to wait for map before adding this control.
                    if(controlName === 'overviewmap') {
                        $timeout(function () {
                            mapInstance.addControl(con);
                        },1000);
                    } else {
                        mapInstance.addControl(con);
                    }

                    resultControl.id = con.get('id');
                    return resultControl;
                },
                //return olv3 control with .metadata { id: '', name: '' }
                getControls: function (mapInstance) {
                    var controls = [];
                    var olv2Controls = mapInstance.getControls();
                    for (var i = 0; i < olv2Controls.getLength(); i++) {
                        var control = olv2Controls.item(i);
                        controls.push({
                            id: control.metadata.id || control.get('id'),
                            name: control.metadata.type
                        });
                    }
                    return controls;
                },
                //return olv3 control
                getControlById: function (mapInstance, controlId) {
                    var result;
                    var controls = mapInstance.getControls();

                    for (var i = 0; i < controls.getLength(); i++) {
                        var control = controls.item(i);
                        if (control.get('id') === controlId) {
                            result = control;
                            break;
                        }
                    }
                    return result;
                },
                //return void
                activateControl: function (mapInstance, controlId) {
                    var isActive = service.isControlActive(mapInstance, controlId);
                    var cachedControl = service._getCachedControl(controlId);
                    if (!isActive && cachedControl) {
                        mapInstance.addControl(cachedControl);
                        service._removeCachedControl(controlId);
                    }
                },
                _getCachedControl: function (controlId) {
                    service.cachedControls = service.cachedControls || [];
                    for (var i = 0; i < service.cachedControls.length; i++) {
                        var cachedControl = service.cachedControls[i];
                        if (cachedControl.get('id') === controlId) {
                            return cachedControl;
                        }
                    }
                    return null;
                },
                _removeCachedControl: function (controlId) {
                    service.cachedControls = service.cachedControls || [];
                    for (var i = 0; i < service.cachedControls.length; i++) {
                        var cachedControl = service.cachedControls[i];
                        if (cachedControl.get('id') === controlId) {
                            service.cachedControls[i] = null;
                        }
                    }
                    return null;
                },
                //return void
                deactivateControl: function (mapInstance, controlId) {
                    var isActive = service.isControlActive(mapInstance, controlId);
                    var cachedControl = service._getCachedControl(controlId);
                    var currentControl = service.getControlById(mapInstance, controlId);
                    if (isActive && !cachedControl) {
                        service.cachedControls.push(currentControl);
                        mapInstance.removeControl(currentControl);
                    }
                },
                //return void
                registerControlEvent: function (mapInstance, controlId, eventName, callback) {
                    //First check if control exists and then for previous OLV2 events, eg measure so we can handle them as ol.interactions
                    var controls = mapInstance.getControls();
                    var existingControl = null;
                    controls.forEach(function (control) {
                        if(control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if(existingControl == null) {
                        if(eventName === 'measurepartial') {
                            service.initMeasureEventLayer(mapInstance);
                            service.handleMeasurePartial(mapInstance,service.measureEventVectorLayer,service.measureEventDrawInteraction,callback);
                        }
                        if(eventName === 'measure') {
                            service.initMeasureEventLayer(mapInstance);
                            service.handleMeasure(mapInstance,service.measureEventVectorLayer,service.measureEventDrawInteraction,callback);
                        }

                    } else {
                        existingControl.on(eventName,callback);
                    }
                },
                initMeasureEventLayer: function(mapInstance) {
                    //Clear existing layer if exists
                    if(service.measureEventVectorLayer) {
                        mapInstance.removeLayer(service.measureEventVectorLayer);
                    }

                    if(service.measureEventDrawInteraction) {
                        mapInstance.removeInteraction(service.measureEventDrawInteraction);
                    }

                    service.measureEventSource = service.measureEventSource || new ol.source.Vector();

                    service.measureEventVectorLayer = service.measureEventVectorLayer || new ol.layer.Vector({
                        source: service.measureEventSource,
                        style: new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: 'rgba(255, 255, 255, 0.2)'
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#ffcc33',
                                width: 2
                            }),
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                    color: '#ffcc33'
                                })
                            })
                        })
                    });

                    service.measureEventVectorLayer.set('id', GAWTUtils.generateUuid());

                    service.measureEventDrawInteraction = service.measureEventDrawInteraction || new ol.interaction.Draw({
                        source: service.measureEventSource,
                        type: "LineString",
                        style: new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: 'rgba(255, 255, 255, 0.2)'
                            }),
                            stroke: new ol.style.Stroke({
                                color: 'rgba(0, 0, 0, 0.5)',
                                lineDash: [10, 10],
                                width: 2
                            }),
                            image: new ol.style.Circle({
                                radius: 5,
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(0, 0, 0, 0.7)'
                                }),
                                fill: new ol.style.Fill({
                                    color: 'rgba(255, 255, 255, 0.2)'
                                })
                            })
                        })
                    });

                    mapInstance.addLayer(service.measureEventVectorLayer);
                    mapInstance.addInteraction(service.measureEventDrawInteraction);
                },
                handleMeasurePartial: function (mapInstance,vectorLayer,drawInteraction, callback) {
                    drawInteraction.on("drawstart", function (e) {
                        var isDragging = false;
                        var sketchFeature = e.feature;
                        service.measurePointerMoveEvent = function (event) {
                            isDragging = !!event.dragging;
                        };
                        service.measureSingleClickTimeout = null;
                        service.measurePointerUpEvent = function (event) {
                            if(service.measureSingleClickTimeout) {
                                $timeout.cancel(service.measureSingleClickTimeout);
                            }
                            if(!isDragging) {
                                service.measureSingleClickTimeout = $timeout(function () {
                                    if(!service.measureIsDrawEndComplete) {
                                        event.feature = sketchFeature;
                                        callback(event);
                                    } else {
                                        service.measureIsDrawEndComplete = false;
                                    }
                                },10);
                            }
                        };

                        service.measurePointerDownEvent = function (event) {
                            var doubleClickCheck = new Date(new Date() + 250);
                            if(!isDragging && service.measureSingleClickTimeout != null && doubleClickCheck < service.measureSingleClickTimeout) {
                                service.measureIsDoubleClick = true;
                            }
                            service.measureSingleClickTimeout = new Date();
                        };
                        mapInstance.on('pointerup', service.measurePointerUpEvent);
                        mapInstance.on('pointermove', service.measurePointerMoveEvent);
                        mapInstance.on('pointerdown', service.measurePointerDownEvent);
                        callback(e);
                    }, service);
                },
                handleMeasure: function (mapInstance, vectorLayer, drawInteraction,callback) {
                    service.measureIsDrawEndComplete = false;
                    drawInteraction.on("drawend", function (e) {
                        mapInstance.un('pointerup', service.measurePointerUpEvent);
                        mapInstance.un('pointermove', service.measurePointerMoveEvent);
                        mapInstance.un('pointermove', service.measurePointerDownEvent);
                        callback(e);
                        service.measureIsDrawEndComplete = true;
                    },service);
                },
                //return void
                unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
                    //First check if control exists and then for previous OLV2 events, eg measure so we can handle them as ol.interactions
                    var controls = mapInstance.getControls();
                    var existingControl = null;
                    controls.forEach(function (control) {
                        if(control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if(existingControl == null) {
                        if(eventName === 'measure' && service.measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            mapInstance.removeInteraction(service.measureEventDrawInteraction);
                            mapInstance.removeLayer(service.measureEventVectorLayer);
                            service.measureEventVectorLayer = null;
                            service.measureEventDrawInteraction = null;
                            service.measureEventSource = null;
                            mapInstance.un('pointerup', service.measurePointerUpEvent);
                            mapInstance.un('pointermove', service.measurePointerMoveEvent);
                            mapInstance.un('pointermove', service.measurePointerDownEvent);
                        }
                        if(eventName === 'measurepartial' && service.measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            mapInstance.removeInteraction(service.measureEventDrawInteraction);
                            mapInstance.removeLayer(service.measureEventVectorLayer);
                            service.measureEventVectorLayer = null;
                            service.measureEventDrawInteraction = null;
                            service.measureEventSource = null;
                            mapInstance.un('pointerup', service.measurePointerUpEvent);
                            mapInstance.un('pointermove', service.measurePointerMoveEvent);
                            mapInstance.un('pointermove', service.measurePointerDownEvent);
                        }
                    } else {
                        existingControl.un(eventName,callback);
                    }
                },
                /**
                 * Gets the current list of layers in the map instance and returns as Layer type (geo-web-toolkit DTO)
                 * @param {Object} mapInstance - the map instance that ga-map directive holds, implementation specific
                 * @returns {Layer[]}
                 * */
                getLayers: function (mapInstance) {
                    var layers = [];
                    angular.forEach(mapInstance.getLayers(), function (layer) {
                        layers.push(GeoLayer.fromOpenLayersV3Layer(layer));
                    });
                    return layers;
                },
                _getLayersBy: function (mapInstance, propertyName, propertyValue) {
                    var layers = mapInstance.getLayers();
                    var results = [];
                    layers.forEach(function (layer) {

                        var propVal = layer.get(propertyName);
                        if (propVal && propVal.indexOf(propertyValue) !== -1) {
                            results.push(layer);
                        }
                    });
                    return results;
                },
                //Returns array of geo-web-toolkit layer DTO by name using olv3 getLayerByName?
                getLayersByName: function (mapInstance, layerName) {
                    if (typeof layerName !== 'string' && typeof layerName !== 'number') {
                        throw new TypeError('Expected string or number');
                    }
                    return olv3LayerService.getLayersBy(mapInstance, 'name', layerName);
                },
                /**
                 * Updated the layer visibility on the map instance via the provided layerId
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param layerId {string} - unique ID of the layer to set the new visibility
                 * @param visibility {Boolean} - true or false indicating if the layer is to be visible or not
                 * */
                setLayerVisibility: function (mapInstance, layerId, visibility) {
                    if (typeof visibility !== 'string' && typeof visibility !== 'boolean') {
                        throw new TypeError('Invalid visibility value "' + visibility + '"');
                    }
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    layer.setVisible(visibility);
                },
                /**
                 * Methods that takes a geoJson coordinates array and returns OpenLayers boundingbox
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
                 * @return {Object} - OpenLayers bounding box
                 * */
                createBoundingBox: function (mapInstance, geoJsonCoordinateArray) {
                    var geomPoints = [];
                    for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
                        var coord = geoJsonCoordinateArray[i];
                        geomPoints.push(new ol.geom.Point(coord));
                    }
                    var geomCollection = new ol.geom.GeometryCollection(geomPoints);
                    return geomCollection.getExtent();
                },
                /**
                 * Method that takes a geoJson coordinates array and returns OpenLayers.Bounds
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
                 * @param projection {string} - projection that the provided coordinates are in
                 * @returns {Object} - OpenLayers.Bounds object
                 * */
                createBounds: function (mapInstance, geoJsonCoordinateArray, projection) {
                    if (projection) {
                        var view = mapInstance.getView();
                        var topLeft = ol.proj.transform([geoJsonCoordinateArray[0][0], geoJsonCoordinateArray[0][1]], view.getProjection(), projection);
                        var bottomRight = ol.proj.transform([geoJsonCoordinateArray[0][0], geoJsonCoordinateArray[0][1]], view.getProjection(), projection);
                        return [
                            topLeft[0],
                            topLeft[1],
                            bottomRight[0],
                            bottomRight[1]
                        ];
                    }
                    return [
                        geoJsonCoordinateArray[0][0],
                        geoJsonCoordinateArray[0][1],
                        geoJsonCoordinateArray[1][0],
                        geoJsonCoordinateArray[1][1]
                    ];
                },
                /**
                 * Zooms to a specified extent
                 * //TODO What is common data structure for 'extent' object, current takes OpenLayers bounds
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param extent {Object} - OpenLayers.Bounds object
                 * @example
                 * var bounds = mapController.createBounds([[100.0,-20.0],[160.0,-20.0],[100.0,-40.0],[160.0,-40.0]]);
                 * mapController.zoomToExtent(bounds);
                 * */
                zoomToExtent: function (mapInstance, extent) {

                },
                //TODO sensible errors when unsupported layerId is used.
                zoomToLayer: function (mapInstance, layerId) {
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    if (layer == null) {
                        throw new ReferenceError('Layer not found - id: "' + layerId + '".');
                    }
                    //Only valid for some layers
                    var extent = layer.getExtent();
                    if (extent == null) {
                        // If not extent, ignore and do nothing.
                        return;
                    }
                    //var transformedExtent = extent.transform(new OpenLayers.Projection(mapInstance.getProjection()), layer.projection);
                    mapInstance.getView().fitExtent(extent, mapInstance.getSize());
                },
                /**
                 * Sets a new zoom level of on the map instance
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param zoomLevel {Number} - zoom level between 1-19, not all zoom levels are valid for every map.
                 * */
                zoomTo: function (mapInstance, zoomLevel) {
                    if (typeof zoomLevel === 'object') {
                        throw new TypeError('Expected number');
                    }
                    mapInstance.getView().setZoom(zoomLevel);
                },
                /**
                 * Changes base layer to specified layer ID
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param layerId {string} - ID of the layer that is to be the new base layer
                 * */
                setBaseLayer: function (mapInstance, layerId) {
                    var layers = service._getLayersBy(mapInstance, 'isBaseLayer', true);

                    layers.forEach(function (layer) {
                        if (layer.get('id') === layerId) {
                            layer.setVisible(true);
                        } else {
                            layer.setVisible(false);
                        }
                    });
                },
                /**
                 * Updates the maps view to center on the lon/lat provided.
                 * Assumed same projection unless projection provided.
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * @param lat {Number} - Latitude of the new centre position.
                 * @param lon {Number} - Longitude of the new centre position.
                 * @param projection {string} - Projection of the provided lat and lon.
                 * */
                setCenter: function (mapInstance, lat, lon, projection) {

                    var point = [lon, lat];
                    if (projection == null) {
                        mapInstance.getView().setCenter(point);
                    } else {
                        var transformedExtent = ol.proj.transform(point, projection, mapInstance.getView().getProjection());
                        mapInstance.getView().setCenter(transformedExtent);
                    }
                },
                setInitialPositionAndZoom: function (mapInstance, args) {
                    // If a permalink has been provided use th zoom level and current position provided,
                    // other wise use the defaults provided by the config
                    if (service.getParameterByName('zoom') !== '' && args.centerPosition != null) {
                        throw new Error("NotImplemented");
                    }
                },
                isBaseLayer: function (mapInstance, layerId) {
                    var layers = mapInstance.getLayers();
                    var layerDrawIndex = null;
                    var i = 0;
                    var found = false;
                    layers.forEach(function (layer) {
                        if (layer.get('id') === layerId && !found) {
                            layerDrawIndex = i;
                            found = true;
                        }
                        i++;
                    });
                    return layerDrawIndex === 0;
                },
                /**
                 * Updates the layer with the specified layerId with the provided opacity
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * @param layerId {string} - ID of the layer to have opacity updated.
                 * @param opacity {Number} - new opacity value between 0 and 1.0.
                 * */
                setOpacity: function (mapInstance, layerId, opacity) {
                    if (typeof opacity === 'object') {
                        throw new TypeError("Expected number");
                    }
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    layer.setOpacity(opacity);
                },
                /**
                 * Updates all layers as the map contains size has been changed.
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * */
                mapResized: function (mapInstance) {
                    mapInstance.updateSize();
                    for (var i = 0; i < mapInstance.getLayers().length; i++) {
                        mapInstance.getLayers()[i].redraw(true);
                    }
                },
                setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl, args) {
                    var markerLayer = olv3LayerService.getLayerBy(mapInstance, 'name', markerGroupName);
                    var latLon = mapInstance.getCoordinateFromPixel([coords.x,coords.y]);
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(latLon)
                    });
                    iconFeature.setId(GAWTUtils.generateUuid());

                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 1.0],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            opacity: args.opacity || 1.0,
                            src: iconUrl
                        }))
                    });

                    iconFeature.setStyle(iconStyle);
                    // Marker layer exists so get the layer and add the marker
                    if (markerLayer != null) {
                        markerLayer.getSource().addFeature(iconFeature);
                    } else { // Marker layer does not exist so we create the layer then add the marker
                        var source = new ol.source.Vector();
                        source.addFeature(iconFeature);
                        markerLayer = new ol.layer.Vector({
                            source: source,
                            format: new ol.format.GeoJSON()
                        });
                        markerLayer.set('name', markerGroupName);
                        mapInstance.addLayer(markerLayer);
                    }
                },
                getLonLatFromPixel: function (mapInstance, x, y, projection) {
                    //TODO return gaMaps data structure, eg obj = { lat: Number,lon: Number }
                    //If olv2 returns this structure then, should a new object get created instead
                    //of reference to olv2 obj?
                    if (x == null) {
                        throw new ReferenceError("'x' value cannot be null or undefined");
                    }
                    if (y == null) {
                        throw new ReferenceError("'y' value cannot be null or undefined");
                    }

                    var result = mapInstance.getCoordinateFromPixel([x, y]);
                    if (projection) {
                        result = ol.proj.transform(result,mapInstance.getView().getProjection() , projection);
                    } else if (service.displayProjection && service.displayProjection !== mapInstance.getView().getProjection()) {
                        result = ol.proj.transform(result,mapInstance.getView().getProjection(), service.displayProjection);
                    }
                    return {
                        lon: result[0],
                        lat: result[1]
                    };
                },
                getPixelFromLonLat: function (mapInstance, lon, lat) {
                    if (lon == null) {
                        throw new ReferenceError("'lon' value cannot be null or undefined");
                    }
                    if (lat == null) {
                        throw new ReferenceError("'lat' value cannot be null or undefined");
                    }
                    return mapInstance.getPixelFromCoordinate([lon, lat]);
                },
                getPointFromEvent: function (e) {
                    // Open layers requires the e.xy object, be careful not to use e.x and e.y will return an
                    // incorrect value in regards to your screen pixels
                    return {
                        x: e.pixel[0],
                        y: e.pixel[1]
                    };
                },
                drawPolyLine: function (mapInstance, points, layerName, datum) {
                    if(!layerName) {
                        layerName = GAWTUtils.generateUuid();
                    }
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffcc33',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: '#ffcc33'
                            })
                        })
                    });

                    var startPoint = [points[0].lon, points[0].lat];
                    var endPoint = [points[1].lon, points[1].lat];

                    var geom = new ol.geom.LineString([startPoint,endPoint]);
                    var projection = datum || 'EPSG:4326';
                    geom.transform(projection,mapInstance.getView().getProjection());
                    var feature = new ol.Feature({
                        geometry: geom,
                        name: layerName
                    });
                    feature.setId(GAWTUtils.generateUuid());

                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name',layerName);
                        mapInstance.addLayer(vector);
                    }

                    vector.getSource().addFeature(feature);
                },
                startRemoveSelectedFeature: function (mapInstance, layerName) {
                    var layers = olv3LayerService._getLayersBy(mapInstance, 'name', layerName);
                    if(!layers || layers.length === 0) {
                        $log.warn('Layer "' + layerName + "' not found. Remove selected layer interaction not added.");
                        return;
                    }
                    var layer = layers[0];
                    var select = new ol.interaction.Select();
                    select.on('select', function (e) {
                        var source = layer.getSource();
                        if(source.removeFeature instanceof Function) {
                            if(e.selected instanceof Array) {
                                for (var selectedIndex = 0; selectedIndex < e.selected.length; selectedIndex++) {
                                    var selectedFeature = e.selected[selectedIndex];
                                    for (var sourceIndex = 0; sourceIndex < source.getFeatures().length; sourceIndex++) {
                                        var sourceFeature = source.getFeatures()[sourceIndex];
                                        if(sourceFeature.get('id') === selectedFeature.get('id')) {
                                            source.removeFeature(sourceFeature);
                                        }
                                    }
                                }
                            } else {
                                for (var j = 0; j < source.getFeatures().length; j++) {
                                    var feature = source.getFeatures()[j];
                                    if(feature.get('id') === e.selected.get('id')) {
                                        source.removeFeature(feature);
                                        break;
                                    }
                                }
                            }
                        } else {
                            throw new Error("No valid layer found with name - " + layerName + " - to remove selected features.");
                        }
                        select.getFeatures().clear();
                    });

                    mapInstance.addInteraction(select);
                    updateToolkitMapInstanceProperty(mapInstance,'removeFeaturesControl',select);
                },
                stopRemoveSelectedFeature: function(mapInstance) {
                    var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl');
                    if(removeFeaturesControl) {
                        mapInstance.removeInteraction(removeFeaturesControl);
                        updateToolkitMapInstanceProperty(mapInstance,'removeFeaturesControl', null);
                    }
                },
                removeFeature: function (mapInstance, layerName, feature) {
                    var featureLayer = olv3LayerService.getLayersBy(mapInstance, 'name', layerName);
                    featureLayer.removeFeatures(feature);
                },
                startDrawingOnLayer: function (mapInstance, layerName, args) {
                    var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl');
                    if(removeFeaturesControl) {
                        mapInstance.removeInteraction(removeFeaturesControl);
                    }
                    var interactionType;
                    //Drawing interaction types are case sensitive and represent GeometryType in OpenLayers 3
                    switch (args.featureType.toLowerCase()) {
                        case 'point':
                            interactionType = 'Point';
                            break;
                        case 'line':
                        case 'linestring':
                            interactionType = 'LineString';
                            break;
                        case 'box':
                        case 'polygon':
                            interactionType = 'Polygon';
                            break;
                        case 'circle':
                            interactionType = 'Circle';
                    }
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: args.fillColor || args.color,
                            radius: args.fillRadius || args.radius
                        }),
                        stroke: new ol.style.Stroke({
                            color: args.strokeColor || args.color,
                            width: args.strokeRadius || args.radius,
                            opacity: args.strokeOpacity || args.opacity
                        }),
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: args.circleColor || args.color
                            })
                        })
                    });

                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                        source = vector.getSource();
                    } else {
                        // Create the layer if it doesn't exist
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name',layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }
                    var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction');
                    if(!existingDrawInteraction) {
                        var draw = new ol.interaction.Draw({
                            source: source,
                            type: /** @type {ol.geom.GeometryType} */ (interactionType),
                            format: new ol.format.GeoJSON()
                        });
                        draw.on('drawend', function (e) {
                            if(e.feature) {
                                e.feature.set('id',GAWTUtils.generateUuid());
                            }
                        });
                        updateToolkitMapInstanceProperty(mapInstance,'featureDrawingInteraction' ,draw);
                        mapInstance.addInteraction(draw);
                    }
                },
                stopDrawing: function (mapInstance) {
                    var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction');
                    if(existingDrawInteraction) {
                        mapInstance.removeInteraction(existingDrawInteraction);
                        updateToolkitMapInstanceProperty(mapInstance,'featureDrawingInteraction', null);
                    }
                },
                drawLabel: function (mapInstance, layerName, args) {
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var alignText = args.align === 'cm' ? 'center' : args.align || args.textAlign;
                    var textStyle = new ol.style.Text({
                        textAlign: alignText,
                        textBaseline: args.baseline,
                        font: (args.fontWeight || args.weight || 'normal') + ' ' + (args.fontSize || args.size || '12px') + ' ' + (args.font || 'sans-serif'),
                        text: args.text,
                        fill: new ol.style.Fill({color: args.fillColor || args.color, width: args.fillWdith || args.width || 1}),
                        stroke: new ol.style.Stroke({color: args.outlineColor || args.color, width: args.outlineWidth || args.width || 1}),
                        offsetX: args.offsetX || 0,
                        offsetY: args.offsetY || (args.labelYOffset * -1) || 15,
                        rotation: args.rotation
                    });

                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: args.fillColor || args.color || '#000000'
                            }),
                            stroke: new ol.style.Stroke(
                                {
                                    color: args.strokeColor || args.color || '#000000',
                                    width: args.strokeRadius || args.radius
                                })
                        }),
                        text: textStyle
                    });
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        //vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name',layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var updatedPosition = ol.proj.transform([args.lon, args.lat],
                        (args.projection || service.displayProjection),
                        mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedPosition);
                    var pointFeature = new ol.Feature({
                        geometry: point
                    });
                    pointFeature.setId(GAWTUtils.generateUuid());
                    pointFeature.setStyle(style);
                    vector.getSource().addFeature(pointFeature);

                    // Add the text to the style of the layer
                    //vector.setStyle(style);
                    var format = new ol.format.GeoJSON();


                    //Always return geoJson
                    return angular.fromJson(format.writeFeature(pointFeature));
                },
                drawLabelWithPoint: function (mapInstance,layerName, args) {

                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var alignText = args.align === 'cm' ? 'center' : args.align || args.textAlign;
                    var textStyle = new ol.style.Text({
                        textAlign: alignText,
                        textBaseline: args.baseline,
                        font: (args.fontWeight || args.weight || 'normal') + ' ' + (args.fontSize || args.size || '12px') + ' ' + (args.font || 'sans-serif'),
                        text: args.text,
                        fill: new ol.style.Fill({color: args.fillColor || args.color, width: args.fillWdith || args.width || 1}),
                        stroke: new ol.style.Stroke({color: args.outlineColor || args.color, width: args.outlineWidth || args.width || 1}),
                        offsetX: args.offsetX || 0,
                        offsetY: args.offsetY || (args.labelYOffset * -1) || 15,
                        rotation: args.rotation
                    });
                    var fillColor;
                    var fillColorHex = args.fillColor || args.color || '#000000';
                    var fillOpacity = args.fillOpacity || args.opacity || 0.5;
                    if(fillColorHex.indexOf('#') === 0) {
                        fillColor = GAWTUtils.convertHexAndOpacityToRgbArray(fillColorHex,fillOpacity);
                    } else {
                        fillColor = args.fillColor || args.color;
                    }

                    var strokeColor;
                    var strokeColorHex = args.fillColor || args.color || '#000000';
                    var strokeOpacity = args.strokeOpacity || args.opacity || 1.0;
                    if(strokeColorHex.indexOf('#') === 0) {
                        strokeColor = GAWTUtils.convertHexAndOpacityToRgbArray(strokeColorHex,strokeOpacity);
                    } else {
                        strokeColor = args.strokeColor || args.color;
                    }

                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: args.pointRadius || args.radius || '2',
                            fill: new ol.style.Fill({
                                color: fillColor
                            }),
                            stroke: new ol.style.Stroke(
                                {
                                    color: strokeColor,
                                    width: args.strokeRadius || args.radius
                                })
                        }),
                        text: textStyle
                    });
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name',layerName || args.layerName);
                        mapInstance.addLayer(vector);
                        //vector.setStyle(style);
                    }

                    // Create a point to display the text
                    var updatedPosition = ol.proj.transform([args.lon, args.lat],
                        (args.projection || service.displayProjection),
                        mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedPosition);

                    var pointFeature = new ol.Feature({
                        geometry: point
                    });
                    pointFeature.setId(GAWTUtils.generateUuid());
                    pointFeature.setStyle(style);
                    vector.getSource().addFeature(pointFeature);

                    var features = [pointFeature];
                    var format = new ol.format.GeoJSON();
                    //Always return geoJson
                    return angular.fromJson(format.writeFeatures([pointFeature]));
                },
                getFeatureInfo: function (mapInstance, url, featureType, featurePrefix, geometryName, pointEvent, tolerance) {
                    if(OpenLayers == null) {
                        throw new Error("NotImplemented");
                    }
                    $log.warn('getFeatureInfo not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server');
                    tolerance = tolerance || 0;
                    var deferred = $q.defer();
                    var point = (pointEvent instanceof ol.MapBrowserPointerEvent) ? pointEvent.pixel : pointEvent;
                    var originalPx = new OpenLayers.Pixel(point[0], point[1]);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getCoordinateFromPixel([llPx.x,llPx.y]);
                    var ur = mapInstance.getCoordinateFromPixel([urPx.x,urPx.y]);
                    var bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]);
                    var protocol = new OpenLayers.Protocol.WFS({
                        formatOptions: {
                            outputFormat: 'text/xml'
                        },
                        url: url,
                        version: '1.1.0',
                        srsName: mapInstance.getView().getProjection().getCode(),
                        featureType: featureType,
                        featurePrefix: featurePrefix,
                        geometryName: geometryName,
                        maxFeatures: 100
                    });
                    var filter = new OpenLayers.Filter.Spatial({
                        type: OpenLayers.Filter.Spatial.BBOX,
                        value: bounds
                    });
                    protocol.read({
                        filter: filter,
                        callback: function (result) {
                            if (result.success()) {
                                var geoJSONFormat = new OpenLayers.Format.GeoJSON();
                                var geoJson = geoJSONFormat.write(result.features);
                                var geoObject = angular.fromJson(geoJson);

                                for (var j = 0; j < geoObject.features.length; j++) {
                                    geoObject.features[j].crs = {
                                        "type": "name",
                                        "properties": {
                                            "name": mapInstance.getView().getProjection().getCode()
                                        }
                                    };
                                }
                                deferred.resolve(geoObject);
                            }
                        }
                    });
                    return deferred.promise;
                },
                getFeatureInfoFromLayer: function (mapInstance, callback, layerId, pointEvent, tolerance) {
                    if(OpenLayers == null) {
                        throw new Error("NotImplemented");
                    }
                    $log.warn('getFeatureInfoFromLayer not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server');
                    tolerance = tolerance || 0;
                    var point = (pointEvent instanceof ol.SelectEvent) ? pointEvent.pixel : pointEvent;
                    var originalPx = new OpenLayers.Pixel(point.x, point.y);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getCoordinateFromPixel([llPx.x,llPx.y]);
                    var ur = mapInstance.getCoordinateFromPixel([urPx.x,urPx.y]);
                    var bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]);
                    var layers = olv3LayerService._getLayersBy(mapInstance, 'id', layerId);
                    var layer;
                    if (layers.length > 0) {
                        layer = layers[0];
                    } else {
                        //Throw error;
                        throw new Error("Invalid layer id");
                    }
                    var typeName, featurePrefix;
                    var param = layer.getSource().getParams()["LAYERS"];
                    var parts = (OpenLayers.Util.isArray(param) ? param[0] : param).split(":");
                    if(parts.length > 1) {
                        featurePrefix = parts[0];
                    }
                    typeName = parts.pop();
                    var protocolOptions = {
                        url: layer.getSource().getUrls()[0],
                        featureType: typeName,
                        featurePrefix: featurePrefix,
                        srsName: layer.projection && layer.projection.getCode() ||
                        layer.map && layer.map.getProjectionObject().getCode(),
                        version: "1.1.0"
                    };
                    var protocol = new OpenLayers.Protocol.WFS(OpenLayers.Util.applyDefaults(
                        null, protocolOptions
                    ));

                    var filter = new OpenLayers.Filter.Spatial({
                        type: OpenLayers.Filter.Spatial.BBOX,
                        value: bounds
                    });
                    protocol.read({
                        filter: filter,
                        callback: function (result) {
                            if (result.success()) {
                                var geoJSONFormat = new OpenLayers.Format.GeoJSON();
                                var geoJson = geoJSONFormat.write(result.features);
                                var geoObject = angular.fromJson(geoJson);

                                for (var j = 0; j < geoObject.features.length; j++) {
                                    geoObject.features[j].crs = {
                                        "type": "name",
                                        "properties": {
                                            "name": mapInstance.projection
                                        }
                                    };
                                }
                                callback(geoObject);
                            }
                        }
                    });
                },
                createWfsClient: function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                    throw new Error("NotImplemented");
                },
                addWfsClient: function (wfsClient) {
                    service.wfsClientCache = service.wfsClientCache || [];

                    var wfsClientId = GAWTUtils.generateUuid();
                    service.wfsClientCache[wfsClientId] = wfsClient;

                    return {
                        clientId: wfsClientId
                    };
                },
                is3dSupported: function (mapInstance) {
                    //For OpenLayers 3 we are using ol3-cesium to handle syncing of layers.
                    //If not included, return false as the ol3-cesium library is required.
                    return window.olcs != null;
                },
                is3d: function (mapInstance) {
                    return olCesiumInstance != null ? olCesiumInstance.getEnabled() : false;
                },
                switchTo3dView: function (mapInstance) {
                    //Below validation, regardless of value of getCode() or code_ returns true to BOTH. Needs more investigation.
                    //if(mapInstance.getView().getProjection().getCode() !== 'ESPG:4326' &&
                    //    mapInstance.getView().getProjection().getCode() !== 'ESPG:3857') {
                    //    throw new Error("Map projection not supported. Use EPSG:3857 or EPSG:4326 as the datum-projection to use 3D.");
                    //}
                    if (olCesiumInstance) {
                        olCesiumInstance.setEnabled(true);
                    } else {
                        olCesiumInstance = new olcs.OLCesium({map: mapInstance, target: mapInstance.getTarget()}); // map is the ol.Map instance
                        var scene = olCesiumInstance.getCesiumScene();
                        if(appConfig.cesiumOptions != null && appConfig.cesiumOptions.includeCustomTerrainProvider) {
                            var terrainProvider = new Cesium.CesiumTerrainProvider({
                                url: appConfig.cesiumOptions.customTerrainProviderUrl
                            });
                            scene.terrainProvider = terrainProvider;
                        }

                        $timeout(function () {
                            service.syncMapControlsWithOl3Cesium(mapInstance, mapInstance.getTarget());
                        });

                        olCesiumInstance.setEnabled(true);
                    }

                },
                switchTo2dView: function (mapInstance) {
                    if (olCesiumInstance) {
                        olCesiumInstance.setEnabled(false);
                        service.syncMapControlsWithOl3(mapInstance,mapInstance.getTarget());
                    }
                },
                syncMapControlsWithOl3Cesium: function (mapInstance, targetId) {
                    var controls = mapInstance.getControls();
                    var mapElement = $('#' + targetId)[0];
                    controls.forEach(function (control) {
                        if (control instanceof ol.control.MousePosition && mapElement) {
                            var scene = olCesiumInstance.getCesiumScene();
                            var ellipsoid = scene.globe.ellipsoid;

                            // Mouse over the globe to see the cartographic position
                            var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                            handler.setInputAction(function (movement) {
                                var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                                if (cartesian) {
                                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);

                                    //Update default ol v3 control element for mouse position.
                                    $('.ol-mouse-position')[0].innerText = control.getCoordinateFormat()([longitudeString, latitudeString]);
                                }
                            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                            cesiumMousePositionHandler = handler;
                        }

                        if(control instanceof ol.control.ScaleLine) {
                            //Force update scaleline so measurements don't get out of sync.
                            mapInstance.render();
                        }
                    });
                },
                syncMapControlsWithOl3: function (mapInstance, targetId) {

                },
                searchWfs: function (mapInstance, clientId, query, attribute) {
                    throw new Error("NotImplemented");
                },
                getMeasureFromEvent: function (mapInstance, e) {
                    if(e.feature == null && e.geometry == null) {
                        throw new Error("Feature cannot be null in Measure event");
                    }
                    if(e.geometry != null && e.geometry instanceof Array && e.geometry.length === 2) {
                        e.feature = new ol.Feature(new ol.geom.Point(e.geometry));
                    }
                    if(e.geometry != null && e.geometry instanceof Array && e.geometry.length > 2) {
                        e.feature = new ol.Feature(new ol.geom.LineString(e.geometry));
                    }
                    var feature = e.feature.clone();
                    var geom = feature.getGeometry().transform(mapInstance.getView().getProjection(),service.displayProjection);
                    var format = new ol.format.GeoJSON();
                    var geoJson = format.writeFeature(feature);
                    var featureGeoJson = angular.fromJson(geoJson);
                    var distance = service.getGeometryLength(mapInstance,geom);
                    var units = 'm';
                    if(distance > 1000) {
                        units = 'km';
                        distance = (distance / 1000);
                    }
                    return {
                        measurement: distance,
                        units: units,
                        geoJson: featureGeoJson.geometry
                    };
                },
                getGeometryLength: function (mapInstance, geom) {
                    var coordinates = geom.getCoordinates();
                    var length = 0;
                    var wgs84Sphere = new ol.Sphere(6378137);
                    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                        length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
                    }

                    return length;
                },
                wfsClientCache: {}
            };

            function cleanClientCache(mapInstance, layerService) {
                for (var cache in layerService.postAddLayerCache) {
                    if (layerService.postAddLayerCache.hasOwnProperty(cache)) {
                        var cacheInUse = false;
                        for (var i = 0; i < mapInstance.getLayers().length; i++) {
                            var layer = mapInstance.getLayers()[i];
                            if (cache === layer.id) {
                                cacheInUse = true;
                            }
                        }
                        if (!cacheInUse) {
                            layerService.postAddLayerCache[cache] = null;
                        }
                    }
                }
            }

            return service;
        }]);
})();
var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
/**
 *  An object that represents a longitude and latitude position on the map in within the map instance projection.
 *  @typedef {Object} LonLat
 *  @property {Number} lat - Latitude value as a decimal
 *  @property {Number} lon - Longitude value as a decimal
 *
 *  Point geometry
 *  @typedef {Object} Point
 *  @property {Number} x - Value representing an X component of a point
 *  @property {Number} y - Value representing a Y component of a point
 *
 *  Layer
 *  @typedef {Object} Layer
 *  @property {string} id - A unique identifier
 *  @property {string} name - A display friendly name for the layer
 *  @property {string} type - A string indicating the type of layer, eg WMS
 *  @property {Boolean} visibility - A bool indicating if a layer is currently visible for not.
 *
 *  Distance
 *  @typedef {Object} Distance
 *  @property {Number} meansure - The number of units of distance
 *  @property {string} units - The unit type of the distance number, eg 'km'
 * */
var app = angular.module('gawebtoolkit.mapservices',
	[
		'gawebtoolkit.mapservices.layer.openlayersv2',
        'gawebtoolkit.mapservices.map.openlayersv2',
        'gawebtoolkit.mapservices.layer.openlayersv3',
        'gawebtoolkit.mapservices.map.openlayersv3',
        'gawebtoolkit.mapservices.data.openlayersv2',
        'gawebtoolkit.mapservices.data.openlayersv3'
	]);
//id: olv2Layer.id,
//	name: olv2Layer.name,
//	type: this.getLayerType(olv2Layer),
//	visibility: olv2Layer.visibility,
//	opacity: olv2Layer.opacity

app.factory('GeoLayer', ['GAWTUtils',function (GAWTUtils) {
	"use strict";
	var GeoLayer = function (id, name, type, visibility, opacity) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.visibility = visibility;
		this.opacity = opacity;
	};

    GeoLayer.fromOpenLayersV2Layer = function(layer) {
    	// OpenLayers v2 does not store layer type for ArcGISCache layers
    	var useLayerType = layer.id.indexOf("_ArcGISCache_") === -1;
    	var layerType;
    	
    	if (useLayerType) {
    		layerType = layer.geoLayerType;
    	} else {
    		layerType = "ArcGISCache";
    	}

        var opacity;
        if(typeof layer.opacity === 'string') {
            opacity = Number(layer.opacity);
        } else {
            opacity = layer.opacity;
        }
        
        return new GeoLayer(layer.id,layer.name,layerType,layer.visibility,opacity);
    };

    GeoLayer.fromOpenLayersV3Layer = function(layer) {
        var layerType =layer.geoLayerType;
        var opacity;
        if(typeof layer.get('opacity') === 'string') {
            opacity = Number(layer.get('opacity'));
        } else {
            opacity =layer.get('opacity');
        }

        if(!layer.get('id')) {
            layer.set('id', GAWTUtils.generateUuid());
        }


        return new GeoLayer(layer.get('id'),layer.get('name'),layerType,layer.get('visible'),opacity);
    };
	//define prototypical methods
	//GeoLayer.prototype.myFunction = function () //available on every instance.

	return GeoLayer;
}]);
angular.module('gawebtoolkit.ui.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/main/js/ui/components/base-layer-selector/base-layer-selector.html',
    "<select title=\"Base layer selector\" fix-ie-select ng-options=\"layer.id as layer.name for layer in layersData\"\n" +
    "        ng-model=\"selectedBaseLayerId\"></select>\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/dialog-toggle.html',
    "<button type=\"button\" ng-click=\"toggleDialog()\"><div ng-transclude></div></button>"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/layers-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\n" +
    "    <div ng-repeat=\"layer in layersData\">\n" +
    "        <ga-layer-control map-controller=\"mapController\" layer-data=\"layer\"></ga-layer-control>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/search-wfs.html',
    "<input type=\"text\" class=\"search-box\" ng-model=\"query\"\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\" placeholder=\"{{placeHolder}}\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" ng-click=\"searchButtonClicked()\"\n" +
    "       accesskey=\"4\" alt=\"Search using your entered search criteria\"\n" +
    "       title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\">"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/static-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\n" +
    "    <div ng-transclude></div>\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"Place name search\" ng-model=\"query\"\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\"\n" +
    "       typeahead=\"result as result.properties.name for result in getSearchResults($viewValue)\"\n" +
    "       typeahead-template-url=\"{{resultTemplateUrl}}\"\n" +
    "       typeahead-on-select=\"onSelected($item, $model, $label)\"\n" +
    "       typeahead-wait-ms=\"200\" typeahead-editable=\"true\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\n" +
    "       ng-click=\"searchButtonClicked()\"\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/google-place-name-search/google-place-name-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"{{placeHolder}}\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/layer-control/layer-control.html',
    "<label for=\"{{elementId}}\" class=\"checkbox\" style=\"display:inline-block;width:65%\">\n" +
    "    <input id=\"{{elementId}}\" type=\"checkbox\" ng-model=\"layerData.visibility\" ng-click=\"layerClicked()\"\n" +
    "           ng-disabled=\"layerDisabled\"/>{{layerData.name}}\n" +
    "</label>\n" +
    "<div style=\"display:inline;width:30%\" ng-transclude></div>\n" +
    "<div ng-show=\"layerData.visibility\" class=\"gaLayerControlSliderContainer\">\n" +
    "    <ga-layer-opacity-slider\n" +
    "            map-controller=\"mapController\"\n" +
    "            layer-opacity=\"layerData.opacity\"\n" +
    "            layer-id=\"{{layerData.id}}\"\n" +
    "            layer-disabled=\"layerDisabled\"\n" +
    "            on-opacity-change=\"changeOpacity(layerId,opacity)\"\n" +
    "            title-text=\"Opacity control for layer - {{layerData.name}}\">\n" +
    "    </ga-layer-opacity-slider>\n" +
    "</div>\n"
  );


  $templateCache.put('src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html',
    "<button ng-click=\"toggleClicked()\" class=\"gaUiToggleOff\" type=\"button\">\n" +
    "    <div ng-transclude></div>\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/layers-drop-down/layers-drop-down.html',
    "<div>\n" +
    "    <select fix-ie-select ng-model=\"selectedModel\" ng-change=\"selectLayer()\"\n" +
    "            ng-options=\"dropDownLayer.id as dropDownLayer.name for dropDownLayer in layersData\">\n" +
    "    </select>\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/measure-toggle/measure-toggle.html',
    "<button type=\"button\" ng-click=\"handleToggle()\" class=\"gaUiToggleOff\">\n" +
    "    <span ng-transclude></span>\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/opacity-slider/opacity-slider.html',
    "<div ui-jq=\"slider\" ui-options=\"getSliderOptions()\"></div>"
  );

}]);

/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.base-layer-selector', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);


    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaBaseLayerSelector
     * @param {Layer[]} layersData - Layers that the control uses to switch base layers
     * @param {object} mapController - controller instance for the map
     * @param {string} controllerEmitEventName - event that is fired that passes the controller
     * @description
     * This control displays a select box of layers and on change, switches base layers between the proivided
     * list.
     * @scope
     * @restrict E
     * @example
     * <example module="baseLayerSelector">
     * <file name="baseLayerSelector.html">
     * <div ng-controller="ourMapController">
     *     <ga-base-layer-selector
     *        layers-data="baseLayers"
     *        controller-emit-event-name="ourDropDownEvent"
     *        map-controller="mapController">
     *    </ga-base-layer-selector>
     *    <div id="map"></div>
     *    <ga-map
     *        map-element-id="map"
     *        datum-projection='EPSG:102100'
     *        display-projection='EPSG:4326'
     *        center-position='[130, -25]'
     *        zoom-level="4">
     *        <ga-map-layer
     *            layer-name="World Image"
     *            layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
     *            wrap-date-line="true"
     *            layer-type="XYZTileCache"
     *            is-base-layer="true"
     *            visibility="false">
     *        </ga-map-layer>
     *        <ga-map-layer
     *            layer-name="World Political Boundaries"
     *            layer-url="http://www.ga.gov.au/gis/rest/services/topography/World_Political_Boundaries_WM/MapServer"
     *            wrap-date-line="true"
     *            layer-type="XYZTileCache"
     *            is-base-layer="true"
     *            visibility="false">
     *        </ga-map-layer>
     *        <ga-map-layer
     *            layer-name="Overview World Screen"
     *            layer-type="GoogleStreet"
     *            is-base-layer="true">
     *        </ga-map-layer>
     *        <ga-map-layer
     *            layer-name="Earthquake hazard contours"
     *            layer-type="WMS"
     *            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     *            is-base-layer="false"
     *            layers="hazardContours"
     *            background-color="#ffffff">
     *        </ga-map-layer>
     *     </ga-map>
     * </div>
     *</file>
     *<file name="baseLayerSelector.js">
     *        var app = angular.module('baseLayerSelector',
     *        ['gawebtoolkit.core', 'gawebtoolkit.ui']);
     *        app.controller("ourMapController",["$scope", function($scope) {
 *                $scope.$on("mapControllerReady", function(event, args) {
 *                    $scope.mapController = args;
 *                    $scope.$on("layersReady", function() {
 *                        $scope.layers = $scope.mapController.getLayers();
 *                        $scope.baseLayers = $scope.layers.filter(function(layer) {
 *                            return $scope.mapController.isBaseLayer(layer.id);
 *                        });
 *                    });
 *                });
 *                $scope.$on("ourDropDownEvent", function(event, args) {
 *                    $scope.dropDownController = args;
 *                    $scope.selectedLayerChanged = function(layerId) {
 *                        $scope.mapController.setLayerVisibility(layerId, false);
 *                    };
 *                });
 *            }]);
     *</file>
     *<file name="baseLayerSelector.css">
     *#map {
 *    width: 670px;
 *    height: 500px;
 *    background-color: #21468b;
 *    margin-top: 10px !important;
 *}
     *</file>
     * </example>
     */
    app.directive('gaBaseLayerSelector', ['$timeout', function ($timeout) {
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/base-layer-selector/base-layer-selector.html',
            replace: true,
            scope: {
                layersData: '=',
                mapController: '=',
                controllerEmitEventName: '@'
            },
            controller: ['$scope', function ($scope) {
                var self = this;

                self.selectBaseLayer = function (layerId) {
                    $scope.selectedBaseLayerId = layerId;
                };

                $scope.$emit($scope.controllerEmitEventName, self);

            }],
            link: function ($scope) {
                $scope.$watch('selectedBaseLayerId', function (newVal) {
                    if (newVal != null) {
                        $scope.mapController.setBaseLayer(newVal);
                    }
                });

                $scope.$watch('layersData', function (newVal) {
                    if (newVal) {
                        for (var i = 0; i < newVal.length; i++) {
                            if ($scope.layersData[i].visibility === true) {
                                setSelectedValue($scope.layersData[i]);
                            }
                        }
                    }
                });

                //Timeout is used due to problem with $watch only fires of array changes, not objects inside
                var setSelectedValue = function (layer) {
                    $timeout(function () {
                        $scope.selectedBaseLayerId = layer.id;
                    });
                };
            },
            transclude: true
        };
    }]);
})();
/* global angular, $ */
(function () {
    "use strict";
    angular.module('gawebtoolkit.ui.components', [
        'gawebtoolkit.ui.components.opacity-slider',
        'gawebtoolkit.ui.components.layer-control',
        'gawebtoolkit.ui.components.layers-drop-down',
        'gawebtoolkit.ui.components.base-layer-selector',
        'gawebtoolkit.ui.components.google-place-name-search',
        'gawebtoolkit.ui.components.geo-place-name-search',
        'gawebtoolkit.ui.components.layer-interaction-toggle',
        'gawebtoolkit.ui.components.deprecated',
        'gawebtoolkit.ui.components.measure-toggle'
    ]);
})();
/* global angular, $ */
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.deprecated',['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * */
    app.directive('gaDialogToggle', [ function () {
        'use strict';
        return {
            restrict: "E",
            templateUrl:'src/main/js/ui/components/deprecated/dialog-toggle.html',
            transclude: true,
            scope: {
                gaDialogController: '=',
                gaToggleClicked: '&'
            },
            link: function ($scope) {
                $scope.toggleDialog = function () {
                    var dialogOpen = !$scope.gaDialogController.isClosed();
                    if (!dialogOpen) {
                        $scope.gaDialogController.openDialog();
                    } else {
                        $scope.gaDialogController.closeDialog();
                    }
                    $scope.gaToggleClicked({
                        dialogController: $scope.gaDialogController
                    });
                };
            }
        };
    } ]);

    /**
     *
     * */
    app.directive('gaStaticDialog', ['$timeout', 'GAWTUtils', function ($timeout, GAWTUtils) {
        return {
            restrict: "AE",
            templateUrl: 'src/main/js/ui/components/deprecated/static-dialog.html',
            scope: {
                controllerEmitEventName: '@',
                dialogConfig: '=',
                dialogWindowResize: '&',
                dialogClosed: '&',
                dialogOpened: '&'
            },
            controller: ['$scope', function ($scope) {
                $(window).bind('resize', function () {
                    if ($scope.dialogWindowResize != null) {
                        $scope.dialogConfig = angular.extend($scope.dialogConfig, $scope.dialogWindowResize());
                    }
                    //Reinitialise dialog on window resize, resets position to correct relative location
                    //Force last closed state
                    $scope.dialogConfig.autoOpen = !$scope.isClosed;
                    $('#' + $scope.dialogId).dialog($scope.dialogConfig);
                });
                //Initialise id element to use for cleaning up/closing the dialog
                $scope.dialogId = GAWTUtils.generateUuid();
                var self = this;
                self.openDialog = function () {
                    $('#' + $scope.dialogId).dialog('open');
                    $scope.isClosed = false;
                    $scope.dialogOpened();
                };
                self.closeDialog = function () {
                    $('#' + $scope.dialogId).dialog('close');
                    $scope.isClosed = true;
                    $scope.dialogClosed();
                };
                self.isClosed = function () {
                    return $scope.isClosed;
                };
                $scope.$emit($scope.controllerEmitEventName, self);
            }],
            link: function ($scope) {
                $scope.$on('$destroy', function () {
                    $('#' + $scope.dialogId).dialog('destroy').remove();
                });

                var dialogConfigWatch = $scope.$watch('dialogConfig', function (data) {
                    if (data != null) {
                        $scope.dialogReady = true;
                        $('#' + $scope.dialogId).bind('dialogclose', function () {
                            $scope.isClosed = true;
                            $timeout(function () {
                                $scope.$apply();
                            });
                            $scope.dialogClosed();
                        });
                        $scope.isClosed = !data.autoOpen;
                        dialogConfigWatch();
                    }
                });

            },
            transclude: true
        };
    }]);

    /*
     * gaLayersDialog renders a list of layers that can be turned off and on
     *
     * attributes
     *   dialog-config: jquery dialog options that are bound to dialog and will update the dialog on change
     *   layers-data: an array of layers to be displayed expected structure is
     *       [{
     *           id: //unique id of the layer
     *           opacity: //value betweeb 0-100 representing the percentage of opacity of the layer
     *           visibility: //boolean representing if layer is visible
     *           name: //friendly name of the layer
     *       }]
     *   mapController: a controller that has access to the mapInstance object that exposes the same contract as 'ga-map'
     *
     *   filterFn ? This directive could be expanded to customise the way the layers are filtered
     * */
    app.directive('gaLayersDialog', ['GAWTUtils', function (GAWTUtils) {
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/deprecated/layers-dialog.html',
            scope: {
                layersData: '=',
                dialogConfig: '=',
                mapController: '='
            },
            controller: ['$scope', function ($scope) {
                $(window).bind('resize', function () {
                    //Reinitialise dialog on window resize, resets position to correct relative location
                    //Force last closed state
                    $scope.dialogConfig.autoOpen = !$scope.isClosed;
                    $('#' + $scope.dialogId).dialog($scope.dialogConfig);
                });
                //Initialise id element to use for cleaning up/closing the dialog
                $scope.dialogId = GAWTUtils.generateUuid();

                $scope.isClosed = !$scope.dialogConfig.autoOpen;
                var self = this;
                self.openDialog = function () {
                    $('#' + $scope.dialogId).dialog('open');
                    $scope.isClosed = false;
                };
                self.closeDialog = function () {
                    $('#' + $scope.dialogId).dialog('close');
                    $scope.isClosed = true;
                };
                self.isClosed = function () {
                    return $scope.isClosed;
                };
                $scope.$emit('layersDialogReady', self);
            }],
            link: function ($scope, $element, $attrs) {
                $scope.filterBaseLayers = function (layer) {
                    var layerIsBaseLayer = $scope.mapController.isBaseLayer(layer.id);
                    return !layerIsBaseLayer;
                };
                $scope.$on('$destroy', function () {
                    $('#' + $scope.dialogId).dialog('destroy').remove();
                });

                $scope.$watch($attrs.uiRefresh, function () {
                    $('#' + $scope.dialogId).bind('dialogclose', function () {
                        $scope.isClosed = !$scope.isClosed;
                    });
                });
            },
            transclude: true
        };
    }]);

    /**
     * @ngdoc directive
     * @deprecated [Deprecated since version 0.2.1 - not supported]
     * @name gawebtoolkit.ui.directives:gaSearchWfs
     * @param {object} mapController - Map controller
     * @param {string} resultTemplateUrl -
     * @param {object} searchEndPoints -
     * @param {function} onResults -
     * @param {function} onResultsSelected -
     * @param {function} onPerformSearch -
     * @param {string} primaryWfsProperty -
     * @param {string} searchIconUrl -
     * @param {string} placeHolder -
     * @param {string} activateKey -
     * @description
     * deprecated
     * @scope
     * @restrict E
     * @example
     */
    app.directive('gaSearchWfs', ['$q', '$interpolate', '$log', function ($q, $interpolate, $log) {
        //Using 'result.id' as the result features coming back should have a server id.
        //Specific property names are dynamic and cannot be relied on.
        return {
            restrict: "EA",
            templateUrl: 'src/main/js/ui/components/deprecated/search-wfs.html',
            scope: {
                resultTemplateUrl: '@',
                mapController: '=',
                searchEndPoints: '=',
                onResults: '&',
                onResultsSelected: '&',
                onPerformSearch: '&',
                primaryWfsProperty: '@',
                searchIconUrl: '@',
                placeHolder: '@',
                activateKey: '@'
            },
            controller: ['$scope', function ($scope) {
                $scope.waitingForResponse = false;
            }],
            link: function ($scope, $element, $attrs) {
                $element.bind('keydown', function (args) {
                    if (args.keyCode == $scope.activateKey) {
                        $scope.searchButtonClicked();
                        $scope.$apply();
                    }
                });
                var clients = [];
                var attribute;
                $scope.limitResults = 10;

                $scope.$watch('searchEndPoints', function (newVal) {
                    if (newVal) {
                        if ($scope.mapController == null) {
                            return;
                        }
                        clients = [];
                        for (var i = 0; i < $scope.searchEndPoints.length; i++) {
                            var wfsClient = $scope.mapController.createWfsClient($scope.searchEndPoints[i].url, $scope.searchEndPoints[i].featureType,
                                $scope.searchEndPoints[i].featurePrefix, $scope.searchEndPoints[i].version, $scope.searchEndPoints[i].geometryName,
                                $scope.searchEndPoints[i].datumProjection, $scope.searchEndPoints[i].isLonLatOrderValid);

                            var clientDto = $scope.mapController.addWfsClient(wfsClient);
                            clientDto.endPointId = $scope.searchEndPoints[i].id;
                            clients.push(clientDto);
                            attribute = $scope.searchEndPoints[i].featureAttributes;
                        }
                    }
                });

                if ($attrs.searchEndPoints == null) {
                    if ($scope.mapController != null) {
                        var wfsClient = $scope.mapController.createWfsClient($scope.url, $scope.featureType, $scope.featurePrefix, $scope.version,
                            $scope.geometryName, $scope.datumProjection);

                        clients.push($scope.mapController.addWfsClient(wfsClient));
                    }
                }
                function filterQuery(searchQuery) {
                    return searchQuery.replace('\'', '').replace('"', '').replace('%', '').replace('*', '');
                }

                var searchFunction = function (query) {
                    query = filterQuery(query);
                    //Due to problems with some implementations of WFS, filter query term values.
                    $scope.searchResults = [];
                    var deferred = $q.defer();
                    var count = 0;
                    var allResults = [];
                    $scope.waitingForResponse = true;

                    //As we are using WFS for search, we iterate over a list of endpoints making the same
                    //query and once all endpoints return, we provide results
                    for (var i = 0; i < clients.length; i++) {
                        var currentClient = clients[i];
                        $scope.mapController.searchWfs(clients[i].clientId, query, attribute).then(function (data) {

                            if (data == null) {
                                $log.error("Search server is unavailable.");
                                deferred.resolve([]);
                                return;
                            }
                            count++;

                            for (var j = 0; j < data.features.length; j++) {
                                data.features[j].endPointId = currentClient.endPointId;
                                allResults.push(data.features[j]);
                            }

                            if (count === clients.length) {
                                deferred.resolve(allResults);
                                $scope.waitingForResponse = false;
                            }
                        });
                    }
                    return deferred.promise;
                };

                $scope.getSearchResults = function (query) {
                    if (query != null && query.length >= 3) {
                        return searchFunction(query).then(function (data) {
                            $scope.onResults({
                                data: data
                            });
                            //Limit typeahead to 10 results
                            return data.slice(0, 10);
                        });
                    } else {
                        return [];
                    }
                };

                $scope.onSelected = function ($item) {
                    $scope.onResultsSelected({
                        item: $item
                    });
                };

                $scope.searchButtonClicked = function () {
                    //For the case where typeahead populates the $scope.query value with the selected item
                    //We want to query with the value of the primary property as that will be the text in the
                    //input field.
                    if (typeof $scope.query === 'object' && $scope.query.properties != null) {
                        $scope.query = $scope.query.properties[$scope.primaryWfsProperty];
                    }
                    if ($scope.query != null) {
                        return searchFunction($scope.query).then(function (data) {
                            $scope.onPerformSearch({
                                data: data
                            });
                            return data;
                        });
                    }
                };
            },
            transclude: true
        };
    } ]);
})();
/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.geo-place-name-search', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:geoNamesPlaceSearch
     * @param {object} mapController - Map controller
     * @param {string} searchIconUrl - Path to an icon used for search
     * @param {string} geoNamesApiKey - Username to use for geonames.org web service
     * @param {number} zoomLevel - Zoom level after selection from autocomplete
     * @param {string} countryCode - Country code to be used in the search
     * @param {string} resultTemplateUrl - URL for the result template HTML
     * @param {Function} onResults - function called when results are returned
     * @param {Function} onResultsSelected -  function called when a result is selected
     * @param {Function} onPerformSearch - function called when search is performed
     * @param {number} activateKey - key code for activating the search
     * @description
     * Simple control exposing google auto complete search which zooms on selection.
     * @scope
     * @restrict E
     * @example
     */
    app.directive('geoNamesPlaceSearch', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        return {
            restrict: 'E',
            templateUrl:'src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html',
            scope: {
                mapController: '=',
                searchIconUrl: '@',
                geoNamesApiKey: '@',
                zoomLevel: '@',
                countryCode: '@',
                resultTemplateUrl: '@',
                onResults: '&',
                onResultsSelected: '&',
                onPerformSearch: '&',
                activateKey: '@'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function ($scope, $element) {
                var input = $element.find('input[type="text"]')[0];
                $element.bind('keydown', function (args) {
                    if (args.keyCode == $scope.activateKey) {
                        if ($scope.typeAheadSelected) {
                            return;
                        }
                        $scope.searchButtonClicked();
                        $scope.$apply();
                    }
                });
                var searchFunction = function (query, rowCount) {
                    //input box is populated with an object on selection of typeahead
                    if (typeof query === 'object') {
                        query = query.properties.name;
                    }
                    $scope.searchResults = [];
                    var deferred = $q.defer();
                    $scope.waitingForResponse = true;
                    var url = 'http://api.geonames.org/searchJSON?q=' + encodeURIComponent(query).replace("%20", "+") +
                        '&maxRows=' + rowCount + '&country=' + $scope.countryCode.toUpperCase() +
                        '&username=' + $scope.geoNamesApiKey;
                    $http.get(url).success(function (results) {
                        $scope.waitingForResponse = false;
                        var geoJsonResults = [];
                        for (var i = 0; i < results.geonames.length; i++) {
                            var geoName = results.geonames[i];
                            geoJsonResults.push($scope.convertGeoNameToGeoJson(geoName));
                        }
                        deferred.resolve(geoJsonResults);
                    });

                    return deferred.promise;
                };

                $scope.getSearchResults = function (query) {
                    if (!(query != null && query.length >= 3)) {
                        return [];
                    }

                    return searchFunction(query, 10).then(function (data) {
                        if ($scope.searchInProgress) {
                            return [];
                        }
                        $scope.onResults({
                            data: data
                        });
                        return data;
                    });
                };

                $scope.onSelected = function ($item) {
                    $scope.typeAheadSelected = true;
                    //Do not re-run query if activateKey is the same as typeahead selection
                    $timeout(function () {
                        $scope.typeAheadSelected = false;
                    }, 50);
                    $scope.onResultsSelected({
                        item: $item
                    });
                };

                $scope.searchButtonClicked = function () {
                    $scope.searchInProgress = true;
                    if ($scope.query != null) {
                        return searchFunction($scope.query, 50).then(function (data) {
                            $scope.searchInProgress = false;
                            $scope.onPerformSearch({
                                data: data
                            });
                            return data;
                        });
                    }
                };

                $scope.convertGeoNameToGeoJson = function (geoNameResult) {
                    var geoJson = {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [geoNameResult.lng, geoNameResult.lat]
                        },
                        crs: {
                            type: "name",
                            properties: {
                                name: "EPSG:4326"
                            }
                        }
                    };
                    geoJson.properties = {};
                    for (var prop in geoNameResult) {
                        if (geoNameResult.hasOwnProperty(prop)) {
                            geoJson.properties[prop] = geoNameResult[prop];
                        }
                    }
                    return geoJson;
                };
            }
        };
    }]);
})();
/* global angular, $, google */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.google-place-name-search', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:googlePlaceNameSearch
     * @param {object} mapController - Map controller
     * @param {string} searchIconUrl - Path to an icon used for search
     * @param {number} zoomLevel - Zoom level after selection from autocomplete
     * @param {string} countryCode - Google country code to be used in the search
     * @description
     * Simple control exposing google auto complete search which zooms on selection.
     * @scope
     * @restrict E
     * @example
     */
    app.directive('googlePlaceNameSearch', [function () {
        return {
            restrict: 'E',
            templateUrl: 'src/main/js/ui/components/google-place-name-search/google-place-name-search.html',
            scope: {
                mapController: '=',
                searchIconUrl: '@',
                zoomLevel: '@',
                countryCode: '@'
            },
            controller: ['$scope', function ($scope) {

            }],
            link: function ($scope, $element) {
                var input = $element.find('input[type="text"]')[0];
                var googleAC = new google.maps.places.Autocomplete(input, {componentRestrictions: {country: $scope.countryCode}});
                google.maps.event.addListener(googleAC, 'place_changed', function () {
                    var place = googleAC.getPlace();
                    if (!place.geometry) {
                        return;
                    }
                    $scope.mapController.zoomTo($scope.zoomLevel);
                    $scope.mapController.setCenter(place.geometry.location.k, place.geometry.location.A, "EPSG:4326");
                });
            }
        };
    }]);
})();
/* global angular, $ */
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.layer-control', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);


    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaLayerControl
     * @description
     * A control for turning on/off layers via provided '=mapController' as well as opacity slider
     * @param {Layer[]} layersData - Layers that the toolbar will interact with
     *  structure expected is a minimum of:
     *       {
 *           id: //unique id of the layer
 *           opacity: //value betweeb 0-100 representing the percentage of opacity of the layer
 *           visibility: //boolean representing if layer is visible
 *           name: //friendly name of the layer
 *       }
     * @param {mapController[]} mapController - mapController object
     * @param {string} onVisible - A callback function when user turns on the layer
     * @param {string} onHidden - A callback function when user turns off the layer
     * @param {string} onOpacityChange - A callback function when user changes the opacity of the layer
     * @scope
     * @restrict E
     * @example
     * <example module="mapWithUIController">
     * <file name="mapWithUIController.html">
     * <div ng-controller="ourMapController">
     * <ga-layer-control
     *  layer-data="layers[1]"
     *  map-controller="mapController"
     *  class="alert alert-info"></ga-layer-control>
     * <div id="map"></div>
     * <ga-map
     *   map-element-id="map"
     *   datum-projection='EPSG:102100'
     *   display-projection='EPSG:4326'
     *   center-position='[130, -25]'
     *   zoom-level="4">
     *   <ga-map-layer
     *       layer-name="Overview World Screen"
     *       layer-type="GoogleStreet"
     *       is-base-layer="true">
     *   </ga-map-layer>
     *   <ga-map-layer
     *       layer-name="Earthquake hazard contours"
     *       layer-type="WMS"
     *       layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     *       is-base-layer="false"
     *       layers="hazardContours"
     *       background-color="#ffffff">
     *   </ga-map-layer>
     * </ga-map>
     * </div>
     * </file>
     * <file name="mapWithUIController.js">
     * var app = angular.module('mapWithUIController',['gawebtoolkit.core', 'gawebtoolkit.ui']);
     * app.controller("ourMapController",["$scope", function($scope) {
 *       $scope.$on("mapControllerReady", function(event, args) {
 *           $scope.mapController = args;
 *           $scope.$on("layersReady", function() {
 *               $scope.layers = $scope.mapController.getLayers();
 *           });
 *       });
 *   }]);
     * </file>
     * <file name="mapWithUIController.css">
     * #map {
 * width: 570pcx;
 * height: 530px;
 * display: inline-block;
 * }
     * .alert {
 *   border: 1px solid silver;
 *   color:grey;
 *   position: relative;
 *   float: left;
 *   margin-left: 10px;
 * }
     * .alert label {
 *   margin: 10px;
 * }
     * </file>
     * </example>
     *
     */
    app.directive('gaLayerControl', ['GAWTUtils',
        function (GAWTUtils) {
            return {
                restrict: "E",
                templateUrl: 'src/main/js/ui/components/layer-control/layer-control.html',
                scope: {
                    layerData: '=',
                    mapController: '=',
                    onVisible: '&',
                    onHidden: '&',
                    onOpacityChange: '&',
                    layerDisabled: '=',
                    onStartLoading: '&',
                    onFinishedLoading: '&'
                },
                controller: ['$scope', function ($scope) {
                    $scope.elementId = GAWTUtils.generateUuid();
                }],
                compile: function compile() {
                    return {
                        post: function postLink(scope) {
                            var loadStartEvent = function () {
                                scope.onStartLoading({layerId: scope.layerData.id});
                            };
                            var loadend = function () {
                                scope.onFinishedLoading({layerId: scope.layerData.id});
                            };
                            //Event to be cleaned up on map destruction
                            scope.$watch('layerData', function (newVal) {
                                if(newVal != null) {
                                    //Parse possible coerced value
                                    scope.layerData.visibility = scope.layerData.visibility === true || scope.layerData.visibility === 'true';
                                    if(scope.mapController == null) {
                                        throw new Error("mapController is not available");
                                    }
                                    if (scope.layerData.id != null) {
                                        scope.mapController.registerLayerEvent(
                                            scope.layerData.id,
                                            "loadstart", loadStartEvent);
                                        scope.mapController.registerLayerEvent(
                                            scope.layerData.id,
                                            "loadend", loadend);
                                    }
                                }
                            });
                        },
                        pre: function preLink(scope) {
                            scope.changeOpacity = function (layerId,opacity) {
                                scope.onOpacityChange({
                                    layerId: layerId,
                                    opacity: opacity
                                });
                            };
                            scope.layerClicked = function () {
                                scope.layerData.visibility = !scope.layerData.visibility;
                                scope.mapController.setLayerVisibility(scope.layerData.id,scope.layerData.visibility);
                                if (scope.layerData.visibility) {
                                    scope.onVisible({
                                        layerId: scope.layerData.id
                                    });
                                } else {
                                    scope.onHidden({
                                        layerId: scope.layerData.id
                                    });
                                }
                            };
                        }
                    };
                },
                transclude: true
            };
        }]);
})();
/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.layer-interaction-toggle',['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaLayerInteractionToggle
     * @param {string} toggleIconSource - A string value of toggle button's icon URL
     * @param {object} mapController - controller instance for the map
     * @param {string} controllerEmitEventName - event that is fired that passes the controller
     * @param {function} toggleOffCallback - Callback function to be called when toggle button is turns off
     * @param {function()} toggleOnCallback - Callback function to be called when toggle button turns on
     * @param {function} onLayerClickCallBack - Callback function to be called when the map layer is clicked
     * @param {string} layerInteractionId - ID of the layer that this toggle button will interact with
     * @description
     * This control provides a button to toggle interaction with a layer on/off
     * @scope
     * @restrict E
     * @example
     * <example module="layerInteractionToggle">
     * <file name="layerInteractionToggle.html">
     * <div ng-controller="ourMapController">
     *         <div class="toolber">
     <ga-layer-interaction-toggle
     toggle-icon-source="//np.ga.gov.au/gamaps/resources/img/Layers.png"
     controller-emit-event-name="toggleInteractionEvent"
     map-controller="mapController"
     layer-interaction-id="layers[1].id"
     on-layer-click-callback="clickCallback()"
     class="toggleInteractionButton">Toggle Interaction of "{{layers[1].name}}" layer on/off
     </ga-layer-interaction-toggle>
     <ga-layer-control ng-show="toggleInteractionController.isToggleActive()" layer-data="layers[1]" map-controller="mapController" class="alert alert-info"></ga-layer-control>
     </div>
     <div class="alert alert-danger layerClicked">Layer Clicked</div>
     <div id="map" style="width:90%;height:600px"></div>
     <ga-map
     map-element-id="map"
     datum-projection='EPSG:102100'
     display-projection='EPSG:4326'
     center-position='[130, -25]'
     zoom-level="4">
     <ga-map-layer
     layer-name="World Image"
     layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
     wrap-date-line="true"
     layer-type="XYZTileCache"
     is-base-layer="true"
     visibility="false">
     </ga-map-layer>
     <ga-map-layer
     layer-name="Earthquake hazard contours"
     layer-type="WMS"
     layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     is-base-layer="false"
     layers="hazardContours"
     background-color="#ffffff">
     </ga-map-layer>
     <ga-map-control map-control-name="mouseposition"></ga-map-control>
     <ga-map-control map-control-name="OverviewMap"></ga-map-control>
     <ga-map-control map-control-name="Permalink"></ga-map-control>
     <ga-map-control map-control-name="ScaleLine"></ga-map-control>
     <ga-map-control map-control-name="panzoombar"></ga-map-control>
     </ga-map>

     * </div>
     * </file>
     *
     * <file name="layerInteractionToggle.js">
     *      var app = angular.module('layerInteractionToggle',
     ['gawebtoolkit.core', 'gawebtoolkit.ui']);
     app.controller("ourMapController",["$scope", function($scope) {
                $scope.$on("mapControllerReady", function(event, args) {
                    $scope.mapController = args;
                    $scope.$on("layersReady", function() {
                        $scope.layers = $scope.mapController.getLayers();
                    });
                });
                $scope.$on("toggleInteractionEvent", function(event, args) {
                    $scope.toggleInteractionController = args;
                    $scope.clickCallback = function() {
                        $(".layerClicked").fadeIn();
                        setTimeout(function() {
                            $(".layerClicked").fadeOut();
                        }, 1000);
                    };
                });
            }]);

     $(".alert-danger")
     .css({
                    "margin-top": "10px",
                    "margin-left": ( ($("#map").width() - $(".alert-danger").width()) / 2 ) + "px"
        });
     * </file>
     *
     * <file name="layerInteractionToggle.css">
     *             #map {
                background-color: #21468b
            }
     .alert-info {
                float: left;
                clear: both;
                min-height: 80px;
                width: 100%;
            }
     .alert-danger {
                position: absolute;
                display: none;
                z-index: 10000;
            }
     .alert label {
                margin-left: 10px;
            }
     .toggleInteractionButton {
                float: left;
            }
     .toolber {
                display: inline-block;
            }
     * </file>
     * </example>
     */
    app.directive('gaLayerInteractionToggle', [ function () {
        return {
            restrict: "E",
            replace: "true",
            templateUrl: 'src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html',
            transclude: true,
            scope: {
                toggleIconSource: '@',
                controllerEmitEventName: '@',
                toggleOnCallback: '&',
                toggleOffCallback: '&',
                onLayerClickCallback: '&',
                mapController: '=',
                layerInteractionId: '='
            },
            controller: ['$scope', function ($scope) {
                var self = this;

                self.activate = function () {
                    $scope.activate();
                };
                self.deactivate = function () {
                    $scope.deactivate();
                };
                self.isToggleActive = function () {
                    return $scope.isToggleOn;
                };

                $scope.$emit($scope.controllerEmitEventName, self);
            }],
            link: function ($scope, $element) {
                $scope.isToggleOn = false;

                $scope.activate = function () {
                    $scope.mapController.registerMapClick(callback);
                    $element.removeClass('gaUiToggleOff');
                    $element.addClass('gaUiToggleOn');
                    $scope.isToggleOn = true;
                    $scope.toggleOnCallback();

                };
                $scope.deactivate = function () {
                    $scope.mapController.unRegisterMapClick(callback);
                    $element.removeClass('gaUiToggleOn');
                    $element.addClass('gaUiToggleOff');
                    $scope.isToggleOn = false;
                    $scope.toggleOffCallback();
                };
                $scope.toggleClicked = function () {
                    $scope.isToggleOn = !$scope.isToggleOn;
                    if ($scope.isToggleOn) {
                        $scope.activate();
                    } else {
                        $scope.deactivate();
                    }
                };

                var callback = function (e) {
                    var xyPoint = $scope.mapController.getPointFromEvent(e);
                    $scope.onLayerClickCallback({
                        point: xyPoint,
                        interactionId: $scope.layerInteractionId
                    });
                };
            }
        };
    } ]);
})();
/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.layers-drop-down', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaLayersDropDown
     * @description
     * This control displays a select box of layers and on change, notify via event. Used in a
     * restricted group of layers. Used for selecting between a list of mutually exclusive layers.
     * @param {Layer[]} layersData - Layers that the control uses to switch layers
     * @param {string} selectedModel - Id of the layer that is currently selected
     * @param {string} controllerEmitEventName - event name that is fired that passes the controller
     * @param {Function} onSelectedLayerChanged - function that is called when the selected value has changed
     * @param {string} layerGroupId - A discriminator that is passed to events to identify which group of layers
     * @scope
     * @restrict E
     * @example
     */
    app.directive('gaLayersDropDown', [ function () {

        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/layers-drop-down/layers-drop-down.html',
            replace: false,
            scope: {
                layersData: '=',
                selectedModel: '=',
                controllerEmitEventName: '@',
                onSelectedLayerChanged: '&',
                onLayersInitialised: '&',
                layerGroupId: '@',
                includeNone: '@'
            },
            controller: ['$scope', function ($scope) {
                var self = this;
                $scope.selectLayer = function () {
                    $scope.onSelectedLayerChanged({
                        layerId: $scope.selectedModel,
                        groupId: $scope.layerGroupId
                    });
                };
                self.selectLayer = $scope.selectLayer;
                $scope.$emit($scope.controllerEmitEventName, self);

            }],
            link: function ($scope) {
                $scope.$watch('layersData', function (newVal) {
                    if (newVal && !$scope.selectedModel) {
                        if ($scope.includeNone && $scope.layersData[0].id !== '$none$') {
                            $scope.layersData.unshift({
                                id: '$none$',
                                name: 'None'
                            });
                        }

                        $scope.selectedModel = newVal[0].id;
                        $scope.onLayersInitialised({
                            layerId: $scope.selectedModel,
                            groupId: $scope.layerGroupId
                        });
                    }
                });
            },
            transclude: true
        };
    } ]);
})();
/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.measure-toggle', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);
    /**
     *
     * */
    app.directive('gaMeasureToggle', [function () {

        return {
            restrict: "EA",
            templateUrl: 'src/main/js/ui/components/measure-toggle/measure-toggle.html',
            scope: {
                resolveStyle: '&',
                toggleOnCallback: '&',
                toggleOffCallback: '&',
                onFinish: '&',
                onUpdate: '&',
                mapControlId: '@',
                controllerEmitEventName: '@',
                mapController: '='
            },
            controller: ['$scope', function ($scope) {
                var self = this;

                self.activate = function () {
                    $scope.activate();
                };
                self.deactivate = function () {
                    $scope.deactivate();
                };
                self.isToggleActive = function () {
                    return $scope.mapController.isControlActive($scope.mapControlId);
                };
                $scope.$emit($scope.controllerEmitEventName, self);
            }],
            link: function ($scope,$element) {

                $scope.handleMeasurements = function (event) {
                    var measurement = $scope.mapController.getMeasureFromEvent(event);
                    $scope.onFinish({
                        event: measurement
                    });
                };
                $scope.handlePartialMeasure = function (event) {
                    var measurement = $scope.mapController.getMeasureFromEvent(event);
                    $scope.onUpdate({
                        event: measurement
                    });
                };
                $scope.activate = function () {
                    $scope.mapController.activateControl($scope.mapControlId);
                    $scope.mapController.registerControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                    $scope.mapController.registerControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
                    $element.removeClass('gaUiToggleOff');
                    $element.addClass('gaUiToggleOn');
                    $scope.toggleOnCallback();
                };
                $scope.deactivate = function () {
                    $scope.mapController.deactivateControl($scope.mapControlId);
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
                    $element.removeClass('gaUiToggleOn');
                    $element.addClass('gaUiToggleOff');
                    $scope.toggleOffCallback();
                };
                $scope.handleToggle = function () {
                    // HACK control name passed in to enable compatibility across OLV2 and OLV3.
                    // TODO convert control to layerInteractionToggle and maintain 'enabled' state locally.
                    if ($scope.mapController.isControlActive($scope.mapControlId,"measureline")) {
                        $scope.deactivate();
                    } else {
                        $scope.activate();
                    }
                };

                $scope.$on('$destroy', function () {
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handleMeasurements);
                });
            },
            transclude: true,
            replace: "true"
        };
    } ]);
})();
/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.opacity-slider', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.ui.directives:gaLayerOpacitySlider
     * @description
     * Adds an opacity slider to the map and attaches it to selected layer
     * @param {string} layersId - The ID of the layer
     * @param {string} layersOpacity - reference to opacity value of the layer
     * @param {mapController[]} mapController - mapController object
     * @scope
     * @restrict E
     * @example
     * <example module="mapWithUISlider">
     * <file name="mapWithUISlider.html">
     * <div ng-controller="ourMapController">
     * <div class="opaictySlider">
     * <ga-layer-opacity-slider
     *  layer-id="{{layers[1].id}}"
     *  layer-opacity="layers[1].opacity"
     *  map-controller="mapController"></ga-layer-opacity-slider>
     *  </div>
     * <div id="map"></div>
     * <ga-map
     *   map-element-id="map"
     *   datum-projection='EPSG:102100'
     *   display-projection='EPSG:4326'
     *   center-position='[130, -25]'
     *   zoom-level="4">
     *   <ga-map-layer
     *       layer-name="Overview World Screen"
     *       layer-type="GoogleStreet"
     *       is-base-layer="true">
     *   </ga-map-layer>
     *   <ga-map-layer
     *       layer-name="Earthquake hazard contours"
     *       layer-type="WMS"
     *       layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer"
     *       is-base-layer="false"
     *       layers="hazardContours"
     *       background-color="#ffffff">
     *   </ga-map-layer>
     * </ga-map>
     * </div>
     * </file>
     * <file name="mapWithUISlider.js">
     * var app = angular.module('mapWithUISlider',['gawebtoolkit.core', 'gawebtoolkit.ui']);
     * app.controller("ourMapController",["$scope", function($scope) {
 *       $scope.$on("mapControllerReady", function(event, args) {
 *           $scope.mapController = args;
 *           $scope.$on("layersReady", function() {
 *               $scope.layers = $scope.mapController.getLayers();
 *           });
 *       });
 *   }]);
     * </file>
     * <file name="mapWithUISlider.css">
     * #map {
 * width: 570pcx;
 * height: 530px;
 * }
     * .opaictySlider {
 * width: 200px;
 * margin-bottom: 20px;
 * }
     * </file>
     * </example>
     *
     */
    app.directive('gaLayerOpacitySlider', ['$timeout', function ($timeout) {
        //'<input type="range"  min="0" max="1.0" step="0.01" ng-model="layerOpacity"/>';
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/opacity-slider/opacity-slider.html',
            replace: true,
            scope: {
                layerId: '@',
                layerOpacity: '=',
                mapController: '=',
                layerDisabled: '=',
                titleText: '@',
                onOpacityChange:'&'
            },
            controller: ['$scope', function ($scope) {
                $scope.changeOpacitySlide = function (e, ui) {
                    $scope.layerOpacity = ui.value;
                    //This timeout is needed to avoid $digest cycle issues and to keep jquery UI in sync.
                    //This is a performance hit, but unable to get a reliable update with out.
                    $timeout(function () {
                        $scope.$apply();
                        $scope.onOpacityChange({layerId:$scope.layerId,opacity:$scope.layerOpacity});
                    });
                };
                $scope.getSliderOptions = function () {
                    return {
                        min: 0.0,
                        max: 1.0,
                        range: false,
                        step: 0.01,
                        slide: $scope.changeOpacitySlide,
                        value: $scope.layerOpacity,
                        disabled: $scope.layerDisabled
                    };
                };

            }],
            link: function ($scope, $element) {
                $scope.$watch('layerOpacity', function (newVal, oldVal) {
                    if (newVal && oldVal !== newVal) {
                        $($element).slider($scope.getSliderOptions());
                    }
                });
                //HACK to give jquery ui slider title text.
                $timeout(function () {
                    $element.find('.ui-slider-handle').attr('title', $scope.titleText);
                });

            },
            transclude: true
        };
    } ]);
})();
var angular = angular || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

angular.module('gawebtoolkit.ui', [ 'gawebtoolkit.ui.directives','gawebtoolkit.ui.templates','gawebtoolkit.ui.components', 'ui.utils', 'gawebtoolkit.utils' ]);

var app = angular.module('gawebtoolkit.ui.directives', [ 'gawebtoolkit.utils' ]);


/**
 * gaZoomToExtentButton
 * Notes: beforeZoom param 'points' is the underlying implementation object
 **/
app.directive('gaZoomToExtentButton', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            extentPoints: '=',
            mapController: '=',
            beforeZoom: '&'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                var bounds = $scope.mapController.createBounds($scope.extentPoints);
                $scope.beforeZoom({
                    points: bounds
                });
                $scope.mapController.zoomToExtent(bounds);
            };
        },
        transclude: true
    };
} ]);
/**
 * */
app.directive('gaZoomToCenterPositionAnchor', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<a ng-click="zoomTo()"><div ng-transclude></div></a>',
        scope: {
            geoJsonCoord: '=',
            projection: '@',
            mapController: '=',
            zoomLevel: '@'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                $scope.mapController.setCenter($scope.geoJsonCoord[1], $scope.geoJsonCoord[0], $scope.projection);
                $scope.mapController.zoomTo($scope.zoomLevel);
            };
        },
        transclude: true
    };
} ]);
/**
 *
 * */
app.directive('gaZoomToLayerButton', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            layerId: '@',
            mapController: '=',
            beforeZoom: '&'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                $scope.mapController.zoomToLayer($scope.layerId);
            };
        },
        transclude: true
    };
} ]);
/**
 * */
app.directive('gaToggle', [ function () {
    'use strict';
    var templateCache = '<button type="button" ng-click="toggle()"><div ng-transclude></div></button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: true,
        scope: {
            gaToggleClicked: '&'
        },
        link: function ($scope) {
            $scope.toggle = function () {
                $scope.gaToggleClicked();
            };
        }
    };
}]);
/*
 * Work around from suggestion in angularjs issues on github
 * https://github.com/angular/angular.js/issues/2809
 * Modified with timeout to avoid digestion cycle problems with data
 * */
app.directive('fixIeSelect', function () {
    "use strict";
    return {
        restrict: 'A',
        controller: [ '$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
            $scope.$watch('options', function () {
                var $option = $('<option>');
                var widthVal = $element.css('width');
                // for some reason, it needs both, getting the width and changing CSS options to rerender select
                $element.css('width');
                $element.addClass('repaint').removeClass('repaint');

                // add and remove option to rerender options
                $option.appendTo($element).remove();
                $timeout(function () {
                    $element.css('width', 'auto');
                });
                $option = null;
                //$element.css('width','auto');
            });
        } ]
    };
});

/* global angular, $, OpenLayers */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.vendor.bing-layers', ['gawebtoolkit.core.layer-services']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.core.vendor-layers:gaBingLayer
     * @description
     * ## Overview ##
     * gaGoogleLayer directive is used to create a Bing map.
     * @param {string|@} layerType - Required. Specified Bing maps layer type. Eg, Road.
     * @param {string|@} bingApiKey - Required. Your own Bing maps API key.
     * @param {string|@} wrapDateLine - A boolean value ('true', 'false') which defines the map in the layer should be wrapped or not. If wrapped then the map will be unlimited scrollable.
     * @param {string|@} visibility - A boolean value ('true', 'false') which enables or disables visibility of the layer.
     * @scope
     * @restrict E
     * @example
     <example module="simpleMap">
     <file name="index.html">
     <div id="map"></div>
     <ga-map map-element-id="map">
     <ga-bing-layer></ga-bing-layer>
     </ga-map>
     </file>
     <file name="style.css">#map {width: 650px;height:600px;}</file>
     <file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
     </example>
     */
    app.directive('gaBingLayer', ['$timeout', '$compile', 'GALayerService', '$log',
        function ($timeout, $compile, GALayerService, $log) {
            var validBingLayerTypes = ['road','aerial','aerialwithlabels','birdseye','birdseyewithlabels'];
            var validateBingLayerType = function (layerType) {
                for (var i = 0; i < validBingLayerTypes.length; i++) {
                    var validType = validBingLayerTypes[i];
                    if(validType === layerType.toLowerCase()) {
                        return true;
                    }
                }
                return false;
            };
            return {
                restrict: "E",
                require: "^gaMap",
                scope: {
                    layerType: '@',
                    visibility: '@',
                    wrapDateLine: '@',
                    bingApiKey: '@',
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
                    layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                    layerOptions.layerType = layerOptions.layerType || layerOptions.bingLayerType;
                    if(!validateBingLayerType(layerOptions.layerType)) {
                        $log.warn('Invalid Bing layer type - ' + layerOptions.layerType +
                        ' used. Defaulting to "Road". Specify default Bing layer type in "ga.config" - bingLayerType');
                        layerOptions.layerType = 'Road';
                    }
                    var addLayerCallback = function () {
                        $scope.layerReady = true;
                    };

                    var constructLayer = function () {
                        $scope.constructionInProgress = true;
                        layerOptions.mapElementId = mapController.getMapElementId();

                        $log.info('Bing ' + layerOptions.layerType + ' - constructing...');

                        if(layerOptions.bingApiKey == null) {
                            throw new Error("Missing Bing Maps API key. Please provide your valid Bing Maps API key using the ga-bing-layer attribute 'bing-api-key'");
                        }
                        layer = GALayerService.createBingLayer(layerOptions,$scope.framework);
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
                            mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true");
                        }
                    });

                    attrs.$observe('layerType', function () {
                        if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                            $scope.initialiseLayer();
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
                            mapController.removeLayerById($scope.layerDto.id);
                            $scope.layerDto = null;
                            layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                            layerOptions.initialExtent = mapController.getInitialExtent();
                            layerOptions.format = $scope.format;
                            if(layerOptions.bingApiKey == null) {
                                throw new Error("Missing Bing Maps API key. Please provide your valid Bing Maps API key using the ga-bing-layer attribute 'bing-api-key'");
                            }
                            layer = GALayerService.createBingLayer(layerOptions,$scope.framework);
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
     <ga-map map-element-id="map">
     <ga-google-layer></ga-google-layer>
     </ga-map>
     </file>
     <file name="style.css">#map {width: 650px;height:600px;}</file>
     <file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
     </example>
     */
    app.directive('gaGoogleLayer', ['$timeout', '$compile', 'GALayerService', '$log',
        function ($timeout, $compile, GALayerService, $log) {
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
                require: "^gaMap",
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
                    layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                    layerOptions.layerType = layerOptions.layerType || layerOptions.googleLayerType;
                    if(!validateGoogleLayerType(layerOptions.layerType)) {
                        $log.warn('Invalid Google layer type - ' + layerOptions.layerType +
                            ' used. Defaulting to "Hybrid". Specify default Google layer type in "ga.config" - googleLayerType');
                        layerOptions.layerType = 'Hybrid';
                    }
                    var addLayerCallback = function () {
                        $scope.layerReady = true;
                    };

                    var constructLayer = function () {
                        $scope.constructionInProgress = true;

                        layerOptions.mapElementId = mapController.getMapElementId();
                        $log.info('Google ' + $scope.layerType + ' - constructing...');


                        layer = GALayerService.createGoogleLayer(layerOptions,$scope.framework);
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
                            layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                            layerOptions.initialExtent = mapController.getInitialExtent();
                            layerOptions.format = $scope.format;
                            layer = GALayerService.createGoogleLayer(layerOptions,$scope.framework);
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
/* global angular, $, OpenLayers */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.vendor.osm-layers', ['gawebtoolkit.core.layer-services']);

    /**
     * @ngdoc directive
     * @name gawebtoolkit.core.vendor-layers:gaOsmLayer
     * @description
     * ## Overview ##
     * gaGoogleLayer directive is used to create an Open Street Maps layer.
     * @param {string|@} wrapDateLine - A boolean value ('true', 'false') which defines the map in the layer should be wrapped or not. If wrapped then the map will be unlimited scrollable.
     * @param {string|@} visibility - A boolean value ('true', 'false') which enables or disables visibility of the layer.
     * @scope
     * @restrict E
     * @example
     <example module="simpleMap">
     <file name="index.html">
     <div id="map"></div>
     <ga-map map-element-id="map">
     <ga-osm-layer></ga-osm-layer>
     </ga-map>
     </file>
     <file name="style.css">#map {width: 650px;height:600px;}</file>
     <file name="script.js">var app = angular.module('simpleMap',['gawebtoolkit.core']);</file>
     </example>
     */
    app.directive('gaOsmLayer', ['$timeout', '$compile', 'GALayerService', '$log',
        function ($timeout, $compile, GALayerService, $log) {
            return {
                restrict: "E",
                require: "^gaMap",
                scope: {
                    wrapDateLine: '@',
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
                    layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                    var addLayerCallback = function () {
                        $scope.layerReady = true;
                    };

                    var constructLayer = function () {
                        $scope.constructionInProgress = true;
                        layerOptions.mapElementId = mapController.getMapElementId();

                        $log.info('OpenStreetMaps Cycle - constructing...');

                        layer = GALayerService.createOsmLayer(layerOptions,$scope.framework);
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
                            mapController.removeLayerById($scope.layerDto.id);
                            $scope.layerDto = null;
                            layerOptions = GALayerService.defaultLayerOptions(attrs,$scope.framework);
                            layerOptions.initialExtent = mapController.getInitialExtent();
                            layerOptions.format = $scope.format;
                            layer = GALayerService.createLayer(layerOptions,$scope.framework);
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
/* global angular */
(function () {
    "use strict";
    angular.module('gawebtoolkit.vendor-layers',
        [
            'gawebtoolkit.vendor.google-layers',
            'gawebtoolkit.vendor.bing-layers',
            'gawebtoolkit.vendor.osm-layers'
        ]);
})();

