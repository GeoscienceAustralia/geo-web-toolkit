var angular = angular || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.utils', []);
app.service('GAWTUtils', [ function() {
   'use strict';
   return {
      generateUuid : function() {
         //Code from - https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
         //Author https://github.com/broofa
         return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x'
                  ? r
                  : (r & 0x3 | 0x8);
            return v.toString(16);
         });
      },
      convertHexToRgb: function (hexVal) {
         function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
         function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
         function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
         function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
         return [hexToR(hexVal),hexToG(hexVal),hexToB(hexVal)];
      },
      convertHexAndOpacityToRgbArray: function (hexVal, opacity) {
         function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
         function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
         function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
         function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
         return [hexToR(hexVal),hexToG(hexVal),hexToB(hexVal), opacity];
      }


   };
} ]);