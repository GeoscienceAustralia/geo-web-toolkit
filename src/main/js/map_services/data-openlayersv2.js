/* global angular, OpenLayers, $ */
(function () {
    "use strict";

    var app = angular.module('geowebtoolkit.mapservices.data.openlayersv2', []);

    var olv2DataService = ['$q', '$http', 'geoConfig', function ($q, $http, geoConfig) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var projection = mapInstance.projection;
            var bounds = mapInstance.getExtent();
            var bbox = bounds.toBBOX();
            var point = (pointEvent != null && pointEvent instanceof MouseEvent) ? pointEvent.xy : pointEvent;
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
                var getCapsUrl = url.indexOf('?') > 0 ? url + "&request=GetCapabilities" : url + "?request=GetCapabilities";
                $http.get(getCapsUrl).success(function (data, status, headers, config) {
                    var format = new OpenLayers.Format.WMSCapabilities();
                    var response = format.read(data);
                    if(response == null || response.capability == null || response.capability.layers == null) {
                        deferred.reject('Response not recognised');
                    }else {
                        var allLayers = format.read(data).capability.layers;
                        deferred.resolve(allLayers);
                    }
                }).error(function (data, status, headers, config) {
                    deferred.reject(status);
                });
                return deferred.promise;
            },
            getWMSFeaturesUrl: function (mapInstance, url, layerNames, version, pointEvent, contentType) {
                var infoTextContentType = contentType || 'text/xml';
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
                if (geoConfig().defaultOptions.proxyHost) {
                    requestParams.proxy = geoConfig().defaultOptions.proxyHost;
                }

                function parseRequest(config) {
                    config = config || {};
                    config.headers = config.headers || {};
                    var parsedUrl = OpenLayers.Util.urlAppend(config.url,
                        OpenLayers.Util.getParameterString(config.params || {}));
                    parsedUrl = OpenLayers.Request.makeSameOrigin(parsedUrl, config.proxy);
                    return parsedUrl
                }

                var resultUrl = parseRequest(requestParams);
                return resultUrl;
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
                if (geoConfig().defaultOptions.proxyHost) {
                    requestParams.proxy = geoConfig().defaultOptions.proxyHost;
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
                if (geoConfig().defaultOptions.proxyHost) {
                    requestParams.proxy = geoConfig().defaultOptions.proxyHost;
                }
                OpenLayers.Request.GET(requestParams);
                return deferred.promise;
            }
        };
    }];

//Maintain support for previous version name if used outside the toolkit
    app.service('WMSDataService', olv2DataService);

    app.service('olv2DataService', olv2DataService);
})();