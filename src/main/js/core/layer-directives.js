var angular = angular || {};
var $ = $ || {};

var app = angular.module('geowebtoolkit.core.layer-directives', [ 'geowebtoolkit.core.map-directives', 'geowebtoolkit.core.layer-services',
	'geowebtoolkit.core.map-services' ]);

/**
 * @ngdoc directive
 * @name geowebtoolkit.core.layer-directives:geoMapLayer
 * @description
 * ## Overview ##
 * geoMapLayer adds layer to the page. This tag should be placed within the geoMap tag
 * @param {string|@} layerAttribution - The id of the element where the map is to be rendered
 * @param {string|@} layerName - A name allocated to the layer for future reference
 * @param {string|@} layerUrl - A string value that defines the URL from which the content of the layer will be loaded.
 * @param {string|@=} layers - A comma separated value that tells the remote server which layers of data should is requested form the server. This will be used to make the right request form the remote server that is defined by layerUrl.
 * @param {number|@=} layerType - The type of the data that is being load on the layer.
 * @param {object|=} customParams - This object is used to support vendor specific query string parameters when requesting layers.
 * Following types are supported:
 * <ul>
     <li>WMS</li>
     <li>arcgiscache</li>
     <li>xyzfilecache</li>
 </ul>
 * <font color="red">Note:</font> This directive does not support WFS type. In order to request for WFS type <a href="#/api/geowebtoolkit.core.feature-directives:geoFeatureLayer">geoFeatureLayer</a> should be used.
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
 * @reqires geoMap
 * @scope
 * @restrict E
 * @example
<example module="simpleMap">
<file name="index.html">
    <div id="map"></div>
    <geo-map map-element-id="map" center-position='[130, -25]' zoom-level="3">
        <geo-map-layer layer-name="baseLayer" layer-url="http://basemap.nationalmap.gov/ArcGIS/services/USGSTopo/MapServer/WMSServer" is-base-layer="true" layer-type="WMS"></geo-map-layer>
        
        <geo-map-layer layer-name="Topographic" layer-url="http://services.nationalmap.gov/ArcGIS/services/US_Topo_Availability/MapServer/WMSServer" map-bg-color="#194584" is-base-layer="false" layer-type="WMS"></geo-map-layer>
    </geo-map>
</file>
<file name="style.css">#map {width: 650px;height:600px;}</file>
<file name="script.js">var app = angular.module('simpleMap',['geowebtoolkit.core']);</file>
</example>
 */
app.directive('geoMapLayer', [ '$timeout', '$compile', 'GeoLayerService', '$log',
    function ($timeout, $compile, GeoLayerService, $log) {
        'use strict';
        return {
            restrict: "E",
            require: "^geoMap",
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
                onError: '&',
                customParams: '=',
                format: '@'
            },
            transclude: false,
            controller: ['$scope', function ($scope) {


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
                    if (newVal !== oldVal) {
                        $log.info('refresh for - ' + $scope.layerName);
                        $scope.initialiseLayer();
                    }
                });

                $scope.mapAPI = {};
                $scope.mapAPI.mapController = mapController;
                var layerOptions, layer;

                var addLayerCallback = function () {
                    $scope.layerReady = true;
                    if($scope.layerDto != null && $scope.customParams) {
                        mapController.mergeNewParams($scope.layerDto.id, $scope.customParams);
                    }
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
                    layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework);
                    layerOptions.initialExtent = mapController.getInitialExtent();
                    layerOptions.mapElementId = mapController.getMapElementId();
                    layerOptions.format = $scope.format;
                    $log.info(layerOptions.layerName + ' - constructing...');
                    if (layerOptions.layerType.length === 0) {
                        return;
                    }

                    layer = GeoLayerService.createLayer(layerOptions, $scope.framework);
                    //Async layer add
                    //mapController.waitingForAsyncLayer();
                    mapController.addLayer(layer).then(function (layerDto) {
                        $scope.layerDto = layerDto;
                        addLayerCallback();

                        $log.info('construction complete...');
                        $scope.constructionInProgress = false;
                    }, function (error) {
                        $scope.$emit(layerOptions.layerName + "_error", layerOptions);
                        $scope.onError({message: error, layer: layerOptions});
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
                        layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework);
                        layerOptions.initialExtent = mapController.getInitialExtent();
                        layerOptions.format = $scope.format;
                        layer = GeoLayerService.createLayer(layerOptions, $scope.framework);
                        //Async layer add
                        mapController.addLayer(layer).then(function (layerDto) {
                            $scope.layerDto = layerDto;
                            addLayerCallback();
                            if ($scope.layerDto != null) {
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
                    } else if ($scope.layerReady && $scope.constructionInProgress) {
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

                $scope.$watch('customParams', function (newVal, oldVal) {
                    if(newVal && $scope.layerDto) {
                        mapController.mergeNewParams($scope.layerDto.id, newVal);
                    }
                });

                if (attrs.refreshLayer == null && $scope.layerType != null && $scope.layerType.length > 0) {
                    $scope.initialiseLayer();
                }
            }
        };
    } ]);