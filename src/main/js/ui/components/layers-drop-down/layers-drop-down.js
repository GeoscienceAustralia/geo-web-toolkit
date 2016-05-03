/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('geowebtoolkit.ui.components.layers-drop-down', ['geowebtoolkit.ui.directives', 'ui.utils', 'geowebtoolkit.utils']);

    /**
     * @ngdoc directive
     * @name geowebtoolkit.ui.directives:geoLayersDropDown
     * @description
     * This control displays a select box of layers and on change, notify via event. Used in a
     * restricted group of layers. Used for selecting between a list of mutually exclusive layers.
     * @param {Layer[]} layersData - Layers that the control uses to switch layers
     * @param {string} selectedModel - Id of the layer that is currently selected
     * @param {string} controllerEmitEventName - event name that is fired that passes the controller
     * @param {Function} onSelectedLayerChanged - function that is called when the selected value has changed
     * @param {string} layerGroupId - A discriminator that is passed to events to identify which group of layers
     * @scope
     * @restrict E
     * @example
     */
    app.directive('geoLayersDropDown', [ function () {

        return {
            restrict: "E",
            templateUrl: 'src/main/js/ui/components/layers-drop-down/layers-drop-down.html',
            replace: false,
            scope: {
                layersData: '=',
                selectedModel: '=',
                controllerEmitEventName: '@',
                onSelectedLayerChanged: '&',
                onLayersInitialised: '&',
                layerGroupId: '@',
                includeNone: '@'
            },
            controller: ['$scope', function ($scope) {
                var self = this;
                $scope.selectLayer = function () {
                    $scope.onSelectedLayerChanged({
                        layerId: $scope.selectedModel,
                        groupId: $scope.layerGroupId
                    });
                };
                self.selectLayer = $scope.selectLayer;
                $scope.$emit($scope.controllerEmitEventName, self);

            }],
            link: function ($scope) {
                var hasInitialized = false;
                $scope.$watch('layersData', function (newVal) {
                    if (newVal && !$scope.selectedModel) {
                        if ($scope.includeNone && $scope.layersData[0].id !== '$none$') {
                            $scope.layersData.unshift({
                                id: '$none$',
                                name: 'None'
                            });
                        }

                        $scope.selectedModel = newVal[0].id;
                        $scope.onLayersInitialised({
                            layerId: $scope.selectedModel,
                            groupId: $scope.layerGroupId
                        });

                    }
                });

                $scope.$watch('selectedModel', function (newVal) {
                    if(newVal && hasInitialized) {
                        $scope.selectLayer();
                    }
                    if(newVal && !hasInitialized) {
                        hasInitialized = true;
                    }
                });
            },
            transclude: true
        };
    } ]);
})();