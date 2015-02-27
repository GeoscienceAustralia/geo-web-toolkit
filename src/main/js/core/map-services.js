var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.map-services', [ 'gawebtoolkit.mapservices' ]);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GAMapService', ['$log', 'ga.config', 'mapServiceLocator',
    function ($log, GAConfig, mapServiceLocator) {
        'use strict';
        return {
            initialiseMap: function (args) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                try {
                    return service.initialiseMap(args, new GAConfig());
                } catch (e) {
                    $log.error('Failed to initialise map');
                    throw e;
                }
            },
            zoomToMaxExtent: function (mapInstance) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.zoomToMaxExtent(mapInstance);
            },
            zoomTo: function (mapInstance, zoomLevel) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.zoomTo(mapInstance, zoomLevel);
            },
            currentZoomLevel: function (mapInstance) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.currentZoomLevel(mapInstance);
            },
            addLayer: function (mapInstance, layer) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                return service.addLayer(mapInstance, layer);
            },
            registerMapMouseMove: function (mapInstance, callback) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.registerMapMouseMove(mapInstance, callback);
            },
            registerMapMouseMoveEnd: function (mapInstance, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.registerMapMouseMoveEnd(mapInstance, callback);
            },
            registerMapClick: function (mapInstance, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.registerMapClick(mapInstance, callback);
            },
            unRegisterMapClick: function (mapInstance, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.unRegisterMapClick(mapInstance, callback);
            },
            registerMapEvent: function (mapInstance, eventName, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.registerMapEvent(mapInstance, eventName, callback);
            },
            unRegisterMapEvent: function (mapInstance, eventName, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.unRegisterMapEvent(mapInstance, eventName, callback);
            },
            getCurrentMapExtent: function (mapInstance) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getCurrentMapExtent(mapInstance);
            },
            addControl: function (mapInstance, controlName, controlOptions, elementId, controlId) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                return service.addControl(mapInstance, controlName, controlOptions, elementId, controlId);
            },
            isControlActive: function (mapInstance, controlId) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.isControlActive(mapInstance, controlId);
            },
            activateControl: function (mapInstance, controlId) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.activateControl(mapInstance, controlId);
            },
            deactivateControl: function (mapInstance, controlId) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.deactivateControl(mapInstance, controlId);
            },
            registerControlEvent: function (mapInstance, controlId, eventName, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.registerControlEvent(mapInstance, controlId, eventName, callback);
            },
            unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.unRegisterControlEvent(mapInstance, controlId, eventName, callback);
            },
            getLayers: function (mapInstance) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getLayers(mapInstance);
            },
            getLayersByName: function (mapInstance, layerName) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getLayersByName(mapInstance, layerName);
            },
            zoomToLayer: function (mapInstance, layerId) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.zoomToLayer(mapInstance, layerId);
            },
            setLayerVisibility: function (mapInstance, layerId, visibility) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.setLayerVisibility(mapInstance, layerId, visibility);
            },
            createBoundingBox: function (mapInstance, lonLatArray) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.createBoundingBox(mapInstance, lonLatArray);
            },
            createBounds: function (mapInstance, lonLatArray, projection) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.createBounds(mapInstance, lonLatArray, projection);
            },
            zoomToExtent: function (mapInstance, extent) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.zoomToExtent(mapInstance, extent);
            },
            setCenter: function (mapInstance, lat, lon, projection) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.setCenter(mapInstance, lat, lon, projection);
            },
            setInitialPositionAndZoom: function (mapInstance, args) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.setInitialPositionAndZoom(mapInstance, args, new GAConfig());
            },
            setBaseLayer: function (mapInstance, layerId) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.setBaseLayer(mapInstance, layerId);
            },
            isBaseLayer: function (mapInstance, layerId) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                return service.isBaseLayer(mapInstance, layerId);
            },
            setOpacity: function (mapInstance, layerId, opacity) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var service = mapServiceLocator.getImplementation('olv2');
                service.setOpacity(mapInstance, layerId, opacity);
            },
            mapResized: function (mapInstance) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.mapResized(mapInstance);
            },
            setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl, args) {
                var service = mapServiceLocator.getImplementation('olv2');
                service.setMapMarker(mapInstance, coords, markerGroupName, iconUrl, args);
            },
            getLonLatFromPixel: function (mapInstance, x, y, projection) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getLonLatFromPixel(mapInstance, x, y, projection);
            },
            getPixelFromLonLat: function (mapInstance, lon, lat) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getPixelFromLonLat(mapInstance, lon, lat);
            },
            getPointFromEvent: function (e) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getPointFromEvent(e);
            },
            drawPolyLine: function (mapInstance, points, layerName) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.drawPolyLine(mapInstance, points, layerName);
            },
            removeFeature: function (mapInstance, layerName) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.removeFeature(mapInstance, layerName);
            },
            removeFeature: function (mapInstance, layerName, feature) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.removeFeature(mapInstance, layerName, feature);
            },
            drawFeature: function (mapInstance, args) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.drawFeature(mapInstance, args);
            },
            drawLabel: function (mapInstance, args) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.drawLabel(mapInstance, args);
            },
            drawLabelWithPoint: function (mapInstance, args) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.drawLabelWithPoint(mapInstance, args);
            },
            createWfsClient: function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid);
            },
			getFeatureInfo: function (mapInstance,callback, url,featureType, featurePrefix, geometryName, point,tolerance) {
				var service = mapServiceLocator.getImplementation('olv2');
				return service.getFeatureInfo(mapInstance,callback, url,featureType, featurePrefix, geometryName, point,tolerance);
			},
			getFeatureInfoFromLayer: function (mapInstance,callback, layerId, point,tolerance) {
				var service = mapServiceLocator.getImplementation('olv2');
				return service.getFeatureInfoFromLayer(mapInstance,callback, layerId, point,tolerance);
			},
            getMeasureFromEvent: function (mapInstance, e) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.getMeasureFromEvent(mapInstance, e);
            },
            addWfsClient: function (wfsClient) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.addWfsClient(wfsClient);
            },
            searchWfs: function (mapInstance, clientId, query, attribute) {
                var service = mapServiceLocator.getImplementation('olv2');
                return service.searchWfs(mapInstance, clientId, query, attribute);
            }
        };
    } ]);

app.service('mapServiceLocator', [ '$injector', function ($injector) {
    "use strict";
    var implementations = {
        'olv2': 'olv2MapService'
    };
    return {
        getImplementation: function (mapType) {
            return $injector.get(implementations[mapType]);
        }
    };
} ]);