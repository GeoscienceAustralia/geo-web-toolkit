var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.layer-services', ['gawebtoolkit.mapservices']);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GALayerService', ['ga.config', 'mapLayerServiceLocator', function (GAConfig, mapLayerServiceLocator) {
    'use strict';
    return {
        createLayer: function (args) {
            //TODO if we are support multiple map types, eg google/openlayers/leaflets
            //this method should abstract the need to know what map type the instance is.
            //For now it is current assumed it's openlayers Release 2.13.1
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.createLayer(args);
        },
        createFeatureLayer: function (args) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.createFeatureLayer(args);
        },
        removeLayerByName: function (mapInstance, layerName) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.removeLayerByName(mapInstance, layerName);
        },
        removeLayersByName: function (mapInstance, layerName) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.removeLayersByName(mapInstance, layerName);
        },
        removeLayer: function (mapInstance, layerInstance) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.removeLayer(mapInstance, layerInstance);
        },
        removeLayerById: function (mapInstance, layerId) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.removeLayerById(mapInstance, layerId);
        },
        getMarkerCountForLayerName: function (mapInstance, layerName) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.getMarkerCountForLayerName(mapInstance, layerName);
        },
        registerFeatureSelected: function (mapInstance, layerId, callback, element) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.registerFeatureSelected(mapInstance, layerId, callback, element);
        },
        defaultLayerOptions: function (attrs) {
            //TODO if we are support multiple map types, eg google/openlayers/leaflets
            //this method should abstract the need to know what map type the instance is.
            //For now it is current assumed it's openlayers Release 2.13.1
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.defaultLayerOptions(attrs, new GAConfig());
        },
        createFeature: function (mapInstance, geoJson) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.createFeature(mapInstance, geoJson);
        },
        registerLayerEvent: function (mapInstance, layerId, eventName, callback) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.registerLayerEvent(mapInstance, layerId, eventName, callback);
        },
        addFeatureToLayer: function (mapInstance, layerId, feature) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.addFeatureToLayer(mapInstance, layerId, feature);
        },
        parselatLong: function (latlong) {
            if (!latlong) {
                return null;
            }
            var coords, centerPosition;
            coords = latlong.split(',');
            centerPosition = {lat: "", long: ""};

            centerPosition.lat = coords[0];
            centerPosition.lon = coords[1];

            return centerPosition;
        },
        filterFeatureLayer: function (mapInstance, layerId, filterValue, featureAttributes) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            service.filterFeatureLayer(mapInstance, layerId, filterValue, featureAttributes);
        },
        getLayerFeatures: function (mapInstance, layerId) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.getLayerFeatures(mapInstance, layerId);
        },
        removeFeatureFromLayer: function (mapInstance, layerId, featureId) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.removeFeatureFromLayer(mapInstance, layerId, featureId);
        },
        raiseLayerDrawOrder: function (mapInstance, layerId, delta) {
            var service = mapLayerServiceLocator.getImplementation('olv2');
            return service.raiseLayerDrawOrder(mapInstance, layerId, delta);
        }
    };
}]);

app.service('mapLayerServiceLocator', ['$injector', function ($injector) {
    "use strict";
    var implementations = {'olv2': 'olv2LayerService'};
    return {
        getImplementation: function (mapType) {
            return $injector.get(implementations[mapType]);
        }
    };
}]);