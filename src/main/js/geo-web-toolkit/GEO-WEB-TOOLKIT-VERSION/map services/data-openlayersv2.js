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
        }
    };
} ]);