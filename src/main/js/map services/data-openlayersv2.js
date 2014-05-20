var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};

//depends on library X2JS
var X2JS = X2JS || {};

var app = angular.module('gawebtoolkit.mapservices.data.openlayersv2', []);

app.service('WMSDataService', [ '$q', '$http', function ($q, $http) {
    "use strict";
    return {
        getLayersByWMSCapabilities: function (url) {
            var deferred = $q.defer();
            $http.get(url + "?request=GetCapabilities").success(function (data, status, headers, config) {
                var x2js = new X2JS();

                var responseJson = x2js.xml_str2json(data);
                var layers = responseJson.WMS_Capabilities.Capability.Layer.Layer;
                var format = new OpenLayers.Format.WMSCapabilities();
                var allLayers = format.read(data).capability.layers;
                var olv2Layers = [];
                for (var i = 0; i < allLayers.length; i++) {
                    olv2Layers.push(new OpenLayers.Layer.WMS(allLayers[i].abstract, url, {layers: allLayers[i].name}));
                }
                deferred.resolve(allLayers);
            });
            return deferred.promise;
        },
		getWMSFeatures: function (mapInstance, url,layerNames,version,layerProjection, point) {
			var deferred = $q.defer();
			var projection = mapInstance.getProjection();
			var layerProj = layerProjection;
			if (layerProj && layerProj.equals(mapInstance.getProjectionObject())) {
				projection = layerProj.getCode();
			}
			var params = OpenLayers.Util.extend({
					service: "WMS",
					version: version,
					request: "GetFeatureInfo",
//					exceptions: firstLayer.params.EXCEPTIONS,
					bbox: mapInstance.getExtent().toBBOX(null,
						false),
					feature_count: 100,
					height: mapInstance.getSize().h,
					width: mapInstance.getSize().w,
					format: OpenLayers.Format.WMSGetFeatureInfo,
					info_format: 'text/xml'
				}, (parseFloat(version) >= 1.3) ?
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
					query_layers: layerNames
//					styles: styleNames
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
} ]);