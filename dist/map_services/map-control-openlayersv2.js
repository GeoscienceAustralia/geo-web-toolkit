var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};
var darwin = darwin || {};
var app = angular.module('geowebtoolkit.mapservices.controls.openlayersv2', [ ]);

app.service('olv2MapControls', [function () {
    "use strict";
    var supportControls = [
        {name: 'permalink', constructor: OpenLayers.Control.Permalink},
        {name: 'overviewmap', constructor: OpenLayers.Control.OverviewMap},
        {name: 'scale', constructor: OpenLayers.Control.Scale},
        {name: 'scaleline', constructor: OpenLayers.Control.ScaleLine},
        {name: 'panzoombar', constructor: OpenLayers.Control.PanZoomBar},
        {name: 'zoomslider', constructor: OpenLayers.Control.PanZoomBar},
        {name: 'zoom', constructor: OpenLayers.Control.Zoom},
        {name: 'mouseposition', constructor: OpenLayers.Control.MousePosition},
        {name: 'attribution', constructor: OpenLayers.Control.Attribution},
        {name: 'measureline', constructor: OpenLayers.Control.Measure, customParams: [OpenLayers.Handler.Path]},
        {name: 'measurepolygon', constructor: OpenLayers.Control.Measure, customParams: [OpenLayers.Handler.Polygon]},
        {name: 'wmsgetfeatureinfo', constructor: OpenLayers.Control.WMSGetFeatureInfo}
    ];
    var service = {
        resolveSupportedControl: function (name) {
            var control;
            for (var i = 0; i < supportControls.length; i++) {
                var con = supportControls[i];
                if (con.name === name) {
                    control = con;
                    break;
                }
            }
            return control;
        },
        createControl: function (name, controlOptions, div) {
            var control;
            if (div && !controlOptions.div) {
                controlOptions.div = div;
            }
            var supportedControl = service.resolveSupportedControl(name);
            if (supportedControl == null || supportedControl.constructor == null) {
                throw new Error("Error in map control construction. Unsupported control or missing source for control constructor.");
            }
            if (supportedControl.customParams) {
                //handle first custom param..
                if (controlOptions) {
                    control = new supportedControl.constructor(supportedControl.customParams[0], controlOptions);
                } else {
                    control = new supportedControl.constructor(supportedControl.customParams[0]);
                }
            } else {
                if (controlOptions) {
                    control = new supportedControl.constructor(controlOptions);
                } else {
                    control = new supportedControl.constructor();
                }
            }
            return control;
        },
        registerControl: function (name, constructor) {
            supportControls.push({name: name, constructor: constructor});
        }
    };
    return service;
}]);