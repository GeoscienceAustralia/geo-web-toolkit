var angular = angular || {};
var OpenLayers = OpenLayers || {};
var ol = ol || {};
var app = angular.module('gawebtoolkit.core.data-services', ['gawebtoolkit.mapservices']);

//This service exists to support the requirement that these patterns and controls could be
//reused with future implementations based off frameworks other than OpenLayer V2.
app.service('GADataService', ['$log', 'ga.config', 'dataServiceLocator',
    function ($log, GAConfig, dataServiceLocator) {
        'use strict';
        return {
            getLayersByWMSCapabilities: function (url, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(url);
            },
            getWMSFeatures: function (mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getWMSFeatures(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType);
            },
            getWMSFeaturesByLayerId: function (mapInstance, url, layerId, point, version) {
                var useVersion = version || 'olv2';
                var service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(mapInstance, url, layerId, point);
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
            return $injector.get(implementations[mapType]);
        }
    };
}]);