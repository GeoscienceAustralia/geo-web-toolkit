(function () {

    var app = angular.module('geowebtoolkit.core.data-services', [
        'geowebtoolkit.mapservices',
        'geowebtoolkit.core.map-config'
    ]);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
    app.service('GeoDataService', ['$log', 'geoConfig', 'dataServiceLocator',
        function ($log, geoConfig, dataServiceLocator) {
            'use strict';
            //OpenLayers 2 as default
            var defaultFramework = 'olv2';
            return {
                getLayersByWMSCapabilities: function (url, version) {
                    var useVersion = version || defaultFramework;
                    var service = dataServiceLocator.getImplementation(useVersion);
                    return service.getLayersByWMSCapabilities(url);
                },
                getWMSFeatures: function (mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, version) {
                    var useVersion = version || defaultFramework;
                    var service = dataServiceLocator.getImplementation(useVersion);
                    return service.getWMSFeatures(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType);
                },
                getWMSFeaturesUrl: function (mapInstance,url, layerNames, wmsVersion, pointEvent, contentType,version) {
                    var useVersion = version || defaultFramework;
                    var service = dataServiceLocator.getImplementation(useVersion);
                    return service.getWMSFeaturesUrl(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType);
                },
                getWMSFeaturesByLayerId: function (mapInstance, url, layerId, point, version) {
                    var useVersion = version || defaultFramework;
                    var service = dataServiceLocator.getImplementation(useVersion);
                    return service.getWMSFeaturesByLayerId(mapInstance, url, layerId, point);
                }
            };
        }]);

    app.service('dataServiceLocator', ['$injector', function ($injector) {
        "use strict";
        var implementations = {
            'olv2': 'olv2DataService',
            'olv3': 'olv3DataService'
        };
        return {
            getImplementation: function (mapType) {
                if(mapType === 'olv3') {
                    $log.warn("Falling back to OpenLayers 2 for DataSource services.")
                }
                return $injector.get(implementations[mapType]);
            }
        };
    }]);
})();