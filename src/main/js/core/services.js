var angular = angular || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('geowebtoolkit.utils', []);
app.service('GeoUtils', [ function () {
    'use strict';
    function convertHexToRgb(hexVal) {
        hexVal = parseInt(hexVal.charAt(0) === '#' ? hexVal.substring(1, 7) : hexVal, 16);
        return [Math.floor(hexVal / 65536), Math.floor((hexVal % 65536) / 256), hexVal % 256];
    }

    return {
        generateUuid: function () {
            //Code from - https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            //Author https://github.com/broofa
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x'
                    ? r
                    : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        convertHexToRgb: convertHexToRgb,
        convertHexAndOpacityToRgbArray: function (hexVal, opacity) {
            var a = convertHexToRgb(hexVal);
            a.push(opacity);
            return a;
        }


    };
} ]);