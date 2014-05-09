var angular = angular || {};
var console = console || {};
var $ = $ || {};

angular.module('gawebtoolkit.ui', [ 'gawebtoolkit.ui.directives', 'ui.utils', 'gawebtoolkit.utils' ]);

var app = angular.module('gawebtoolkit.ui.directives', [ 'gawebtoolkit.utils' ]);
/*
 * gaLayerControl
 *
 * A control for turning on/off layers via provided '=mapController' as well as opacity slider
 *
 * $scope
 *   '=mapController'
 *       a controller that has access to the mapInstance object that exposes the same contract as 'ga-map'
 *   '=layerData'
 *       structure expected is a minimum of:
 *       {
 *           id: //unique id of the layer
 *           opacity: //value betweeb 0-100 representing the percentage of opacity of the layer
 *           visibility: //boolean representing if layer is visible
 *           name: //friendly name of the layer
 *       }
 * */
app
      .directive(
            'gaLayerControl',
            [
                  'GAWTUtils',
				  '$timeout',
                  function(GAWTUtils,$timeout) {
                     'use strict';
					  //Use of modernizr and the 'make visible' scope object is to make sure the range polyfill
					  //for browsers that don't support the input[type="range"] control get initialised correctly
					  //This will not effect browsers that support range input.
                     var templateCache = '<input id="{{elementId}}" type="checkbox" ng-model="layerData.visibility" ng-click="layerClicked()"/>' + '<label for="{{elementId}}" ng-bind="layerData.name"></label>'
                           + '<span ng-transclude></span>'
                           + '<div ng-show="layerData.visibility || makeVisible">'
                           + '<input type="range" min="0" max="1.0" step="0.01" ng-model="layerData.opacity" ng-change="changeOpacity()"/>'
                           + '</div>';
                     return {
                        restrict : "E",
                        template : templateCache,
                        scope : {
                           layerData : '=',
                           mapController : '=',
                           onVisible : '&',
                           onHidden : '&',
                           onOpacityChange : '&'
                        },
                        controller : function($scope) {
                           $scope.elementId = GAWTUtils.generateUuid();
                        },
                        link : function($scope, $element, $attrs) {
							if (!Modernizr.inputtypes.range) {
								$scope.makeVisible = true;
							}
                           $scope.changeOpacity = function() {
                              var opacityValue = $scope.layerData.opacity;
                              $scope.mapController.setOpacity($scope.layerData.id, opacityValue);
                              $scope.onOpacityChange({
                                 layerId : $scope.layerData.id,
                                 opacity : opacityValue
                              });
                           };
                           $scope.layerClicked = function() {
                              $scope.layerData.visibility = !$scope.layerData.visibility;
                              if ($scope.layerData.visibility) {
                                 $scope.onVisible({
                                    layerId : $scope.layerData.id
                                 });
                              } else {
                                 $scope.onHidden({
                                    layerId : $scope.layerData.id
                                 });
                              }
                              $scope.mapController.setLayerVisibility($scope.layerData.id, $scope.layerData.visibility);
                           };
							//TODO come up with a better solution for >=IE9.
							//HACK problem with initializing control hidden, width is not computed properly
							//This will make the range bars all appear briefly and then reset back to correct value
							if (!Modernizr.inputtypes.range) {
								console.log('test modz');
								$timeout(function () {
										$scope.makeVisible = $scope.layerData.visibility;
								},1500);
							}
                           //initial application of polyfill.
							$($element[0]).updatePolyfill();
                        },
                        transclude : true
                     };
                  } ]);
/**
 *
 * */
app.directive('gaLayerOpacitySlider', [ function() {
   'use strict';
   var templateCache = '<input type="range"  min="0" max="1.0" step="0.01" ng-model="layerOpacity" ng-change="changeOpacity()"/>';
   return {
      restrict : "E",
      template : templateCache,
      replace : true,
      scope : {
         layerId : '@',
         layerOpacity : '=',
         mapController : '='
      },
      link : function($scope, $element, $attrs) {
         $scope.changeOpacity = function() {
            var opacityValue = $scope.layerOpacity;
            $scope.mapController.setOpacity($scope.layerId, opacityValue);
         };
		  $scope.$watch('layerOpacity', function () {
			  $($element[0]).updatePolyfill();
		  });
         //ensure polyfill for range slider is applied.

      },
      transclude : true
   };
} ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.ui.directives:gaLayersDropDown
 * @param {Layer[]} layersData - Layers that the control uses to switch layers
 * @param {string} selectedModel - Id of the layer that is currently selected
 * @param {string} controllerEmitEventName - event name that is fired that passes the controller
 * @param {Function} onSelectedLayerChanged - function that is called when the selected value has changed
 * @param {string} layerGroupId - A discriminator that is passed to events to identify which group of layers
 * @description
 * This control displays a select box of layers and on change, notify via event. Used in a
 * restricted group of layers. Used for selecting between a list of mutually exclusive layers.
 * @scope
 * @restrict E
 * @example
 */
app
      .directive(
            'gaLayersDropDown',
            [
                  '$timeout',
                  function($timeout) {
                     'use strict';
                     var templateCache = '<div><select fix-ie-select ng-model="selectedModel" ng-change="selectLayer()" ' + 'ng-options="dropDownLayer.id as dropDownLayer.name for dropDownLayer in layersData" >'
                           + '</select>'
                           + '</div>';
                     return {
                        restrict : "E",
                        template : templateCache,
                        replace : false,
                        scope : {
                           layersData : '=',
                           selectedModel : '=',
                           controllerEmitEventName : '@',
                           onSelectedLayerChanged : '&',
                           layerGroupId : '@',
                           includeNone : '@'
                        },
                        controller : function($scope) {
                           var self = this;
                           $scope.selectLayer = function() {
                              $scope.onSelectedLayerChanged({
                                 layerId : $scope.selectedModel,
                                 groupId : $scope.layerGroupId
                              });
                           };
                           self.selectLayer = $scope.selectLayer;
                           $scope.$emit($scope.controllerEmitEventName, self);

                        },
                        link : function($scope, $element, $attrs) {
                           $scope.$watch('layersData', function(newVal, oldVal) {
                              if (newVal && !$scope.selectedModel) {
                                 if ($scope.includeNone && $scope.layersData[0].id !== '$none$') {
                                    $scope.layersData.unshift({
                                       id : '$none$',
                                       name : 'None'
                                    });
                                 }

                                 $scope.selectedModel = newVal[0].id;
                                 $scope.onSelectedLayerChanged({
                                    layerId : $scope.selectedModel,
                                    groupId : $scope.layerGroupId
                                 });
                              }
                           });
                        },
                        transclude : true
                     };
                  } ]);
/**
 * */
app.directive('gaBaseLayersDialog', [ 'GAWTUtils', function(GAWTUtils) {
   'use strict';
   var templateCache = '<div ui-jq="dialog" ui-options="dialogConfig" id="{{dialogId}}">' + '<div ng-repeat="layer in layersData">'
         + '<input type="radio" name="baseLayerSelection" value="{{layer.id}}" '
         + 'ng-model="$parent.selectedLayerId" ng-click="changeBaseLayer()" />'
         + '{{layer.name}}'
         + '</div>'
         + '</div>';
   return {
      restrict : "E",
      template : templateCache,
      scope : {
         layersData : '=',
         dialogConfig : '=',
         mapController : '='
      },
      controller : function($scope) {
         $(window).bind('resize', function() {
            //Reinitialise dialog on window resize, resets position to correct relative location
            //Force last closed state
            $scope.dialogConfig.autoOpen = !$scope.isClosed;
            $('#' + $scope.dialogId).dialog($scope.dialogConfig);
         });
         //Initialise id element to use for cleaning up/closing the dialog
         $scope.dialogId = GAWTUtils.generateUuid();
         $scope.isClosed = !$scope.dialogConfig.autoOpen;
         var self = this;
         self.openDialog = function() {
            $('#' + $scope.dialogId).dialog('open');
            $scope.isClosed = false;
         };
         self.closeDialog = function() {
            $('#' + $scope.dialogId).dialog('close');
            $scope.isClosed = true;
         };
         self.isClosed = function() {
            return $scope.isClosed;
         };

         $scope.$watch('selectedBaseLayerId', function(newVal, oldVal) {
            if (oldVal != null) {
               $scope.mapController.setBaseLayer(newVal);
               /*$scope.mapController.setLayerVisibility(newVal, true);
                $scope.mapController.setLayerVisibility(oldVal, false);*/
            }
         });

         $scope.$watch('layersData', function(newVal, oldVal) {
            if (newVal) {
               for ( var i = 0; i < newVal.length; i++) {
                  if (newVal[i].visibility === true) {
                     $scope.selectedBaseLayerId = newVal[i].id;
                  }
               }
            }
         });

         $scope.$emit('baseLayerDialogReady', self);
      },
      link : function($scope, $element, $attrs) {
         $scope.$on('$destroy', function(event, args) {
            $('#' + $scope.dialogId).dialog('destroy').remove();
         });
         var initialiseSelectedLayer = $scope.$watch('layersData', function(data) {
            if (data) {
               $scope.selectedBaseLayerId = $scope.layersData[0].id;
               initialiseSelectedLayer();
            }
         });
      },
      transclude : true
   };
} ]);
/**
 * @ngdoc directive
 * @name gawebtoolkit.ui.directives:gaBaseLayerSelector
 * @param {Layer[]} layersData - Layers that the control uses to switch base layers
 * @param {object} mapController - controller instance for the map
 * @param {string} controllerEmitEventName - event that is fired that passes the controller
 * @description
 * This control displays a select box of layers and on change, switches base layers between the proivided
 * list.
 * @scope
 * @restrict E
 * @example
 */
app.directive('gaBaseLayerSelector', [ '$timeout', 'GAWTUtils', function($timeout, GAWTUtils) {
   'use strict';
   var templateCache = '<select fix-ie-select ng-options="layer.id as layer.name for layer in layersData" ' + 'ng-model="selectedBaseLayerId"></select>';
   return {
      restrict : "E",
      template : templateCache,
      replace : true,
      scope : {
         layersData : '=',
         mapController : '=',
         controllerEmitEventName : '@'
      },
      controller : function($scope) {
         var self = this;

         self.selectBaseLayer = function(layerId) {
            $scope.selectedBaseLayerId = layerId;
         };

         $scope.$emit($scope.controllerEmitEventName, self);

      },
      link : function($scope, $element, $attrs) {
         $scope.$watch('selectedBaseLayerId', function(newVal, oldVal) {
            if (newVal != null) {
               $scope.mapController.setBaseLayer(newVal);
            }
         });

         $scope.$watch('layersData', function(newVal, oldVal) {
            if (newVal) {
               for ( var i = 0; i < newVal.length; i++) {
                  if ($scope.layersData[i].visibility === true) {
                     setSelectedValue($scope.layersData[i]);
                  }
               }
            }
         });

         //Timeout is used due to problem with $watch only fires of array changes, not objects inside
         var setSelectedValue = function(layer) {
            $timeout(function() {
               $scope.selectedBaseLayerId = layer.id;
            });
         };
      },
      transclude : true
   };
} ]);
/**
 *
 * */
app
      .directive(
            'gaSearchWfsLayer',
            [ function() {
               "use strict";
               return {
                  restrict : "EA",
                  template : '<input type="text" class="search" ng-model="query" value="Place name search"/>' + '<input type="button" class="searchButton" ng-click="searchWfs()" value="search"/>',
                  scope : {
                     layerId : '@',
                     query : '=',
                     attributes : '@',
                     onQuerySearch : '&',
                     onQueryChange : '&',
                     onQueryResults : '&',
                     mapController : '='
                  },
                  link : function($scope, $element, $attrs) {
                     $scope.searchWfs = function() {
                        $scope.onQuerySearch({
                           layerId : $scope.layerId,
                           attributes : $scope.attributes,
                           query : $scope.query
                        });
                     };
                     $scope.$watch('query', function(newVal, oldVal) {
                        $scope.onQueryChange({
                           layerId : $scope.layerId,
                           attributes : $scope.attributes,
                           query : $scope.query
                        });
                     });
                  }
               };
            } ]);
/**
 *
 * */
app.directive('gaSearchWfs', [
      '$q',
      function($q) {
         "use strict";
         return {
            restrict : "EA",
            template : '<input type="text" class="search" ng-model="query" ' + 'typeahead="result.properties.NAME for result in getSearchResults($viewValue)" '
                  + ' typeahead-template-url="{{resultTempalteUrl}}" '
                  + 'typeahead-on-select="onSelected($item, $model, $label)" '
                  + ' typeahead-wait-ms="500" typeahead-editable="true"/>'
                  + '<input type="button" class="searchButton" ng-click="searchButtonClicked()" value="search"/>',
            scope : {
               url : '@',
               featureType : '@',
               featurePrefix : '@',
               version : '@',
               geometryName : '@',
               datumProjection : '@',
               attribute : '@',
               resultTempalteUrl : '@',
               mapController : '=',
               searchEndPoints : '=',
               onResults : '&',
               onResultsSelected : '&',
               onPerformSearch : '&'
            },
            link : function($scope, $element, $attrs) {
               var clients = [];
               var attribute;

               $scope.$watch('searchEndPoints', function(newVal, oldVal) {
                  if (newVal) {
                     clients = [];
                     for ( var i = 0; i < $scope.searchEndPoints.length; i++) {
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
                  var wfsClient = $scope.mapController.createWfsClient($scope.url, $scope.featureType, $scope.featurePrefix, $scope.version,
                        $scope.geometryName, $scope.datumProjection);

                  clients.push($scope.mapController.addWfsClient(wfsClient));
               }

               var searchFunction = function(query) {
                  $scope.searchResults = [];
                  var deferred = $q.defer();
                  var count = 0;
                  var allResults = [];

                  for ( var i = 0; i < clients.length; i++) {
                     var currentClient = clients[i];
                     $scope.mapController.searchWfs(clients[i].clientId, query, attribute).then(function(data) {

                        if (data == null) {
                           //error
                           deferred.resolve(null);
                           return;
                        }
                        count++;

                        for ( var j = 0; j < data.features.length; j++) {
                           data.features[j].endPointId = currentClient.endPointId;
                           allResults.push(data.features[j]);
                        }

                        if (count == clients.length) {
                           deferred.resolve(allResults);
                        }
                     });
                  }
                  return deferred.promise;
               };

               $scope.getSearchResults = function(query) {
                  if (query != null && query.length >= 3) {
                     return searchFunction(query).then(function(data) {
                        $scope.onResults({
                           data : data
                        });
                        return data;
                     });
                  } else {
                     return [];
                  }
               };

               $scope.onSelected = function($item, $model, $label) {
                  $scope.onResultsSelected({
                     item : $item
                  });
               };

               $scope.searchButtonClicked = function() {
                  if ($scope.query != null) {
                     return searchFunction($scope.query).then(function(data) {
                        $scope.onPerformSearch({
                           data : data
                        });
                        return data;
                     });
                  }
               };
            }
         };
      } ]);
/**
 *
 * */
app.directive('gaMeasureToggle', [ function() {
   "use strict";
   return {
      restrict : "EA",
      template : '<button type="button" ng-click="handleToggle()"><div ng-transclude></div></button> ',
      scope : {
         resolveStyle : '&',
         toggleOnCallback : '&',
         toggleOffCallback : '&',
         onFinish : '&',
         onUpdate : '&',
         mapControlId : '@',
         controllerEmitEventName : '@',
         mapController : '='
      },
      controller : function($scope) {
         var self = this;

         self.activate = function() {
            $scope.activate();
         };
         self.deactivate = function() {
            $scope.deactivate();
         };
         self.isToggleActive = function() {
            return $scope.mapController.isControlActive($scope.mapControlId);
         };
         $scope.$emit($scope.controllerEmitEventName, self);
      },
      link : function($scope, $element, $attrs) {
         $scope.handleMeasurements = function(event) {
            var measurement = $scope.mapController.getMeasureFromEvent(event);
            $scope.onFinish({
               event : measurement
            });
         };
         $scope.handlePartialMeasure = function(event) {
            console.log(event);
            var measurement = $scope.mapController.getMeasureFromEvent(event);
            $scope.onUpdate({
               event : measurement
            });
         };
         $scope.activate = function() {
            $scope.mapController.activateControl($scope.mapControlId);
            $scope.mapController.registerControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
            $scope.mapController.registerControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
            $scope.toggleOnCallback();
         };
         $scope.deactivate = function() {
            $scope.mapController.deactivateControl($scope.mapControlId);
            $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
            $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure);
            $scope.toggleOffCallback();
         };
         $scope.handleToggle = function() {
            if ($scope.mapController.isControlActive($scope.mapControlId)) {
               $scope.deactivate();
            } else {
               $scope.activate();
            }
         };

         $scope.$on('$destroy', function() {
            $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements);
            $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handleMeasurements);
         });
      },
      transclude : true,
      replace : true
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
app.directive('gaLayersDialog', [ 'GAWTUtils', function(GAWTUtils) {
   'use strict';
   var templateCache = '<div ui-jq="dialog" ui-options="dialogConfig" id="{{dialogId}}">' + '<div ng-repeat="layer in layersData">'
         + '<ga-layer-control map-controller="mapController" layer-data="layer"></ga-layer-control>'
         + '</div>'
         + '</div>';
   return {
      restrict : "E",
      template : templateCache,
      scope : {
         layersData : '=',
         dialogConfig : '=',
         mapController : '='
      },
      controller : function($scope) {
         $(window).bind('resize', function() {
            //Reinitialise dialog on window resize, resets position to correct relative location
            //Force last closed state
            $scope.dialogConfig.autoOpen = !$scope.isClosed;
            $('#' + $scope.dialogId).dialog($scope.dialogConfig);
         });
         //Initialise id element to use for cleaning up/closing the dialog
         $scope.dialogId = GAWTUtils.generateUuid();

         $scope.isClosed = !$scope.dialogConfig.autoOpen;
         var self = this;
         self.openDialog = function() {
            $('#' + $scope.dialogId).dialog('open');
            $scope.isClosed = false;
         };
         self.closeDialog = function() {
            $('#' + $scope.dialogId).dialog('close');
            $scope.isClosed = true;
         };
         self.isClosed = function() {
            return $scope.isClosed;
         };
         $scope.$emit('layersDialogReady', self);
      },
      link : function($scope, $element, $attrs) {
         $scope.filterBaseLayers = function(layer) {
            var layerIsBaseLayer = $scope.mapController.isBaseLayer(layer.id);
            return !layerIsBaseLayer;
         };
         $scope.$on('$destroy', function(event, args) {
            $('#' + $scope.dialogId).dialog('destroy').remove();
         });
         $scope.$watch($attrs.uiRefresh, function(data) {
            $('#' + $scope.dialogId).bind('dialogclose', function(event, ui) {
               $scope.isClosed = !$scope.isClosed;
            });
         });
      },
      transclude : true
   };
} ]);
/**
 *
 * */
app.directive('gaStaticDialog', [ '$timeout', 'GAWTUtils', function($timeout, GAWTUtils) {
   'use strict';
   var templateCache = '<div ui-jq="dialog" ui-options="dialogConfig" id="{{dialogId}}">' + '<div ng-transclude></div>'
         + '</div>';
   return {
      restrict : "AE",
      template : templateCache,
      scope : {
         controllerEmitEventName : '@',
         dialogConfig : '=',
         dialogWindowResize : '&',
         dialogClosed : '&',
         dialogOpened : '&'
      },
      controller : function($scope) {
         $(window).bind('resize', function() {
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
         self.openDialog = function() {
            $('#' + $scope.dialogId).dialog('open');
            $scope.isClosed = false;
            $scope.dialogOpened();
         };
         self.closeDialog = function() {
            $('#' + $scope.dialogId).dialog('close');
            $scope.isClosed = true;
            $scope.dialogClosed();
         };
         self.isClosed = function() {
            return $scope.isClosed;
         };
         $scope.$emit($scope.controllerEmitEventName, self);
      },
      link : function($scope, $element, $attrs) {
         $scope.$on('$destroy', function(event, args) {
            $('#' + $scope.dialogId).dialog('destroy').remove();
         });

         var dialogConfigWatch = $scope.$watch('dialogConfig', function(data) {
            if (data != null) {
               $scope.dialogReady = true;
               $('#' + $scope.dialogId).bind('dialogclose', function(event) {
                  $scope.isClosed = true;
                  $timeout(function() {
                     $scope.$apply();
                  });
                  $scope.dialogClosed();
               });
               $scope.isClosed = !data.autoOpen;
               dialogConfigWatch();
            }
         });

      },
      transclude : true
   };
} ]);
/**
 * */
app.directive('gaDialogToggle', [ function() {
   'use strict';
   var templateCache = '<button type="button" ng-click="toggleDialog()"><div ng-transclude></div></button>';
   return {
      restrict : "E",
      replace : "true",
      template : templateCache,
      transclude : true,
      scope : {
         gaDialogController : '=',
         gaToggleClicked : '&'
      },
      link : function($scope, $element, $attrs) {
         /*var observable = false;
          $attrs.$observe('gaBindDialogOpen', function(val) {
          observable = true;
          if(val == true) {
          $scope.gaDialogController.openDialog();
          } else {
          $scope.gaDialogController.closeDialog();
          }
          });*/
         $scope.toggleDialog = function() {
            var dialogOpen = !$scope.gaDialogController.isClosed();
            if (!dialogOpen) {
               $scope.gaDialogController.openDialog();
            } else {
               $scope.gaDialogController.closeDialog();
            }
            $scope.gaToggleClicked({
               dialogController : $scope.gaDialogController
            });
         };
      }
   };
} ]);
app.directive('gaLayerInteractionToggle', [ function() {
   'use strict';
   var templateCache = '<button ng-click="toggleClicked()" class="gaUiToggleOff" type="button">' + '<div ng-transclude></div>'
         + '</button>';
   return {
      restrict : "E",
      replace : "true",
      template : templateCache,
      transclude : true,
      scope : {
         toggleIconSource : '@',
         controllerEmitEventName : '@',
         toggleOnCallback : '&',
         toggleOffCallback : '&',
         onLayerClickCallback : '&',
         mapController : '=',
         layerInteractionId : '='
      },
      controller : function($scope) {
         var self = this;

         self.activate = function() {
            $scope.activate();
         };
         self.deactivate = function() {
            $scope.deactivate();
         };
         self.isToggleActive = function() {
            return $scope.isToggleOn;
         };

         $scope.$emit($scope.controllerEmitEventName, self);
      },
      link : function($scope, $element, $attrs) {
         $scope.isToggleOn = false;

         $scope.activate = function() {
            $scope.mapController.registerMapClick(callback);
            $element.removeClass('gaUiToggleOff');
            $element.addClass('gaUiToggleOn');
            $scope.isToggleOn = true;
            $scope.toggleOnCallback();

         };
         $scope.deactivate = function() {
            $scope.mapController.unRegisterMapClick(callback);
            $element.removeClass('gaUiToggleOn');
            $element.addClass('gaUiToggleOff');
            $scope.isToggleOn = false;
            $scope.toggleOffCallback();
         };
         $scope.toggleClicked = function() {
            $scope.isToggleOn = !$scope.isToggleOn;
            if ($scope.isToggleOn) {
               $scope.activate();
            } else {
               $scope.deactivate();
            }
         };

         var callback = function(e) {
            var xyPoint = $scope.mapController.getPointFromEvent(e);
            $scope.onLayerClickCallback({
               point : xyPoint,
               interactionId : $scope.layerInteractionId
            });
         };
      }
   };
} ]);
/**
 * gaZoomToExtentButton
 * Notes: beforeZoom param 'points' is the underlying implementation object
 **/
app.directive('gaZoomToExtentButton', [ function() {
   "use strict";
   return {
      restrict : 'E',
      template : '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
      scope : {
         extentPoints : '=',
         mapController : '=',
         beforeZoom : '&'
      },
      link : function($scope, $element, $attrs) {
         $scope.zoomTo = function() {
            var bounds = $scope.mapController.createBounds($scope.extentPoints);
            $scope.beforeZoom({
               points : bounds
            });
            $scope.mapController.zoomToExtent(bounds);
         };
      },
      transclude : true
   };
} ]);
/**
 * */
app.directive('gaZoomToCenterPositionAnchor', [ function() {
   "use strict";
   return {
      restrict : 'E',
      template : '<a ng-click="zoomTo()"><div ng-transclude></div></a>',
      scope : {
         geoJsonCoord : '=',
         projection : '@',
         mapController : '=',
         zoomLevel : '@'
      },
      link : function($scope, $element, $attrs) {
         $scope.zoomTo = function() {
            $scope.mapController.setCenter($scope.geoJsonCoord[1], $scope.geoJsonCoord[0], $scope.projection);
            $scope.mapController.zoomTo($scope.zoomLevel);
         };
      },
      transclude : true
   };
} ]);
/**
 *
 * */
app.directive('gaZoomToLayerButton', [ function() {
   "use strict";
   return {
      restrict : 'E',
      template : '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
      scope : {
         layerId : '@',
         mapController : '=',
         beforeZoom : '&'
      },
      link : function($scope, $element, $attrs) {
         $scope.zoomTo = function() {
            $scope.mapController.zoomToLayer($scope.layerId);
         };
      },
      transclude : true
   };
} ]);
/**
 * */
app.directive('gaToggle', [ function() {
   'use strict';
   var templateCache = '<button type="button" ng-click="toggle()"><div ng-transclude></div></button>';
   return {
      restrict : "E",
      replace : "true",
      template : templateCache,
      transclude : true,
      scope : {
         gaToggleClicked : '&'
      },
      link : function($scope, $element, $attrs) {
         $scope.toggle = function() {
            $scope.gaToggleClicked();
         };
      }
   };
} ]);
/*
 * Work around from suggestion in angularjs issues on github
 * https://github.com/angular/angular.js/issues/2809
 * Modified with timeout to avoid digestion cycle problems with data
 * */
app.directive('fixIeSelect', function() {
   "use strict";
   return {
      restrict : 'A',
      controller : [ '$scope', '$element', '$timeout', function($scope, $element, $timeout) {
         $scope.$watch('options', function() {
            var $option = $('<option>');
            // for some reason, it needs both, getting the width and changing CSS options to rerender select
            $element.css('width');
            $element.addClass('repaint').removeClass('repaint');

            // add and remove option to rerender options
            $option.appendTo($element).remove();
            $timeout(function() {
               $element.css('width', 'auto');
            });
			 $option = null;
            //$element.css('width','auto');
         });
      } ]
   };
});
