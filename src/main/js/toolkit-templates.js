angular.module('gawebtoolkit.ui.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/main/js/ui/components/base-layer-selector/base-layer-selector.html',
    "<select title=\"Base layer selector\" fix-ie-select ng-options=\"layer.id as layer.name for layer in layersData\"\r" +
    "\n" +
    "        ng-model=\"selectedBaseLayerId\"></select>\r" +
    "\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/dialog-toggle.html',
    "<button type=\"button\" ng-click=\"toggleDialog()\"><div ng-transclude></div></button>"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/layers-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\r" +
    "\n" +
    "    <div ng-repeat=\"layer in layersData\">\r" +
    "\n" +
    "        <ga-layer-control map-controller=\"mapController\" layer-data=\"layer\"></ga-layer-control>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/search-wfs.html',
    "<input type=\"text\" class=\"search-box\" ng-model=\"query\"\r" +
    "\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\" placeholder=\"{{placeHolder}}\"/>\r" +
    "\n" +
    "<input type=\"image\" class=\"button search-button\" ng-click=\"searchButtonClicked()\"\r" +
    "\n" +
    "       accesskey=\"4\" alt=\"Search using your entered search criteria\"\r" +
    "\n" +
    "       title=\"Search using your entered search criteria\"\r" +
    "\n" +
    "       src=\"{{searchIconUrl}}\">"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/static-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\r" +
    "\n" +
    "    <div ng-transclude></div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"Place name search\" ng-model=\"query\"\r" +
    "\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\"\r" +
    "\n" +
    "       uib-typeahead=\"result as result.properties.name for result in getSearchResults($viewValue)\"\r" +
    "\n" +
    "       typeahead-template-url=\"{{resultTemplateUrl}}\"\r" +
    "\n" +
    "       typeahead-on-select=\"onSelected($item, $model, $label)\"\r" +
    "\n" +
    "       typeahead-wait-ms=\"200\" typeahead-editable=\"true\"/>\r" +
    "\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\r" +
    "\n" +
    "       ng-click=\"searchButtonClicked()\"\r" +
    "\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\r" +
    "\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/google-place-name-search/google-place-name-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"{{placeHolder}}\"/>\r" +
    "\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\r" +
    "\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\r" +
    "\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/layer-control/layer-control.html',
    "<label for=\"{{elementId}}\" class=\"checkbox gaLayerControlLabel\">\r" +
    "\n" +
    "    <input id=\"{{elementId}}\" type=\"checkbox\" ng-model=\"layerData.visibility\" ng-click=\"layerClicked()\"\r" +
    "\n" +
    "           ng-disabled=\"layerDisabled\"/>{{layerData.name}}\r" +
    "\n" +
    "</label>\r" +
    "\n" +
    "<div class=\"gaLayerControlTransclude\" ng-transclude></div>\r" +
    "\n" +
    "<div ng-show=\"layerData.visibility\" class=\"gaLayerControlSliderContainer\">\r" +
    "\n" +
    "    <ga-layer-opacity-slider\r" +
    "\n" +
    "            map-controller=\"mapController\"\r" +
    "\n" +
    "            layer-opacity=\"layerData.opacity\"\r" +
    "\n" +
    "            layer-id=\"{{layerData.id}}\"\r" +
    "\n" +
    "            layer-disabled=\"layerDisabled\"\r" +
    "\n" +
    "            on-opacity-change=\"changeOpacity(layerId,opacity)\"\r" +
    "\n" +
    "            title-text=\"Opacity control for layer - {{layerData.name}}\">\r" +
    "\n" +
    "    </ga-layer-opacity-slider>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html',
    "<button ng-click=\"toggleClicked()\" class=\"gaUiToggleOff\" type=\"button\">\r" +
    "\n" +
    "    <div ng-transclude></div>\r" +
    "\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/layers-drop-down/layers-drop-down.html',
    "<div>\r" +
    "\n" +
    "    <select fix-ie-select ng-model=\"selectedModel\" ng-change=\"selectLayer()\"\r" +
    "\n" +
    "            ng-options=\"dropDownLayer.id as dropDownLayer.name for dropDownLayer in layersData\">\r" +
    "\n" +
    "    </select>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/measure-toggle/measure-toggle.html',
    "<button type=\"button\" ng-click=\"handleToggle()\" class=\"gaUiToggleOff\">\r" +
    "\n" +
    "    <span ng-transclude></span>\r" +
    "\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/opacity-slider/opacity-slider.html',
    "<div ui-jq=\"slider\" ui-options=\"getSliderOptions()\"></div>"
  );

}]);
