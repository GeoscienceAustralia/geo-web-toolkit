/* global angular, ol*/

(function () {
    "use strict";

    var app = angular.module('geowebtoolkit.mapservices.controls.openlayersv3', [ ]);

    app.service('olv3MapControls', ['$log',function ($log) {
        var supportControls = [
            {name: 'overviewmap', constructor: ol.control.OverviewMap},
            {name: 'scaleline', constructor: ol.control.ScaleLine},
            {name: 'zoomslider', constructor: ol.control.ZoomSlider},
            {name: 'panzoombar', constructor: ol.control.ZoomSlider},
            {name: 'zoom', constructor: ol.control.Zoom},
            {name: 'mouseposition', constructor: ol.control.MousePosition, resolveCustomParams: mousePositionDefaults},
            {name: 'attribution', constructor: ol.control.Attribution}
        ];

        function mousePositionDefaults(controlOptions, mapOptions) {
            var result = {};
            var wgs84Default = function (dgts) {
                return (
                    function (coord) {
                        if (coord[0] > 180) {
                            coord[0] = coord[0] - 360;
                        }
                        if (coord[0] < -180) {
                            coord[0] = coord[0] + 360;
                        }

                        if (coord[1] > 90) {
                            coord[1] = coord[1] - 180;
                        }
                        if (coord[1] < -90) {
                            coord[1] = coord[1] + 180;
                        }
                        return ol.coordinate.toStringXY(coord, dgts);
                    });
            };
            var wrappedFormatOutput = function (formatFn) {
                return (
                    function (coord) {
                        if (coord[0] > 180) {
                            coord[0] = coord[0] - 360;
                        }
                        if (coord[0] < -180) {
                            coord[0] = coord[0] + 360;
                        }

                        if (coord[1] > 90) {
                            coord[1] = coord[1] - 180;
                        }
                        if (coord[1] < -90) {
                            coord[1] = coord[1] + 180;
                        }
                        return formatFn({ lon: coord[0], lat: coord[1]});
                    });
            };
            if (controlOptions.formatOutput != null) {
                result.coordinateFormat = wrappedFormatOutput(controlOptions.formatOutput);
            } else {
                result.coordinateFormat = controlOptions.coordinateFormat == null ? wgs84Default(4) : controlOptions.coordinateFormat(4);
            }
            result.projection = controlOptions.projection || mapOptions.displayProjection || 'EPSG:4326';
            return result;
        }

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
            createControl: function (name, controlOptions, div, mapOptions) {
                var control;
                if (div && !controlOptions.div) {
                    controlOptions.element = div;
                }
                var supportedControl = service.resolveSupportedControl(name);
                if (supportedControl == null || supportedControl.constructor == null) {
                    var message = "Error in map control construction for '" + name + "'. Unsupported control or missing source for control constructor.";
                    message += "\r\nSupported controls names are: ";
                    for (var i = 0; i < supportControls.length; i++) {
                        var con = supportControls[i];
                        message += "\r\n" + con.name;
                    }
                    throw new Error(message);
                }

                if(name === 'overviewmap' && controlOptions && controlOptions.layers) {
                    $log.warn('Current version of OL3 does not support custom Overview Maps. Removing custom layers.');
                    controlOptions.layers = null;
                }

                if (supportedControl.resolveCustomParams) {
                    controlOptions = angular.extend(controlOptions, angular.copy(supportedControl.resolveCustomParams(controlOptions, mapOptions)));
                    control = new supportedControl.constructor(controlOptions);
                } else if (supportedControl.customParams) {
                    controlOptions = angular.extend(controlOptions, angular.copy(supportedControl.customParams[0]));
                    control = new supportedControl.constructor(controlOptions);
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

    //If exists as v3 may not be included if apps are only using v2.
    if (ol != null && ol.control != null && ol.control.ZoomSlider != null) {
        ol.control.ZoomSlider.prototype.getPositionForResolution_ = function (res) {
            try {
                var fn = this.getMap().getView().getValueForResolutionFunction();
                return 1 - fn(res);
            } catch (error) {

            }
        };
    }
})();