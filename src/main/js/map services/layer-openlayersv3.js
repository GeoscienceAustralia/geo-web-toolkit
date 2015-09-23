/* global angular, ol, $, google*/

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.layer.openlayersv3', []);

    /*
     * This service wraps olv3 layer functionality that is used via the GAMaps and GALayer service
     * */
    app.service('olv3LayerService', ['$log', '$q', '$timeout', 'GeoLayer', 'GAWTUtils', function ($log, $q, $timeout, GeoLayer, GAWTUtils) {
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
                    case 'markerlayer':
                        layer = service.createMarkerLayer(args);
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
                layer.set('geoLayerType',args.layerType);
                if(args.maxZoomLevel) {
                    layer.geoMaxZoom = parseInt(args.maxZoomLevel);
                }
                if (args.minZoomLevel) {
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
                    layer = new ol.layer.Vector({source: new ol.source.Vector(), format: new ol.format.GeoJSON()});
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
                layer.set('name', args.layerName);
                layer.set('isBaseLayer', args.isBaseLayer || false);

                return layer;
            },
            createMarkerLayer: function (args) {
                var result = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    format: new ol.format.GeoJSON()
                });
                result.set('name', args.layerName);
                return result;
            },
            createGoogleLayer: function (args) {
                throw new Error("Google map layers are not supported with OpenLayers 3. To use a Google maps layer, consider falling back to framework 'olv2'.");
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
                        break;
                }
                var layer = new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        key: args.bingApiKey,
                        imagerySet: bingLayerType
                    })
                });

                layer.set('name', bingLayerName);
                layer.setVisible(args.visibility === true || args.visibility === 'true');
                return layer;
            },
            createOsmLayer: function (args) {
                var layer = new ol.layer.Tile({
                    source: new ol.source.OSM()
                });
                layer.setVisible(args.visibility === true || args.visibility === 'true');
                return layer;
            },
            clearFeatureLayer: function (mapInstance, layerId) {
                var layer = service.getLayerById(mapInstance, layerId);
                layer.getSource().clear();
            },
            createXYZLayer: function (args) {
                var sourceOptions = {
                    url: args.layerUrl + service.xyzTileCachePath,
                    crossOrigin: '*/*'
                };

                if (args.layerAttribution != null) {
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
                result.set('name', args.layerName);
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
                if (args.format) {
                    sourceOptions.params.FORMAT = args.format;
                }

                //default wrap
                sourceOptions.wrapX = true;
                if (args.wrapDateLine != null) {
                    sourceOptions.wrapX = args.wrapDateLine === 'true' || args.wrapDateLine === true;
                }

                sourceOptions.serverType = ('mapserver');

                if (args.layerAttribution != null) {
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
                result.set('name', args.layerName);
                result.set('isBaseLayer', args.isBaseLayer || false);
                return result;
            },
            createArcGISCacheLayer: function (args) {
                var url = args.layerUrl + service.xyzTileCachePath;
                var sourceOptions = {
                    crossOrigin: '*/*',
                    url: url
                };
                console.log('ARCGIS')
                var layerOptions = {
                    opacity: args.opacity,
                    source: new ol.source.XYZ(sourceOptions),
                    visible: args.visibility === true || args.visibility === 'true'
                };
                var result = new ol.layer.Tile(layerOptions);
                result.set('name', args.layerName);
                result.set('isBaseLayer', args.isBaseLayer || false);
                return result;
            },
            defaultLayerOptions: function (args, config) {
                var layerOptions = angular.extend(config.defaultOptions, args);
                layerOptions.centerPosition = service.parselatLong(layerOptions.centerPosition);
                return layerOptions;
            },
            cleanupLayer: function (mapInstance, layerId) {
                var layer = service.getLayerBy(mapInstance, 'id', layerId);
                if (layer != null) {
                    mapInstance.removeLayer(layer);
                }
            },
            createFeature: function (mapInstance, geoJson) {
                var reader;
                if (mapInstance.getView().getProjection() !== geoJson.crs.properties.name) {
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
                if (typeof source.getFeatures !== 'function') {
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
                return service.getLayerBy(mapInstance, 'id', layerId);
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
            getLayerByName: function (mapInstance, layerName) {
                // If more than one layer has the same name then only the first will be destroyed
                return service.getLayerBy(mapInstance, 'name', layerName);
            },
            getLayersBy: function (mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers();
                var results = [];
                layers.forEach(function (layer) {
                    var propVal = layer.get(propertyName);
                    if (propVal && propVal.indexOf(propertyValue) !== -1) {
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
                    if (propVal && propVal.indexOf(propertyValue) !== -1) {
                        results.push(layer);
                    }
                });
                return results;
            },
            //Should this be labeled as an internal method?
            removeLayerByName: function (mapInstance, layerName) {
                // If more than one layer has the same name then only the first will be destroyed
                var layers = service._getLayersBy(mapInstance, 'name', layerName);
                if (layers.length > 0) {
                    mapInstance.removeLayer(layers[0]);
                }
            },
            //Should this be labeled as an internal method?
            removeLayersByName: function (mapInstance, layerName) {
                // Destroys all layers with the specified layer name
                var layers = service._getLayersBy(mapInstance, 'name', layerName);
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
                var layer = service._getLayersBy(mapInstance, 'id', layerId)[0];
                mapInstance.removeLayer(layer);
            },
            removeFeatureFromLayer: function (mapInstance, layerId, featureId) {
                var layer = service.getLayerById(mapInstance, layerId);
                var features = layer.getSource().getFeatures();
                for (var i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if (feature.id === featureId) {
                        layer.getSource().removeFeature(feature);
                        break;
                    }
                }
            },
            registerFeatureSelected: function (mapInstance, layerId, callback, element) {
                service.registeredInteractions = service.registeredInteractions || [];
                for (var i = 0; i < service.registeredInteractions.length; i++) {
                    var interaction = service.registeredInteractions[i];
                    if (interaction.id === '' + layerId + '_features') {
                        //Remove existing, limitation, only one feature selection event at once...?
                        mapInstance.removeInteraction(interaction.select);
                    }
                }
                var selectClick = new ol.interaction.Select({
                    condition: ol.events.condition.click
                });
                selectClick.on('select', function (e) {
                    if (e.target.get('id') === layerId) {
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
                var layer = service.getLayerBy(mapInstance, 'id', layerId);
                eventName = eventName === 'loadstart' ? 'tileloadstart' : eventName;
                eventName = eventName === 'loadend' ? 'tileloadend' : eventName;
                layer.getSource().un(eventName, callback);
            },
            unRegisterLayerEvent: function (mapInstance, layerId, eventName, callback) {
                var layer = service.getLayerBy(mapInstance, 'id', layerId);
                eventName = eventName === 'loadstart' ? 'tileloadstart' : eventName;
                eventName = eventName === 'loadend' ? 'tileloadend' : eventName;
                layer.getSource().un(eventName, callback);
            },
            //Should this be moved to a separate service as it is more of a helper?
            getMarkerCountForLayerName: function (mapInstance, layerName) {
                var layer = service.getLayerBy(mapInstance, 'name', layerName);
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
                if (source.getFeatures == null) {
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
                var allLayers = mapInstance.getLayers();
                var layerIndex;
                for (var i = 0; i < allLayers.getLength(); i++) {
                    var currentLayer = allLayers.item(i);
                    if (currentLayer.get('id') === layerId) {
                        layerIndex = i;
                        break;
                    }
                }
                var updatedIndex = layerIndex + delta;
                if(layerIndex === updatedIndex) {
                    return;
                }
                var layerArray = mapInstance.getLayers().getArray();
                layerArray.splice(updatedIndex,0,layerArray.splice(layerIndex,1)[0]);
                mapInstance.updateSize();
            },
            postAddLayerCache: {}
        };
        return service;
    }]);
})();