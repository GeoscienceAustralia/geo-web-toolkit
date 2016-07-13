var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

var app = angular.module('geowebtoolkit.mapservices.layer.openlayersv2', []);

/*
 * This service wraps olv2 layer functionality that is used via the GeoMaps and GeoLayer service
 * */
app.service('olv2LayerService', [ '$log', '$q', '$timeout', function ($log, $q, $timeout) {
    'use strict';
    var service = {
        xyzTileCachePath: "/tile/${z}/${y}/${x}",
        createLayer: function (args) {
            var layer;
            //var options = service.defaultLayerOptions(args);
            switch (args.layerType.toLowerCase()) {
                case 'wms':
                    layer = service.createWMSLayer(args);
                    break;
                case 'xyztilecache':
                    layer = service.createXYZLayer(args);
                    break;
                case 'arcgiscache':
                    layer = service.createArcGISCacheLayer(args);
                    break;
                case 'vector':
                    layer = service.createFeatureLayer(args);
                    break;
                case 'googlestreet':
                case 'googlehybrid':
                case 'googlesatellite':
                case 'googleterrain':
                    //Deprecated - use vendor specific directives
                    layer = service.createGoogleMapsLayer(args);
                    break;
                case 'markerlayer':
                    layer = service.createMarkerLayer(args);
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
            if (args.layerType == null) {
                throw new Error("'layerType' not specified for creating a Google Maps layer. Please specify a valid layer type, eg 'hybrid");
            }
            var googleLayerType;
            switch (args.layerType.toLocaleLowerCase()) {
                case 'googlehybrid':
                case 'hybrid':
                    googleLayerType = google.maps.MapTypeId.HYBRID;
                    break;
                case 'googlesatellite':
                case 'satellite':
                    googleLayerType = google.maps.MapTypeId.SATELLITE;
                    break;
                case 'googlestreet':
                case 'street':
                    googleLayerType = google.maps.MapTypeId.STREET;
                    break;
                case 'googleterrain':
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
            switch (args.layerType.toLocaleLowerCase()) {
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
        setFeatureStyle: function () {
            //TODO v2 styles
        },
        createMarkerLayer: function (args) {
            return new OpenLayers.Layer.Markers(args.layerName);
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
            var layer = service.getLayerById(mapInstance, layerId);
            if (!layer) {
                $log.error('clearFeatureLayer: Layer "' + layerId + '" not found.');
            } else {
                layer.removeAllFeatures();
            }
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

            if (resultArgs.options.isBaseLayer) {
                if (args.resolutions) {
                    resultArgs.options.resolutions = args.resolutions;
                }
                if (args.zoomOffset) {
                    resultArgs.options.zoomOffset = args.zoomOffset;
                }
            }

            if (args.maxZoomLevel != null) {
                if (args.maxZoomLevel.length > 0) {
                    resultArgs.options.numZoomLevels = parseInt(args.maxZoomLevel);
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
                    resultArgs.numZoomLevels = parseInt(args.maxZoomLevel);
                }
            }

            return new OpenLayers.Layer.WMS(resultArgs.layerName, resultArgs.layerUrl, {
                layers: resultArgs.layers,
                format: resultArgs.format,
                transparent: resultArgs.transparent
            }, resultArgs);
        },
        mergeNewParams: function (mapInstance, layerId, paramsObj) {
            var layer = service.getLayerById(mapInstance, layerId);
            if(layer != null) {
                layer.mergeNewParams(paramsObj);
            }
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
                if (data.error != null && data.error.code != null) {
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
            if (mapInstance.layers == null || mapInstance.layers.length === 0) {
                return;
            }
            var layer = service.getLayerById(mapInstance, layerId);
            if (layer != null) {
                mapInstance.removeLayer(layer);
            }
        },
        createFeature: function (mapInstance, geoJson) {
            var reader;
            if (mapInstance.projection !== geoJson.crs.properties.name) {
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
        /*
         Deprecated. Anything using this method needs to change.
         If external, to use removeLayerById
         If internal to olv2service, just use olv2 removeLayer method
         */
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
            if (layer == null) {
                $log.warn('registerLayerEvent: Layer not found - "' + layerId + '"');
            } else {
                layer.events.register(eventName, layer, callback);
            }

        },
        unRegisterLayerEvent: function (mapInstance, layerId, eventName, callback) {
            var layer = mapInstance.getLayersBy('id', layerId)[0];
            if (layer == null) {
                $log.warn('unRegisterLayerEvent: Layer not found - "' + layerId + '"');
            } else {
                layer.events.unregister(eventName, layer, callback);
            }
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