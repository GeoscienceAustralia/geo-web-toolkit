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
            getMapElementId: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getMapElementId(mapInstance);
            },
            getProjection: function (mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getProjection(mapInstance);
            },
            getDisplayProjection: function(mapInstance, version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                return service.getDisplayProjection(mapInstance);
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
                return service.setMapMarker(mapInstance, coords, markerGroupName, iconUrl, args);
            },
            removeMapMarker: function(mapInstance,markerId,version) {
                var useVersion = version || 'olv2';
                var service = mapServiceLocator.getImplementation(useVersion);
                service.removeMapMarker(mapInstance,markerId);
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