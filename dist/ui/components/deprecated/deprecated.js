/* global angular, $ */
(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.deprecated',['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);

    /**
     * */
    app.directive('gaDialogToggle', [ function () {
        return {
            restrict: "E",
            templateUrl:'src/main/js/ui/components/deprecated/dialog-toggle.html',
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
     *
     * */
    app.directive('gaStaticDialog', ['$timeout', 'GAWTUtils', function ($timeout, GAWTUtils) {
        return {
            restrict: "AE",
            templateUrl: 'src/main/js/ui/components/deprecated/static-dialog.html',
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
        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/deprecated/layers-dialog.html',
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
     * @ngdoc directive
     * @deprecated [Deprecated since version 0.2.1 - not supported]
     * @name gawebtoolkit.ui.directives:gaSearchWfs
     * @param {object} mapController - Map controller
     * @param {string} resultTemplateUrl -
     * @param {object} searchEndPoints -
     * @param {function} onResults -
     * @param {function} onResultsSelected -
     * @param {function} onPerformSearch -
     * @param {string} primaryWfsProperty -
     * @param {string} searchIconUrl -
     * @param {string} placeHolder -
     * @param {string} activateKey -
     * @description
     * deprecated
     * @scope
     * @restrict E
     * @example
     */
    app.directive('gaSearchWfs', ['$q', '$interpolate', '$log', function ($q, $interpolate, $log) {
        //Using 'result.id' as the result features coming back should have a server id.
        //Specific property names are dynamic and cannot be relied on.
        return {
            restrict: "EA",
            templateUrl: 'src/main/js/ui/components/deprecated/search-wfs.html',
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
})();