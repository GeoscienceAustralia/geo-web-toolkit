angular.module('gawebtoolkit.ui.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/main/js/ui/components/base-layer-selector/base-layer-selector.html',
    "<select title=\"Base layer selector\" fix-ie-select ng-options=\"layer.id as layer.name for layer in layersData\"\n" +
    "        ng-model=\"selectedBaseLayerId\"></select>\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/dialog-toggle.html',
    "<button type=\"button\" ng-click=\"toggleDialog()\"><div ng-transclude></div></button>"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/layers-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\n" +
    "    <div ng-repeat=\"layer in layersData\">\n" +
    "        <ga-layer-control map-controller=\"mapController\" layer-data=\"layer\"></ga-layer-control>\n" +
    "    </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/search-wfs.html',
    "<input type=\"text\" class=\"search-box\" ng-model=\"query\"\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\" placeholder=\"{{placeHolder}}\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" ng-click=\"searchButtonClicked()\"\n" +
    "       accesskey=\"4\" alt=\"Search using your entered search criteria\"\n" +
    "       title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\">"
  );


  $templateCache.put('src/main/js/ui/components/deprecated/static-dialog.html',
    "<div ui-jq=\"dialog\" ui-options=\"dialogConfig\" id=\"{{dialogId}}\">\n" +
    "    <div ng-transclude></div>\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"Place name search\" ng-model=\"query\"\n" +
    "       ng-class=\"{typeAheadLoading:waitingForResponse}\"\n" +
    "       typeahead=\"result as result.properties.name for result in getSearchResults($viewValue)\"\n" +
    "       typeahead-template-url=\"{{resultTemplateUrl}}\"\n" +
    "       typeahead-on-select=\"onSelected($item, $model, $label)\"\n" +
    "       typeahead-wait-ms=\"200\" typeahead-editable=\"true\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\n" +
    "       ng-click=\"searchButtonClicked()\"\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/google-place-name-search/google-place-name-search.html',
    "<input type=\"text\" class=\"search-box\" placeholder=\"{{placeHolder}}\"/>\n" +
    "<input type=\"image\" class=\"button search-button\" accesskey=\"4\"\n" +
    "       alt=\"Search using your entered search criteria\" title=\"Search using your entered search criteria\"\n" +
    "       src=\"{{searchIconUrl}}\"/>"
  );


  $templateCache.put('src/main/js/ui/components/layer-control/layer-control.html',
    "<label for=\"{{elementId}}\" class=\"checkbox\" style=\"display:inline-block;width:65%\">\n" +
    "    <input id=\"{{elementId}}\" type=\"checkbox\" ng-model=\"layerData.visibility\" ng-click=\"layerClicked()\"\n" +
    "           ng-disabled=\"layerDisabled\"/>{{layerData.name}}\n" +
    "</label>\n" +
    "<div style=\"display:inline;width:30%\" ng-transclude></div>\n" +
    "<div ng-show=\"layerData.visibility\" class=\"gaLayerControlSliderContainer\">\n" +
    "    <ga-layer-opacity-slider\n" +
    "            map-controller=\"mapController\"\n" +
    "            layer-opacity=\"layerData.opacity\"\n" +
    "            layer-id=\"{{layerData.id}}\"\n" +
    "            layer-disabled=\"layerDisabled\"\n" +
    "            on-opacity-change=\"changeOpacity(layerId,opacity)\"\n" +
    "            title-text=\"Opacity control for layer - {{layerData.name}}\">\n" +
    "    </ga-layer-opacity-slider>\n" +
    "</div>\n"
  );


  $templateCache.put('src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html',
    "<button ng-click=\"toggleClicked()\" class=\"gaUiToggleOff\" type=\"button\">\n" +
    "    <div ng-transclude></div>\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/layers-drop-down/layers-drop-down.html',
    "<div>\n" +
    "    <select fix-ie-select ng-model=\"selectedModel\" ng-change=\"selectLayer()\"\n" +
    "            ng-options=\"dropDownLayer.id as dropDownLayer.name for dropDownLayer in layersData\">\n" +
    "    </select>\n" +
    "</div>"
  );


  $templateCache.put('src/main/js/ui/components/measure-toggle/measure-toggle.html',
    "<button type=\"button\" ng-click=\"handleToggle()\" class=\"gaUiToggleOff\">\n" +
    "    <span ng-transclude></span>\n" +
    "</button>"
  );


  $templateCache.put('src/main/js/ui/components/opacity-slider/opacity-slider.html',
    "<div ui-jq=\"slider\" ui-options=\"getSliderOptions()\"></div>"
  );

}]);
