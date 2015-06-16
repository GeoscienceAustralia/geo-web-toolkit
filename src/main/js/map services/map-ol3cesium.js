/* global angular, ol, olcs, $, Cesium */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.ol3cesium',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3'
        ]);

    app.service('ol3CesiumMapService', [function () {
        var spaceEventHandler;
        var service = {
            registerMapClick: function(mapInstance, callback) {
                var scene = mapInstance.getCesiumScene();
                if(!spaceEventHandler) {
                    spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                }
                spaceEventHandler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            unRegisterMapClick: function(mapInstance, callback) {
                var scene = mapInstance.getCesiumScene();
                if(!spaceEventHandler) {
                    spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                }
                spaceEventHandler.removeInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            registerMapEvent: function(mapInstance, eventName, callback) {
                var scene = mapInstance.getCesiumScene();
                if(!spaceEventHandler) {
                    spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                }
                spaceEventHandler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            unRegisterMapEvent: function(mapInstance, callback) {

            },
            getCoordinateFromPixel: function (mapInstance,pixel) {
                var scene = mapInstance.getCesiumScene();
                var ellipsoid = scene.globe.ellipsoid;
                var cartesian = scene.camera.pickEllipsoid(pixel, ellipsoid);
                if (cartesian) {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    var result = [parseFloat(longitudeString), parseFloat(latitudeString)];
                    return result;
                }
                return [0,0];
            }
        };

        return service;
    }]);
})();