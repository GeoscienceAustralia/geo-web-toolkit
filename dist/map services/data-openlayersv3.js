/* global angular, ol, $ */

// OpenLayers V2 is still used here due to better support. This is used only to make data requests so we are not manipulating the map instance itself.
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.mapservices.data.openlayersv3', []);

    var olv2DataService = ['$q', '$http', 'ga.config', function ($q, $http,GAConfig) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var projection = mapInstance.getView().getProjection().getCode();
            var bounds = mapInstance.getView().calculateExtent(mapInstance.getSize());
            var olv2Bounds = new OpenLayers.Bounds(bounds[0],bounds[1],bounds[2],bounds[3]);
            var bbox = olv2Bounds.toBBOX();
            var point = (pointEvent != null && pointEvent instanceof ol.MapBrowserPointerEvent) ? pointEvent.pixel : pointEvent;
            if(point.position != null) {
                point = [point.position.x,point.position.y];
            }

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
                var getCapsUrl = url.indexOf('?') > 0 ? url + "&request=GetCapabilities" : url + "?request=GetCapabilities";
                $http.get(getCapsUrl).success(function (data, status, headers, config) {
                    var format = new OpenLayers.Format.WMSCapabilities();
                    var allLayers = format.read(data).capability.layers;
                    deferred.resolve(allLayers);
                }).error(function(data, status, headers, config) {
                    deferred.reject(status);
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
                if(GAConfig().defaultOptions.proxyHost) {
                    requestParams.proxy = GAConfig().defaultOptions.proxyHost;
                }
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
                if(GAConfig().defaultOptions.proxyHost) {
                    requestParams.proxy = GAConfig().defaultOptions.proxyHost;
                }
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            }
        };
    }];

    app.service('olv3DataService', olv2DataService);
})();
