(function() {

    var app = angular.module('gawebtoolkit.core.layer-services', [
        'gawebtoolkit.mapservices',
        'gawebtoolkit.core.map-config'
    ]);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
    app.service('GALayerService', ['ga.config', 'mapLayerServiceLocator', function (GAConfig, mapLayerServiceLocator) {
        'use strict';
        //OpenLayers 2 as default
        var defaultFramework = 'olv2';

        return {
            createLayer: function (args, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createLayer(args);
            },
            createFeatureLayer: function (args,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createFeatureLayer(args);
            },
            createGoogleLayer: function (args, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createGoogleLayer(args);
            },
            createBingLayer: function (args, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createBingLayer(args);
            },
            createOsmLayer: function (args, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createOsmLayer(args);
            },
            createMarkerLayer: function (args, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createMarkerLayer(args);
            },
            removeLayerByName: function (mapInstance, layerName,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayerByName(mapInstance, layerName);
            },
            removeLayersByName: function (mapInstance, layerName, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayersByName(mapInstance, layerName);
            },
            removeLayer: function (mapInstance, layerInstance,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayer(mapInstance, layerInstance);
            },
            removeLayerById: function (mapInstance, layerId,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayerById(mapInstance, layerId);
            },
            getMarkerCountForLayerName: function (mapInstance, layerName,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.getMarkerCountForLayerName(mapInstance, layerName);
            },
            registerFeatureSelected: function (mapInstance, layerId, callback, element,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.registerFeatureSelected(mapInstance, layerId, callback, element);
            },
            defaultLayerOptions: function (attrs,version) {
                //TODO if we are support multiple map types, eg google/openlayers/leaflets
                //this method should abstract the need to know what map type the instance is.
                //For now it is current assumed it's openlayers Release 2.13.1
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.defaultLayerOptions(attrs, new GAConfig());
            },
            createFeature: function (mapInstance, geoJson,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createFeature(mapInstance, geoJson);
            },
            cleanupLayer:function (mapInstance, layerId,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.cleanupLayer(mapInstance, layerId);
            },
            registerLayerEvent: function (mapInstance, layerId, eventName, callback,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.registerLayerEvent(mapInstance, layerId, eventName, callback);
            },
            unRegisterLayerEvent: function(mapInstance, layerId, eventName, callback, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.unRegisterLayerEvent(mapInstance, layerId, eventName, callback);
            },
            unRegisterMapEvent: function (mapInstance, layerId, eventName, callback,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.unRegisterMapEvent(mapInstance, layerId, eventName, callback);
            },
            addFeatureToLayer: function (mapInstance, layerId, feature,version) {
                var useVersion = version || defaultFramework;
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
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.filterFeatureLayer(mapInstance, layerId, filterValue, featureAttributes);
            },
            getLayerFeatures: function (mapInstance, layerId,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.getLayerFeatures(mapInstance, layerId);
            },
            clearFeatureLayer: function (mapInstance, layerId, version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                service.clearFeatureLayer(mapInstance,layerId);
            },
            removeFeatureFromLayer: function (mapInstance, layerId, featureId,version) {
                var useVersion = version || defaultFramework;
                var service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.removeFeatureFromLayer(mapInstance, layerId, featureId);
            },
            raiseLayerDrawOrder: function (mapInstance, layerId, delta,version) {
                var useVersion = version || defaultFramework;
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
})();