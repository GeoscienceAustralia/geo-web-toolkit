/* global angular, ol, olcs, $, Cesium */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.ol3cesium',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3'
        ]);

    app.service('ol3CesiumMapService', [function () {
        var service = {
            registerMapEvent: function(mapInstance, eventName, callback) {
                var scene = mapInstance.getCesiumScene();
                var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                handler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            unRegisterMapEvent: function(mapInstance, callback) {

            }
        };

        return service;
    }]);
})();