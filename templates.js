angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/main/js/ui/components/layer-control/layer-control.html',
    "<script type=\"text/ng-template\" src=\"\">\r" +
    "\n" +
    "    <label for=\"{{elementId}}\" class=\"checkbox\" style=\"display:inline-block;width:65%\">\r" +
    "\n" +
    "        <input id=\"{{elementId}}\" type=\"checkbox\" ng-model=\"layerData.visibility\" ng-click=\"layerClicked()\" ng-disabled=\"layerDisabled\"/>{{layerData.name}}\r" +
    "\n" +
    "    </label>\r" +
    "\n" +
    "    <div style=\"display:inline;width:30%\" ng-transclude></div>\r" +
    "\n" +
    "    <div ng-show=\"layerData.visibility\" class=\"gaLayerControlSliderContainer\">\r" +
    "\n" +
    "        <ga-layer-opacity-slider\r" +
    "\n" +
    "                map-controller=\"mapController\"\r" +
    "\n" +
    "                layer-opacity=\"layerData.opacity\"\r" +
    "\n" +
    "                layer-id=\"{{layerData.id}}\"\r" +
    "\n" +
    "                layer-disabled=\"layerDisabled\"\r" +
    "\n" +
    "                on-opacity-change=\"changeOpacity(layerId,opacity)\"\r" +
    "\n" +
    "                title-text=\"Opacity control for layer - {{layerData.name}}\" >\r" +
    "\n" +
    "        </ga-layer-opacity-slider>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</script>"
  );


  $templateCache.put('src/main/js/ui/components/opacity-slider/opacity-slider.html',
    "<script type=\"text/ng-template\" src=\"geo-web-toolkit/components/opacity-slider.html\">\r" +
    "\n" +
    "    <div ui-jq=\"slider\" ui-options=\"getSliderOptions()\"></div>\r" +
    "\n" +
    "</script>"
  );

}]);
