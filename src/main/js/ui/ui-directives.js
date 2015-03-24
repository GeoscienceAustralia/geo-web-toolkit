var angular = angular || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

angular.module('gawebtoolkit.ui', [ 'gawebtoolkit.ui.directives','gawebtoolkit.ui.templates', 'ui.utils', 'gawebtoolkit.utils' ]);

var app = angular.module('gawebtoolkit.ui.directives', [ 'gawebtoolkit.utils' ]);

/**
 * @ngdoc directive
 * @name gawebtoolkit.ui.directives:googlePlaceNameSearch
 * @param {object} mapController - Map controller
 * @param {string} searchIconUrl - Path to an icon used for search
 * @param {number} zoomLevel - Zoom level after selection from autocomplete
 * @param {string} countryCode - Google country code to be used in the search
 * @description
 * Simple control exposing google auto complete search which zooms on selection.
 * @scope
 * @restrict E
 * @example
 */
app.directive('googlePlaceNameSearch', [function () {
    "use strict";
    return {
        restrict: 'E',
        template: '<input type="text" class="search-box"  placeholder="{{placeHolder}}" />' +
            '<input type="image" class="button search-button" accesskey="4" ' +
            'alt="Search using your entered search criteria" title="Search using your entered search criteria" ' +
            'src="{{searchIconUrl}}"/>',
        scope: {
            mapController: '=',
            searchIconUrl: '@',
            zoomLevel: '@',
            countryCode: '@'
        },
        controller: ['$scope', function ($scope) {

        }],
        link: function ($scope, $element) {
            var input = $element.find('input[type="text"]')[0];
            var googleAC = new google.maps.places.Autocomplete(input, {componentRestrictions: {country: $scope.countryCode}});
            google.maps.event.addListener(googleAC, 'place_changed', function () {
                var place = googleAC.getPlace();
                if (!place.geometry) {
                    return;
                }
                $scope.mapController.zoomTo($scope.zoomLevel);
                $scope.mapController.setCenter(place.geometry.location.k, place.geometry.location.A, "EPSG:4326");
            });
        }
    };
}]);


/**
 * @ngdoc directive
 * @name gawebtoolkit.ui.directives:geoNamesPlaceSearch
 * @param {object} mapController - Map controller
 * @param {string} searchIconUrl - Path to an icon used for search
 * @param {string} geoNamesApiKey - Username to use for geonames.org web service
 * @param {number} zoomLevel - Zoom level after selection from autocomplete
 * @param {string} countryCode - Country code to be used in the search
 * @param {string} resultTemplateUrl - URL for the result template HTML
 * @param {Function} onResults - function called when results are returned
 * @param {Function} onResultsSelected -  function called when a result is selected
 * @param {Function} onPerformSearch - function called when search is performed
 * @param {number} activateKey - key code for activating the search
 * @description
 * Simple control exposing google auto complete search which zooms on selection.
 * @scope
 * @restrict E
 * @example
 */
app.directive('geoNamesPlaceSearch', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
    "use strict";
    return {
        restrict: 'E',
        template: '<input type="text" class="search-box"  placeholder="Place name search" ng-model="query"' +
            'ng-class="{typeAheadLoading:waitingForResponse}" ' +
            'typeahead="result as result.properties.name for result in getSearchResults($viewValue)" ' +
            'typeahead-template-url="{{resultTemplateUrl}}" ' +
            'typeahead-on-select="onSelected($item, $model, $label)" ' +
            'typeahead-wait-ms="200" typeahead-editable="true"/>' +
            '<input type="image" class="button search-button" accesskey="4" ' +
            'ng-click="searchButtonClicked()" ' +
            'alt="Search using your entered search criteria" title="Search using your entered search criteria" ' +
            'src="{{searchIconUrl}}"/>',
        scope: {
            mapController: '=',
            searchIconUrl: '@',
            geoNamesApiKey: '@',
            zoomLevel: '@',
            countryCode: '@',
            resultTemplateUrl: '@',
            onResults: '&',
            onResultsSelected: '&',
            onPerformSearch: '&',
            activateKey: '@'
        },
        controller: ['$scope', function ($scope) {

        }],
        link: function ($scope, $element) {
            var input = $element.find('input[type="text"]')[0];
            $element.bind('keydown', function (args) {
                if (args.keyCode == $scope.activateKey) {
                    if ($scope.typeAheadSelected) {
                        return;
                    }
                    $scope.searchButtonClicked();
                    $scope.$apply();
                }
            });
            var searchFunction = function (query, rowCount) {
                //input box is populated with an object on selection of typeahead
                if (typeof query === 'object') {
                    query = query.properties.name;
                }
                $scope.searchResults = [];
                var deferred = $q.defer();
                $scope.waitingForResponse = true;
                var url = 'http://api.geonames.org/searchJSON?q=' + encodeURIComponent(query).replace("%20", "+") +
                    '&maxRows=' + rowCount + '&country=' + $scope.countryCode.toUpperCase() +
                    '&username=' + $scope.geoNamesApiKey;
                $http.get(url).success(function (results) {
                    $scope.waitingForResponse = false;
                    var geoJsonResults = [];
                    for (var i = 0; i < results.geonames.length; i++) {
                        var geoName = results.geonames[i];
                        geoJsonResults.push($scope.convertGeoNameToGeoJson(geoName));
                    }
                    deferred.resolve(geoJsonResults);
                });

                return deferred.promise;
            };

            $scope.getSearchResults = function (query) {
                if (!(query != null && query.length >= 3)) {
                    return [];
                }

                return searchFunction(query, 10).then(function (data) {
                    if ($scope.searchInProgress) {
                        return [];
                    }
                    $scope.onResults({
                        data: data
                    });
                    return data;
                });
            };

            $scope.onSelected = function ($item) {
                $scope.typeAheadSelected = true;
                //Do not re-run query if activateKey is the same as typeahead selection
                $timeout(function () {
                    $scope.typeAheadSelected = false;
                }, 50);
                $scope.onResultsSelected({
                    item: $item
                });
            };

            $scope.searchButtonClicked = function () {
                $scope.searchInProgress = true;
                if ($scope.query != null) {
                    return searchFunction($scope.query, 50).then(function (data) {
                        $scope.searchInProgress = false;
                        $scope.onPerformSearch({
                            data: data
                        });
                        return data;
                    });
                }
            };

            $scope.convertGeoNameToGeoJson = function (geoNameResult) {
                var geoJson = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [geoNameResult.lng, geoNameResult.lat]
                    },
                    crs: {
                        type: "name",
                        properties: {
                            name: "EPSG:4326"
                        }
                    }
                };
                geoJson.properties = {};
                for (var prop in geoNameResult) {
                    if (geoNameResult.hasOwnProperty(prop)) {
                        geoJson.properties[prop] = geoNameResult[prop];
                    }
                }
                return geoJson;
            };
        }
    };
}]);

/**
 *
 * */
app.directive('gaSearchWfs', ['$q', '$interpolate', '$log', function ($q, $interpolate, $log) {
    "use strict";
    var template = '<input type="text" class="search-box" ng-model="query" ' +
        'ng-class="{typeAheadLoading:waitingForResponse}" placeholder="{{placeHolder}}" />' +
        '<input type="image" class="button search-button" ng-click="searchButtonClicked()" ' +
        'accesskey="4" alt="Search using your entered search criteria" ' +
        'title="Search using your entered search criteria" ' +
        'src="{{searchIconUrl}}">';
    //Using 'result.id' as the result features coming back should have a server id.
    //Specific property names are dynamic and cannot be relied on.
    return {
        restrict: "EA",
        template: template,
        scope: {
            resultTemplateUrl: '@',
            mapController: '=',
            searchEndPoints: '=',
            onResults: '&',
            onResultsSelected: '&',
            onPerformSearch: '&',
            primaryWfsProperty: '@',
            searchIconUrl: '@',
            placeHolder: '@',
            activateKey: '@'
        },
        controller: ['$scope', function ($scope) {
            $scope.waitingForResponse = false;
        }],
        link: function ($scope, $element, $attrs) {
            $element.bind('keydown', function (args) {
                if (args.keyCode == $scope.activateKey) {
                    $scope.searchButtonClicked();
                    $scope.$apply();
                }
            });
            var clients = [];
            var attribute;
            $scope.limitResults = 10;

            $scope.$watch('searchEndPoints', function (newVal) {
                if (newVal) {
                    if ($scope.mapController == null) {
                        return;
                    }
                    clients = [];
                    for (var i = 0; i < $scope.searchEndPoints.length; i++) {
                        var wfsClient = $scope.mapController.createWfsClient($scope.searchEndPoints[i].url, $scope.searchEndPoints[i].featureType,
                            $scope.searchEndPoints[i].featurePrefix, $scope.searchEndPoints[i].version, $scope.searchEndPoints[i].geometryName,
                            $scope.searchEndPoints[i].datumProjection, $scope.searchEndPoints[i].isLonLatOrderValid);

                        var clientDto = $scope.mapController.addWfsClient(wfsClient);
                        clientDto.endPointId = $scope.searchEndPoints[i].id;
                        clients.push(clientDto);
                        attribute = $scope.searchEndPoints[i].featureAttributes;
                    }
                }
            });

            if ($attrs.searchEndPoints == null) {
                if ($scope.mapController != null) {
                    var wfsClient = $scope.mapController.createWfsClient($scope.url, $scope.featureType, $scope.featurePrefix, $scope.version,
                        $scope.geometryName, $scope.datumProjection);

                    clients.push($scope.mapController.addWfsClient(wfsClient));
                }
            }
            function filterQuery(searchQuery) {
                return searchQuery.replace('\'', '').replace('"', '').replace('%', '').replace('*', '');
            }

            var searchFunction = function (query) {
                query = filterQuery(query);
                //Due to problems with some implementations of WFS, filter query term values.
                $scope.searchResults = [];
                var deferred = $q.defer();
                var count = 0;
                var allResults = [];
                $scope.waitingForResponse = true;

                //As we are using WFS for search, we iterate over a list of endpoints making the same
                //query and once all endpoints return, we provide results
                for (var i = 0; i < clients.length; i++) {
                    var currentClient = clients[i];
                    $scope.mapController.searchWfs(clients[i].clientId, query, attribute).then(function (data) {

                        if (data == null) {
                            $log.error("Search server is unavailable.");
                            deferred.resolve([]);
                            return;
                        }
                        count++;

                        for (var j = 0; j < data.features.length; j++) {
                            data.features[j].endPointId = currentClient.endPointId;
                            allResults.push(data.features[j]);
                        }

                        if (count === clients.length) {
                            deferred.resolve(allResults);
                            $scope.waitingForResponse = false;
                        }
                    });
                }
                return deferred.promise;
            };

            $scope.getSearchResults = function (query) {
                if (query != null && query.length >= 3) {
                    return searchFunction(query).then(function (data) {
                        $scope.onResults({
                            data: data
                        });
                        //Limit typeahead to 10 results
                        return data.slice(0, 10);
                    });
                } else {
                    return [];
                }
            };

            $scope.onSelected = function ($item) {
                $scope.onResultsSelected({
                    item: $item
                });
            };

            $scope.searchButtonClicked = function () {
                //For the case where typeahead populates the $scope.query value with the selected item
                //We want to query with the value of the primary property as that will be the text in the
                //input field.
                if (typeof $scope.query === 'object' && $scope.query.properties != null) {
                    $scope.query = $scope.query.properties[$scope.primaryWfsProperty];
                }
                if ($scope.query != null) {
                    return searchFunction($scope.query).then(function (data) {
                        $scope.onPerformSearch({
                            data: data
                        });
                        return data;
                    });
                }
            };
        },
        transclude: true
    };
} ]);
/**
 *
 * */
app.directive('gaMeasureToggle', [function () {
    "use strict";
    return {
        restrict: "EA",
        template: '<button type="button" ng-click="handleToggle()" class="gaUiToggleOff"><div ng-transclude></div></button> ',
        scope: {
            resolveStyle: '&',
            toggleOnCallback: '&',
            toggleOffCallback: '&',
            onFinish: '&',
            onUpdate: '&',
            mapControlId: '@',
            controllerEmitEventName: '@',
            mapController: '='
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
                return $scope.mapController.isControlActive($scope.mapControlId);
            };
            $scope.$emit($scope.controllerEmitEventName, self);
        }],
        link: function ($scope,$element) {

            $scope.handleMeasurements = function (event) {
                var measurement = $scope.mapController.getMeasureFromEvent(event);
                $scope.onFinish({
                    event: measurement
                });
            };
            $scope.handlePartialMeasure = function (event) {
                var measurement = $scope.mapController.getMeasureFromEvent(event);
                $scope.onUpdate({
                    event: measurement
                });
            };
            $scope.activate = function () {
                $scope.mapController.activateControl($scope.mapControlId);
                $scope.mapController.registerControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                $scope.mapController.registerControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
                $element.removeClass('gaUiToggleOff');
                $element.addClass('gaUiToggleOn');
                $scope.toggleOnCallback();
            };
            $scope.deactivate = function () {
                $scope.mapController.deactivateControl($scope.mapControlId);
                $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
                $element.removeClass('gaUiToggleOn');
                $element.addClass('gaUiToggleOff');
                $scope.toggleOffCallback();
            };
            $scope.handleToggle = function () {
                if ($scope.mapController.isControlActive($scope.mapControlId)) {
                    $scope.deactivate();
                } else {
                    $scope.activate();
                }
            };

            $scope.$on('$destroy', function () {
                $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
                $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handleMeasurements);
            });
        },
        transclude: true,
        replace: true
    };
} ]);
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
