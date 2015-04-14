/* global angular, $ */

(function () {
    "use strict";
    var app = angular.module('gawebtoolkit.ui.components.measure-toggle', ['gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils']);
    /**
     *
     * */
    app.directive('gaMeasureToggle', [function () {

        return {
            restrict: "EA",
            templateUrl: 'src/main/js/ui/components/measure-toggle/measure-toggle.html',
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
            replace: "true"
        };
    } ]);
})();