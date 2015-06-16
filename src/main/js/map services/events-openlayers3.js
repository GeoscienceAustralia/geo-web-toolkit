/* global angular, $, ol */
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.events-openlayers3',[]);

    app.service('ol3CesiumEventManager', [function () {
        function updateToolkitMapInstanceProperty(mapInstance,propertyName, propertyValue) {
            var _geowebtoolkit = mapInstance.get('_geowebtoolkit') || {};
            _geowebtoolkit[propertyName] = propertyValue;
            mapInstance.set('_geowebtoolkit', _geowebtoolkit);
        }
        function getToolkitMapInstanceProperty(mapInstance, propertyName) {
            var result = null;
            if(mapInstance.get('_geowebtoolkit')) {
                var temp = mapInstance.get('_geowebtoolkit');
                result = temp[propertyName];
            }
            return result;
        }
        return {
            registerMapMouseMove: function (mapInstance, cesiumAdapter, callback) {
                var existingEvent = getToolkitMapInstanceProperty(mapInstance, 'registerMapMouseMove');
                if(existingEvent) {
                    $(mapInstance.getViewport()).un(callback);
                }
                updateToolkitMapInstanceProperty(mapInstance,'registerMapMouseMove',callback);
                $(mapInstance.getViewport()).on('mousemove', callback);
            },
            registerMapMouseMoveEnd: function (mapInstance, cesiumAdapter, callback) {
                $(mapInstance.getViewport()).on('mousemove', function (obj, e) {
                    var existingTimeout = getToolkitMapInstanceProperty(mapInstance,'mousemoveTimeout');
                    if (existingTimeout) {
                        window.clearTimeout(existingTimeout);
                    }
                    existingTimeout = window.setTimeout(function () {
                        callback(obj, e);
                    }, 100);
                    updateToolkitMapInstanceProperty(mapInstance,'mousemoveTimeout',existingTimeout);
                });
            },
            registerMapClick: function (mapInstance, cesiumAdapter, callback) {

            },
            unRegisterMapClick: function (mapInstance, cesiumAdapter, callback) {

            },
            registerMapEvent: function (mapInstance, cesiumAdapter, eventName, callback) {

            },
            unRegisterMapEvent: function (mapInstance, cesiumAdapter, eventName, callback) {

            },
            switchTo3dView: function (mapInstance, cesiumAdapter) {

            },
            switchTo2dView: function (mapInstance, cesiumAdapter) {

            },
            registerControlEvent: function (mapInstance, cesiumAdapter, controlId, eventName, callback) {

            },
            unRegisterControlEvent: function (mapInstance, cesiumAdapter, controlId, eventName, callback) {

            }
        };
    }]);
})();