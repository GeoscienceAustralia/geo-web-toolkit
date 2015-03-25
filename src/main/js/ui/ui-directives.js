var angular = angular || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

angular.module('gawebtoolkit.ui', [ 'gawebtoolkit.ui.directives','gawebtoolkit.ui.templates', 'ui.utils', 'gawebtoolkit.utils' ]);

var app = angular.module('gawebtoolkit.ui.directives', [ 'gawebtoolkit.utils' ]);

/*
 * gaLayersDialog renders a list of layers that can be turned off and on
 *
 * attributes
 *   dialog-config: jquery dialog options that are bound to dialog and will update the dialog on change
 *   layers-data: an array of layers to be displayed expected structure is
 *       [{
 *           id: //unique id of the layer
 *           opacity: //value betweeb 0-100 representing the percentage of opacity of the layer
 *           visibility: //boolean representing if layer is visible
 *           name: //friendly name of the layer
 *       }]
 *   mapController: a controller that has access to the mapInstance object that exposes the same contract as 'ga-map'
 *
 *   filterFn ? This directive could be expanded to customise the way the layers are filtered
 * */
app.directive('gaLayersDialog', ['GAWTUtils', function (GAWTUtils) {
    'use strict';
    var templateCache =
        '<div ui-jq="dialog" ui-options="dialogConfig" id="{{dialogId}}">' +
        '<div ng-repeat="layer in layersData">' +
        '<ga-layer-control map-controller="mapController" layer-data="layer"></ga-layer-control>' +
        '</div>' +
        '</div>';
    return {
        restrict: "E",
        template: templateCache,
        scope: {
            layersData: '=',
            dialogConfig: '=',
            mapController: '='
        },
        controller: ['$scope', function ($scope) {
            $(window).bind('resize', function () {
                //Reinitialise dialog on window resize, resets position to correct relative location
                //Force last closed state
                $scope.dialogConfig.autoOpen = !$scope.isClosed;
                $('#' + $scope.dialogId).dialog($scope.dialogConfig);
            });
            //Initialise id element to use for cleaning up/closing the dialog
            $scope.dialogId = GAWTUtils.generateUuid();

            $scope.isClosed = !$scope.dialogConfig.autoOpen;
            var self = this;
            self.openDialog = function () {
                $('#' + $scope.dialogId).dialog('open');
                $scope.isClosed = false;
            };
            self.closeDialog = function () {
                $('#' + $scope.dialogId).dialog('close');
                $scope.isClosed = true;
            };
            self.isClosed = function () {
                return $scope.isClosed;
            };
            $scope.$emit('layersDialogReady', self);
        }],
        link: function ($scope, $element, $attrs) {
            $scope.filterBaseLayers = function (layer) {
                var layerIsBaseLayer = $scope.mapController.isBaseLayer(layer.id);
                return !layerIsBaseLayer;
            };
            $scope.$on('$destroy', function () {
                $('#' + $scope.dialogId).dialog('destroy').remove();
            });

            $scope.$watch($attrs.uiRefresh, function () {
                $('#' + $scope.dialogId).bind('dialogclose', function () {
                    $scope.isClosed = !$scope.isClosed;
                });
            });
        },
        transclude: true
    };
}]);
/**
 *
 * */
app.directive('gaStaticDialog', ['$timeout', 'GAWTUtils', function ($timeout, GAWTUtils) {
    'use strict';
    var templateCache =
        '<div ui-jq="dialog" ui-options="dialogConfig" id="{{dialogId}}">' +
        '<div ng-transclude></div>' +
        '</div>';
    return {
        restrict: "AE",
        template: templateCache,
        scope: {
            controllerEmitEventName: '@',
            dialogConfig: '=',
            dialogWindowResize: '&',
            dialogClosed: '&',
            dialogOpened: '&'
        },
        controller: ['$scope', function ($scope) {
            $(window).bind('resize', function () {
                if ($scope.dialogWindowResize != null) {
                    $scope.dialogConfig = angular.extend($scope.dialogConfig, $scope.dialogWindowResize());
                }
                //Reinitialise dialog on window resize, resets position to correct relative location
                //Force last closed state
                $scope.dialogConfig.autoOpen = !$scope.isClosed;
                $('#' + $scope.dialogId).dialog($scope.dialogConfig);
            });
            //Initialise id element to use for cleaning up/closing the dialog
            $scope.dialogId = GAWTUtils.generateUuid();
            var self = this;
            self.openDialog = function () {
                $('#' + $scope.dialogId).dialog('open');
                $scope.isClosed = false;
                $scope.dialogOpened();
            };
            self.closeDialog = function () {
                $('#' + $scope.dialogId).dialog('close');
                $scope.isClosed = true;
                $scope.dialogClosed();
            };
            self.isClosed = function () {
                return $scope.isClosed;
            };
            $scope.$emit($scope.controllerEmitEventName, self);
        }],
        link: function ($scope) {
            $scope.$on('$destroy', function () {
                $('#' + $scope.dialogId).dialog('destroy').remove();
            });

            var dialogConfigWatch = $scope.$watch('dialogConfig', function (data) {
                if (data != null) {
                    $scope.dialogReady = true;
                    $('#' + $scope.dialogId).bind('dialogclose', function () {
                        $scope.isClosed = true;
                        $timeout(function () {
                            $scope.$apply();
                        });
                        $scope.dialogClosed();
                    });
                    $scope.isClosed = !data.autoOpen;
                    dialogConfigWatch();
                }
            });

        },
        transclude: true
    };
}]);
/**
 * */
app.directive('gaDialogToggle', [ function () {
    'use strict';
    var templateCache = '<button type="button" ng-click="toggleDialog()"><div ng-transclude></div></button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: true,
        scope: {
            gaDialogController: '=',
            gaToggleClicked: '&'
        },
        link: function ($scope) {
            $scope.toggleDialog = function () {
                var dialogOpen = !$scope.gaDialogController.isClosed();
                if (!dialogOpen) {
                    $scope.gaDialogController.openDialog();
                } else {
                    $scope.gaDialogController.closeDialog();
                }
                $scope.gaToggleClicked({
                    dialogController: $scope.gaDialogController
                });
            };
        }
    };
} ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.ui.directives:gaLayerInteractionToggle
 * @param {string} toggleIconSource - A string value of toggle button's icon URL
 * @param {object} mapController - controller instance for the map
 * @param {string} controllerEmitEventName - event that is fired that passes the controller
 * @param {function} toggleOffCallback - Callback function to be called when toggle button is turns off
 * @param {function()} toggleOnCallback - Callback function to be called when toggle button turns on
 * @param {function} onLayerClickCallBack - Callback function to be called when the map layer is clicked
 * @param {string} layerInteractionId - ID of the layer that this toggle button will interact with
 * @description
 * This control provides a button to toggle interaction with a layer on/off
 * @scope
 * @restrict E
 * @example
 * <example module="layerInteractionToggle">
 * <file name="layerInteractionToggle.html">
 * <div ng-controller="ourMapController">
 *         <div class="toolber">
            <ga-layer-interaction-toggle 
                toggle-icon-source="//np.ga.gov.au/gamaps/resources/img/Layers.png"
                controller-emit-event-name="toggleInteractionEvent"
                map-controller="mapController"
                layer-interaction-id="layers[1].id"
                on-layer-click-callback="clickCallback()"
                class="toggleInteractionButton">Toggle Interaction of "{{layers[1].name}}" layer on/off
            </ga-layer-interaction-toggle>
            <ga-layer-control ng-show="toggleInteractionController.isToggleActive()" layer-data="layers[1]" map-controller="mapController" class="alert alert-info"></ga-layer-control>
        </div>
        <div class="alert alert-danger layerClicked">Layer Clicked</div>
        <div id="map" style="width:90%;height:600px"></div>
    <ga-map
        map-element-id="map"
        datum-projection='EPSG:102100'
        display-projection='EPSG:4326'
        center-position='{"lat":"-3434403","lon":"14517578"}'
        zoom-level="4">
        <ga-map-layer
            layer-name="World Image"
            layer-url="http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer"
            wrap-date-line="true"
            layer-type="XYZTileCache"
            is-base-layer="true"
            visibility="false">
        </ga-map-layer>
        <ga-map-layer
            layer-name="Earthquake hazard contours" 
            layer-type="WMS"
            layer-url="http://www.ga.gov.au/gis/services/hazards/EarthquakeHazard/MapServer/WMSServer" 
            is-base-layer="false"
            layers="hazardContours"
            background-color="#ffffff">
        </ga-map-layer>
        <ga-map-control map-control-name="mouseposition"></ga-map-control>
        <ga-map-control map-control-name="OverviewMap"></ga-map-control>
        <ga-map-control map-control-name="Permalink"></ga-map-control>
        <ga-map-control map-control-name="ScaleLine"></ga-map-control>
        <ga-map-control map-control-name="panzoombar"></ga-map-control>            
    </ga-map>

 * </div>
 * </file>
 * 
 * <file name="layerInteractionToggle.js">
 *      var app = angular.module('layerInteractionToggle',
        ['gawebtoolkit.core', 'gawebtoolkit.ui']);
        app.controller("ourMapController",["$scope", function($scope) {
                $scope.$on("mapControllerReady", function(event, args) {
                    $scope.mapController = args;
                    $scope.$on("layersReady", function() {
                        $scope.layers = $scope.mapController.getLayers();
                    });
                });
                $scope.$on("toggleInteractionEvent", function(event, args) {
                    $scope.toggleInteractionController = args;
                    $scope.clickCallback = function() {
                        $(".layerClicked").fadeIn();
                        setTimeout(function() {
                            $(".layerClicked").fadeOut();
                        }, 1000);
                    };
                });
            }]);
        
        $(".alert-danger")
                .css({
                    "margin-top": "10px",
                    "margin-left": ( ($("#map").width() - $(".alert-danger").width()) / 2 ) + "px"
        });
 * </file>
 * 
 * <file name="layerInteractionToggle.css">
 *             #map {
                background-color: #21468b
            }
            .alert-info {
                float: left;
                clear: both;
                min-height: 80px;
                width: 100%;
            }
            .alert-danger {
                position: absolute;
                display: none;
                z-index: 10000;
            }
            .alert label {
                margin-left: 10px;
            }
            .toggleInteractionButton {
                float: left;
            }
            .toolber {
                display: inline-block;
            }
 * </file>
 * </example>
 */
app.directive('gaLayerInteractionToggle', [ function () {
    'use strict';
    var templateCache =
        '<button ng-click="toggleClicked()" class="gaUiToggleOff" type="button">' +
        '<div ng-transclude></div>' +
        '</button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: true,
        scope: {
            toggleIconSource: '@',
            controllerEmitEventName: '@',
            toggleOnCallback: '&',
            toggleOffCallback: '&',
            onLayerClickCallback: '&',
            mapController: '=',
            layerInteractionId: '='
        },
        controller: ['$scope', function ($scope) {
            var self = this;

            self.activate = function () {
                $scope.activate();
            };
            self.deactivate = function () {
                $scope.deactivate();
            };
            self.isToggleActive = function () {
                return $scope.isToggleOn;
            };

            $scope.$emit($scope.controllerEmitEventName, self);
        }],
        link: function ($scope, $element) {
            $scope.isToggleOn = false;

            $scope.activate = function () {
                $scope.mapController.registerMapClick(callback);
                $element.removeClass('gaUiToggleOff');
                $element.addClass('gaUiToggleOn');
                $scope.isToggleOn = true;
                $scope.toggleOnCallback();

            };
            $scope.deactivate = function () {
                $scope.mapController.unRegisterMapClick(callback);
                $element.removeClass('gaUiToggleOn');
                $element.addClass('gaUiToggleOff');
                $scope.isToggleOn = false;
                $scope.toggleOffCallback();
            };
            $scope.toggleClicked = function () {
                $scope.isToggleOn = !$scope.isToggleOn;
                if ($scope.isToggleOn) {
                    $scope.activate();
                } else {
                    $scope.deactivate();
                }
            };

            var callback = function (e) {
                var xyPoint = $scope.mapController.getPointFromEvent(e);
                $scope.onLayerClickCallback({
                    point: xyPoint,
                    interactionId: $scope.layerInteractionId
                });
            };
        }
    };
} ]);
/**
 * gaZoomToExtentButton
 * Notes: beforeZoom param 'points' is the underlying implementation object
 **/
app.directive('gaZoomToExtentButton', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            extentPoints: '=',
            mapController: '=',
            beforeZoom: '&'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                var bounds = $scope.mapController.createBounds($scope.extentPoints);
                $scope.beforeZoom({
                    points: bounds
                });
                $scope.mapController.zoomToExtent(bounds);
            };
        },
        transclude: true
    };
} ]);
/**
 * */
app.directive('gaZoomToCenterPositionAnchor', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<a ng-click="zoomTo()"><div ng-transclude></div></a>',
        scope: {
            geoJsonCoord: '=',
            projection: '@',
            mapController: '=',
            zoomLevel: '@'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                $scope.mapController.setCenter($scope.geoJsonCoord[1], $scope.geoJsonCoord[0], $scope.projection);
                $scope.mapController.zoomTo($scope.zoomLevel);
            };
        },
        transclude: true
    };
} ]);
/**
 *
 * */
app.directive('gaZoomToLayerButton', [ function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            layerId: '@',
            mapController: '=',
            beforeZoom: '&'
        },
        link: function ($scope) {
            $scope.zoomTo = function () {
                $scope.mapController.zoomToLayer($scope.layerId);
            };
        },
        transclude: true
    };
} ]);
/**
 * */
app.directive('gaToggle', [ function () {
    'use strict';
    var templateCache = '<button type="button" ng-click="toggle()"><div ng-transclude></div></button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: true,
        scope: {
            gaToggleClicked: '&'
        },
        link: function ($scope) {
            $scope.toggle = function () {
                $scope.gaToggleClicked();
            };
        }
    };
}]);
/*
 * Work around from suggestion in angularjs issues on github
 * https://github.com/angular/angular.js/issues/2809
 * Modified with timeout to avoid digestion cycle problems with data
 * */
app.directive('fixIeSelect', function () {
    "use strict";
    return {
        restrict: 'A',
        controller: [ '$scope', '$element', '$timeout', function ($scope, $element, $timeout) {
            $scope.$watch('options', function () {
                var $option = $('<option>');
                var widthVal = $element.css('width');
                // for some reason, it needs both, getting the width and changing CSS options to rerender select
                $element.css('width');
                $element.addClass('repaint').removeClass('repaint');

                // add and remove option to rerender options
                $option.appendTo($element).remove();
                $timeout(function () {
                    $element.css('width', 'auto');
                });
                $option = null;
                //$element.css('width','auto');
            });
        } ]
    };
});
