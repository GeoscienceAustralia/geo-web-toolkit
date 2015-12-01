var angular = angular || {};
var console = console || {};
var $ = $ || {};
var google = google || {};

angular.module('geowebtoolkit.ui', [ 'geowebtoolkit.ui.directives', 'geowebtoolkit.ui.templates', 'geowebtoolkit.ui.components', 'ui.utils', 'geowebtoolkit.utils' ]);

var app = angular.module('geowebtoolkit.ui.directives', [ 'geowebtoolkit.utils' ]);


/**
 * geoZoomToExtentButton
 * Notes: beforeZoom param 'points' is the underlying implementation object
 **/
app.directive('geoZoomToExtentButton', [ function () {
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
app.directive('geoZoomToCenterPositionAnchor', [ function () {
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
app.directive('geoZoomToLayerButton', [ function () {
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
app.directive('geoToggle', [ function () {
    'use strict';
    var templateCache = '<button type="button" ng-click="toggle()"><div ng-transclude></div></button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: true,
        scope: {
            geoToggleClicked: '&'
        },
        link: function ($scope) {
            $scope.toggle = function () {
                $scope.geoToggleClicked();
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
