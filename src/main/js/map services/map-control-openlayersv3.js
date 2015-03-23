/* global angular, ol*/

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.controls.openlayersv3', [ ]);

    app.service('olv3MapControls', [function () {
        var supportControls = [
            {name:'overviewmap', constructor: ol.control.OverviewMap},
            {name:'scaleline', constructor: ol.control.ScaleLine},
            {name:'zoomslider', constructor: ol.control.ZoomSlider},
            {name:'mouseposition', constructor: ol.control.MousePosition},
            {name:'attribution', constructor: ol.control.Attribution}
        ];
        var service = {
            resolveSupportedControl: function (name) {
                var control;
                for (var i = 0; i < supportControls.length; i++) {
                    var con = supportControls[i];
                    if(con.name === name) {
                        control = con;
                        break;
                    }
                }
                return control;
            },
            createControl: function (name,controlOptions, div) {
                var control;
                if(div && !controlOptions.div) {
                    controlOptions.element = div;
                }
                var supportedControl = service.resolveSupportedControl(name);
                if(supportedControl == null || supportedControl.constructor == null) {
                    throw new Error("Error in map control construction. Unsupported control or missing source for control constructor.");
                }
                if(supportedControl.customParams) {
                    controlOptions = angular.extend(controlOptions,angular.copy(supportedControl.customParams[0]));
                    control = new supportedControl.constructor(controlOptions);
                } else {
                    if(controlOptions) {
                        control = new supportedControl.constructor(controlOptions);
                    } else {
                        control = new supportedControl.constructor();
                    }
                }
                return control;
            },
            registerControl: function (name, constructor) {
                supportControls.push({name:name,constructor: constructor});
            }
        };
        return service;
    }]);
})();