var angular = angular || {}, jQuery = jQuery || {}, console = console || {}, app = angular.module("geowebtoolkit.config", []);

app.directive("geoMapConfig", [ "$compile", "$http", "$q", "$interpolate", "$timeout", "$parse", "$log", function($compile, $http, $q, $interpolate, $timeout, $parse, $log) {
    "use strict";
    return {
        restrict: "E",
        scope: !0,
        controller: [ "$scope", "$element", "$attrs", function($scope, $element, $attrs) {
            $scope.loadConfigData = function() {
                var configPath;
                null != $attrs.configValue && ($scope.configLocal = !0), null != $attrs.localStorageKey && ($scope.fromLocalStorage = !0, 
                $scope.localStorageKey = $attrs.localStorageKey), configPath = null != $attrs.geoConfigPath && -1 !== $attrs.geoConfigPath.indexOf("{{") ? $scope.$eval($interpolate($attrs.geoConfigPath)) : $attrs.geoConfigPath, 
                "true" === $attrs.staticConfig && (configPath += ".json");
                var processSuccessResponse = function(data) {
                    if ($log.info("config http request success"), data && $log.info("config http request data present"), 
                    $attrs.preConfig) {
                        var preConfigAssignmentFn = $parse($attrs.preConfig);
                        $scope.geoConfigTemp = preConfigAssignmentFn($scope, {
                            config: data
                        });
                    } else $scope.geoConfigTemp = data;
                    if ($scope.$emit("configDataLoaded", $scope.geoConfigTemp), $scope.$broadcast("configDataLoaded", $scope.geoConfigTemp), 
                    $attrs.postConfig) {
                        var postConfigAssignmentFn = $parse($attrs.postConfig);
                        postConfigAssignmentFn($scope, {
                            config: $scope.geoConfigTemp
                        });
                    }
                };
                $log.info("config loading...");
                var processErrorResponse = function(data, status) {
                    $log.error("Failed to load config - " + status);
                };
                null != configPath && configPath.length > 0 && $http({
                    method: "GET",
                    url: configPath
                }).success(processSuccessResponse).error(processErrorResponse), $scope.configLocal && $timeout(function() {
                    processSuccessResponse($scope.$eval($attrs.configValue));
                }, 1e3), $scope.fromLocalStorage && ($log.info("Loading config from local storage..."), 
                $timeout(function() {
                    var data = window.localStorage.getItem($scope.localStorageKey);
                    processSuccessResponse(angular.copy(JSON.parse(data)));
                }, 1e3));
            };
        } ],
        compile: function(element, attributes) {
            var linkMethodPromise, linkMethod;
            if (null != attributes.templatePath) {
                var deferred = $q.defer();
                $http.get(attributes.templatePath).success(function(response) {
                    linkMethod = $compile(response), deferred.resolve(linkMethod);
                }), linkMethodPromise = deferred.promise;
            }
            return {
                post: function() {},
                pre: function(scope, element) {
                    linkMethodPromise.then(function(result) {
                        element.html(result(scope)), scope.loadConfigData();
                    });
                }
            };
        }
    };
} ]);

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, app = angular.module("geowebtoolkit.core.control-directives", [ "geowebtoolkit.core.map-directives", "geowebtoolkit.core.map-services", "geowebtoolkit.core.layer-services" ]);

app.directive("geoMapControl", [ function() {
    "use strict";
    return {
        restrict: "E",
        require: "^geoMap",
        scope: {
            mapControlName: "@",
            mapControlId: "@",
            controlOptions: "=",
            containerElementId: "@",
            preOptionsLoaded: "&",
            controlEnabled: "@"
        },
        link: function(scope, element, attrs, mapController) {
            if (scope.mapControlName) {
                var modifiedControlOptions = scope.preOptionsLoaded({
                    options: scope.controlOptions
                });
                scope.controlOptions = void 0 === modifiedControlOptions ? scope.controlOptions : modifiedControlOptions, 
                scope.controlDto = mapController.addControl(scope.mapControlName, scope.controlOptions, scope.containerElementId, scope.mapControlId), 
                null != attrs.controlEnabled && attrs.$observe("controlEnabled", function() {
                    "true" === scope.controlEnabled ? mapController.activateControl(scope.controlDto.id) : mapController.deactivateControl(scope.controlDto.id);
                });
            }
        }
    };
} ]);

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, jQuery = jQuery || {};

angular.module("geowebtoolkit.core", [ "geowebtoolkit.mapservices", "geowebtoolkit.core.map-directives", "geowebtoolkit.core.map-services", "geowebtoolkit.core.layer-directives", "geowebtoolkit.vendor-layers", "geowebtoolkit.core.layer-services", "geowebtoolkit.core.data-services", "geowebtoolkit.core.control-directives", "geowebtoolkit.core.feature-directives", "geowebtoolkit.core.marker-directives", "geowebtoolkit.core.map-config", "geowebtoolkit.utils" ]), 
function() {
    var app = angular.module("geowebtoolkit.core.data-services", [ "geowebtoolkit.mapservices", "geowebtoolkit.core.map-config" ]);
    app.service("GeoDataService", [ "$log", "geoConfig", "dataServiceLocator", function($log, geoConfig, dataServiceLocator) {
        "use strict";
        var defaultFramework = "olv2";
        return {
            getLayersByWMSCapabilities: function(url, version) {
                var useVersion = version || defaultFramework, service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(url);
            },
            getWMSFeatures: function(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, version) {
                var useVersion = version || defaultFramework, service = dataServiceLocator.getImplementation(useVersion);
                return service.getWMSFeatures(mapInstance, url, layerNames, wmsVersion, pointEvent, contentType);
            },
            getWMSFeaturesByLayerId: function(mapInstance, url, layerId, point, version) {
                var useVersion = version || defaultFramework, service = dataServiceLocator.getImplementation(useVersion);
                return service.getLayersByWMSCapabilities(mapInstance, url, layerId, point);
            }
        };
    } ]), app.service("dataServiceLocator", [ "$injector", function($injector) {
        "use strict";
        var implementations = {
            olv2: "olv2DataService",
            olv3: "olv3DataService"
        };
        return {
            getImplementation: function(mapType) {
                return $injector.get(implementations[mapType]);
            }
        };
    } ]);
}();

var angular = angular || {}, app = angular.module("geowebtoolkit.core.feature-directives", [ "geowebtoolkit.core.map-directives", "geowebtoolkit.core.map-services", "geowebtoolkit.core.layer-services" ]);

app.directive("geoFeatureLayer", [ "$timeout", "$compile", "$q", "GeoLayerService", "$log", "GeoUtils", function($timeout, $compile, $q, GeoLayerService, $log) {
    "use strict";
    return {
        restrict: "E",
        require: "^geoMap",
        scope: {
            url: "@",
            layerName: "@",
            visibility: "@",
            projection: "@",
            controllerEmitEventName: "@",
            refreshLayer: "@",
            style: "@",
            postAddLayer: "&",
            onLayerDestroy: "&"
        },
        controller: [ "$scope", function($scope) {
            $scope.layerControllerIsReady = !1, $scope.geoFeatures = [], $scope.featurePromises = [];
            var self = this;
            self.hide = function() {
                return $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, !1), self;
            }, self.show = function() {
                return $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, !0), self;
            }, self.setOpacity = function(opacity) {
                return $scope.mapAPI.mapController.setOpacity($scope.layerDto.id, opacity), self;
            }, self.getFeatures = function() {
                return $scope.mapAPI.mapController.getLayerFeatures($scope.layerDto.id);
            }, self.addFeature = function(feature) {
                if ($scope.style) {
                    var directiveStyle;
                    try {
                        directiveStyle = JSON.parse($scope.style);
                    } catch (e) {
                        throw new Error("Failed to parse style");
                    }
                    GeoLayerService.setFeatureStyle(feature, directiveStyle, $scope.mapAPI.mapController.getFrameworkVersion());
                }
                if (null !== feature.then && "function" == typeof feature.then) return $scope.layerControllerIsReady ? feature.then(function(resultFeature) {
                    $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, resultFeature);
                }) : $scope.featurePromises.push(feature), feature;
                var deferred = $q.defer();
                if ($scope.layerControllerIsReady) {
                    var featureDto = $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, feature);
                    resolveSyncFeature(deferred, featureDto);
                } else $scope.featurePromises.push(deferred.promise), resolveSyncFeature(deferred, feature);
                return deferred.promise;
            };
            var resolveSyncFeature = function(deferred, feature) {
                $timeout(function() {
                    deferred.resolve(feature);
                });
            };
            return self.createFeatureAsync = function(geoJsonFeature, isLonLatOrderValid) {
                var deferred = $q.defer();
                return $scope.geoFeatures.push({
                    deferred: deferred,
                    feature: geoJsonFeature,
                    isLonLatOrderValid: isLonLatOrderValid
                }), deferred.promise;
            }, self.createFeature = function(geoJsonFeature) {
                return $scope.mapAPI.mapController.createFeature(geoJsonFeature);
            }, self.removeFeature = function(featureId) {
                $scope.mapAPI.mapController.removeFeatureFromLayer($scope.layerDto.id, featureId);
            }, self.isLayerControllerReady = function() {
                return $scope.layerControllerIsReady;
            }, self.clearFeatures = function() {
                GeoLayerService.clearFeatureLayer($scope.mapAPI.mapController.getMapInstance(), $scope.layerDto.id, $scope.mapAPI.mapController.getFrameworkVersion());
            }, $scope.controllerEmitEventName && $scope.$emit($scope.controllerEmitEventName, self), 
            self;
        } ],
        transclude: !1,
        link: function($scope, element, attrs, mapController) {
            function reconstructLayer() {
                $log.info("reconstructing layer...");
                for (var allLAyers = mapController.getLayers(), layerIndex = null, i = 0; i < allLAyers.length; i++) if (allLAyers[i].id === $scope.layerDto.id) {
                    layerIndex = i;
                    break;
                }
                if (null != layerIndex) {
                    mapController.removeLayerById($scope.layerDto.id), $scope.layerDto = null;
                    var layerOptions = GeoLayerService.defaultLayerOptions(attrs, mapController.getFrameworkVersion());
                    layerOptions.datumProjection = $scope.projection || mapController.getProjection(), 
                    layerOptions.postAddLayer = $scope.postAddLayer;
                    var layer = GeoLayerService.createFeatureLayer(layerOptions, mapController.getFrameworkVersion());
                    mapController.addLayer(layer).then(function(layerDto) {
                        if ($scope.layerDto = layerDto, addLayerCallback(), null != $scope.layerDto) {
                            var delta = layerIndex - mapController.getLayers().length + 1;
                            mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                        }
                        $q.all($scope.featurePromises).then(function(allFeatures) {
                            for (var i = 0; i < allFeatures.length; i++) {
                                var feature = allFeatures[i];
                                mapController.addFeatureToLayer($scope.layerDto.id, feature);
                            }
                        });
                    });
                }
            }
            attrs.$observe("refreshLayer", function(newVal, oldVal) {
                newVal !== oldVal && ($log.info("refresh for - " + $scope.layerName), $scope.initialiseLayer());
            }), $scope.mapAPI = {}, $scope.mapAPI.mapController = mapController;
            var addLayerCallback = function() {
                $scope.layerReady = !0;
            }, constructLayer = function() {
                $scope.constructionInProgress = !0;
                var layerOptions = GeoLayerService.defaultLayerOptions(attrs, mapController.getFrameworkVersion());
                layerOptions.datumProjection = $scope.projection || mapController.getProjection(), 
                layerOptions.postAddLayer = $scope.postAddLayer, $log.info(layerOptions.layerName + " - constructing...");
                var layer = GeoLayerService.createFeatureLayer(layerOptions, mapController.getFrameworkVersion());
                mapController.addLayer(layer).then(function(layerDto) {
                    $scope.layerDto = layerDto, $scope.layerControllerIsReady = !0, $q.all($scope.featurePromises).then(function(allFeatures) {
                        for (var i = 0; i < allFeatures.length; i++) {
                            var feature = allFeatures[i];
                            mapController.addFeatureToLayer($scope.layerDto.id, feature);
                        }
                    });
                });
            };
            attrs.$observe("visibility", function() {
                $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setLayerVisibility($scope.layerDto.id, "true" === $scope.visibility);
            }), attrs.$observe("opacity", function() {
                $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setOpacity($scope.layerDto.id, $scope.opacity);
            }), $scope.initCount = 0, $scope.initialiseLayer = function() {
                $log.info("initialising layer..."), null != $scope.layerDto ? reconstructLayer() : $scope.layerReady && $scope.constructionInProgress ? $log.info("...") : constructLayer();
            }, $scope.$on("$destroy", function() {
                null != $scope.layerDto.id && $scope.onLayerDestroy({
                    map: mapController.getMapInstance()
                }), $timeout(function() {
                    GeoLayerService.cleanupLayer(mapController.getMapInstance(), $scope.layerDto.id);
                });
            }), attrs.$observe("visibility", function(newVal) {
                null != $scope.layerDto && mapController.setLayerVisibility($scope.layerDto.id, newVal);
            }), null == attrs.refreshLayer && $scope.initialiseLayer();
        }
    };
} ]), app.directive("geoFeature", [ function() {
    "use strict";
    return {
        restrict: "E",
        require: "^geoFeatureLayer",
        scope: {
            visibility: "@",
            geoJsonFeature: "=",
            inputFormat: "@",
            isLonLatOrderValid: "@"
        },
        transclude: !1,
        link: function($scope, element, attrs, featureLayerController) {
            var initialCreate = !0, createFeature = function(newVal, oldVal) {
                if (!newVal && oldVal && featureLayerController.removeFeature($scope.featureDto.id), 
                newVal && newVal !== oldVal) {
                    null != $scope.featureDto && $scope.featureDto.id.length > 0 && featureLayerController.removeFeature($scope.featureDto.id), 
                    initialCreate = !1;
                    var feature = featureLayerController.createFeature($scope.geoJsonFeature);
                    featureLayerController.addFeature(feature).then(function(resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }
                if (newVal && initialCreate) {
                    var initialFeature = featureLayerController.createFeature($scope.geoJsonFeature);
                    initialCreate = !1, featureLayerController.addFeature(initialFeature).then(function(resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }
            };
            $scope.$on("$destroy", function() {
                null != $scope.featureDto && featureLayerController.removeFeature($scope.featureDto.id), 
                null != $scope.geoJsonFeatureWatch && $scope.geoJsonFeatureWatch();
            }), $scope.geoJsonFeatureWatch = $scope.$watch("geoJsonFeature", createFeature);
        }
    };
} ]);

var angular = angular || {}, $ = $ || {}, app = angular.module("geowebtoolkit.core.layer-directives", [ "geowebtoolkit.core.map-directives", "geowebtoolkit.core.layer-services", "geowebtoolkit.core.map-services" ]);

app.directive("geoMapLayer", [ "$timeout", "$compile", "GeoLayerService", "$log", function($timeout, $compile, GeoLayerService, $log) {
    "use strict";
    return {
        restrict: "E",
        require: "^geoMap",
        scope: {
            layerAttribution: "@",
            layerName: "@",
            layerUrl: "@",
            layers: "@",
            layerType: "@",
            wrapDateLine: "@",
            visibility: "@",
            isBaseLayer: "@",
            opacity: "@",
            controllerEmitEventName: "@",
            refreshLayer: "@",
            maxZoomLevel: "@",
            minZoomLevel: "@",
            onError: "&",
            format: "@"
        },
        transclude: !1,
        controller: [ "$scope", function($scope) {
            var self = this;
            return self.hide = function() {
                return $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, !1), self;
            }, self.show = function() {
                return $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, !0), self;
            }, self.setOpacity = function(opacity) {
                return $scope.mapAPI.mapController.setOpacity($scope.layerDto.id, opacity), self;
            }, $scope.controllerEmitEventName && $scope.$emit($scope.controllerEmitEventName, self), 
            self;
        } ],
        link: function($scope, element, attrs, mapController) {
            function initialiseDefaults() {
                null == attrs.layers && (attrs.layers = "0"), null == attrs.wrapDateLine && (attrs.wrapDateLine = !0), 
                null == attrs.visibility && (attrs.visibility = !0), (null == attrs.layerType || 0 === attrs.layerType.length) && attrs.layerUrl.indexOf("WMSServer") > 0 && (attrs.layerType = "WMS");
            }
            function reconstructLayer() {
                $log.info("reconstructing layer...");
                for (var allLAyers = mapController.getLayers(), layerIndex = null, i = 0; i < allLAyers.length; i++) if (allLAyers[i].id === $scope.layerDto.id) {
                    layerIndex = i;
                    break;
                }
                null != layerIndex && (mapController.removeLayerById($scope.layerDto.id), $scope.layerDto = null, 
                initialiseDefaults(), layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), 
                layerOptions.initialExtent = mapController.getInitialExtent(), layerOptions.format = $scope.format, 
                layer = GeoLayerService.createLayer(layerOptions, $scope.framework), mapController.addLayer(layer).then(function(layerDto) {
                    if ($scope.layerDto = layerDto, addLayerCallback(), null != $scope.layerDto) {
                        var delta = layerIndex - mapController.getLayers().length + 1;
                        mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                    }
                }));
            }
            $scope.framework = mapController.getFrameworkVersion(), attrs.$observe("refreshLayer", function(newVal, oldVal) {
                newVal !== oldVal && ($log.info("refresh for - " + $scope.layerName), $scope.initialiseLayer());
            }), $scope.mapAPI = {}, $scope.mapAPI.mapController = mapController;
            var layerOptions, layer, addLayerCallback = function() {
                $scope.layerReady = !0;
            }, constructLayer = function() {
                initialiseDefaults(), $scope.constructionInProgress = !0, layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), 
                layerOptions.initialExtent = mapController.getInitialExtent(), layerOptions.mapElementId = mapController.getMapElementId(), 
                layerOptions.format = $scope.format, $log.info(layerOptions.layerName + " - constructing..."), 
                0 !== layerOptions.layerType.length && (layer = GeoLayerService.createLayer(layerOptions, $scope.framework), 
                mapController.addLayer(layer).then(function(layerDto) {
                    $scope.layerDto = layerDto, addLayerCallback(), $log.info("construction complete..."), 
                    $scope.constructionInProgress = !1;
                }, function(error) {
                    $scope.$emit(layerOptions.layerName + "_error", layerOptions), $scope.onError({
                        message: error,
                        layer: layerOptions
                    }), addLayerCallback(), $log.info("construction failed..."), $scope.constructionInProgress = !1;
                }));
            };
            attrs.$observe("visibility", function() {
                $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setLayerVisibility($scope.layerDto.id, "true" === $scope.visibility);
            }), attrs.$observe("opacity", function() {
                $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setOpacity($scope.layerDto.id, $scope.opacity);
            }), $scope.initCount = 0, $scope.initialiseLayer = function() {
                $log.info("initialising layer..."), null != $scope.layerDto ? reconstructLayer() : $scope.layerReady && $scope.constructionInProgress ? $log.info("...") : constructLayer();
            }, $scope.$on("$destroy", function() {
                $scope.layerDto && mapController.removeLayerById($scope.layerDto.id), $(window).off("resize.Viewport");
            }), null == attrs.refreshLayer && null != $scope.layerType && $scope.layerType.length > 0 && $scope.initialiseLayer();
        }
    };
} ]), function() {
    var app = angular.module("geowebtoolkit.core.layer-services", [ "geowebtoolkit.mapservices", "geowebtoolkit.core.map-config" ]);
    app.service("GeoLayerService", [ "geoConfig", "mapLayerServiceLocator", function(geoConfig, mapLayerServiceLocator) {
        "use strict";
        var defaultFramework = "olv2";
        return {
            createLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createLayer(args);
            },
            createFeatureLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createFeatureLayer(args);
            },
            createGoogleLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createGoogleLayer(args);
            },
            createBingLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createBingLayer(args);
            },
            createOsmLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createOsmLayer(args);
            },
            createMarkerLayer: function(args, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createMarkerLayer(args);
            },
            removeLayerByName: function(mapInstance, layerName, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayerByName(mapInstance, layerName);
            },
            removeLayersByName: function(mapInstance, layerName, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayersByName(mapInstance, layerName);
            },
            removeLayer: function(mapInstance, layerInstance, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayer(mapInstance, layerInstance);
            },
            removeLayerById: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.removeLayerById(mapInstance, layerId);
            },
            getMarkerCountForLayerName: function(mapInstance, layerName, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.getMarkerCountForLayerName(mapInstance, layerName);
            },
            registerFeatureSelected: function(mapInstance, layerId, callback, element, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.registerFeatureSelected(mapInstance, layerId, callback, element);
            },
            defaultLayerOptions: function(attrs, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.defaultLayerOptions(attrs, new geoConfig());
            },
            createFeature: function(mapInstance, geoJson, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.createFeature(mapInstance, geoJson);
            },
            cleanupLayer: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.cleanupLayer(mapInstance, layerId);
            },
            registerLayerEvent: function(mapInstance, layerId, eventName, callback, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.registerLayerEvent(mapInstance, layerId, eventName, callback);
            },
            unRegisterLayerEvent: function(mapInstance, layerId, eventName, callback, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.unRegisterLayerEvent(mapInstance, layerId, eventName, callback);
            },
            unRegisterMapEvent: function(mapInstance, layerId, eventName, callback, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.unRegisterMapEvent(mapInstance, layerId, eventName, callback);
            },
            addFeatureToLayer: function(mapInstance, layerId, feature, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.addFeatureToLayer(mapInstance, layerId, feature);
            },
            parselatLong: function(latlong) {
                if (!latlong) return null;
                var coords, centerPosition;
                return coords = latlong.split(","), centerPosition = {
                    lat: "",
                    lon: ""
                }, centerPosition.lat = coords[0], centerPosition.lon = coords[1], centerPosition;
            },
            filterFeatureLayer: function(mapInstance, layerId, filterValue, featureAttributes, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.filterFeatureLayer(mapInstance, layerId, filterValue, featureAttributes);
            },
            getLayerFeatures: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.getLayerFeatures(mapInstance, layerId);
            },
            clearFeatureLayer: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                service.clearFeatureLayer(mapInstance, layerId);
            },
            removeFeatureFromLayer: function(mapInstance, layerId, featureId, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.removeFeatureFromLayer(mapInstance, layerId, featureId);
            },
            raiseLayerDrawOrder: function(mapInstance, layerId, delta, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.raiseLayerDrawOrder(mapInstance, layerId, delta);
            },
            setFeatureStyle: function(featureInstance, styleArgs, version) {
                var useVersion = version || defaultFramework, service = mapLayerServiceLocator.getImplementation(useVersion);
                return service.setFeatureStyle(featureInstance, styleArgs);
            }
        };
    } ]), app.service("mapLayerServiceLocator", [ "$injector", function($injector) {
        "use strict";
        var implementations = {
            olv2: "olv2LayerService",
            olv3: "olv3LayerService"
        };
        return {
            getImplementation: function(mapType) {
                return $injector.get(implementations[mapType]);
            }
        };
    } ]);
}();

var angular = angular || {}, OpenLayers = OpenLayers || {}, app = angular.module("geowebtoolkit.core.map-config", []);

app.value("geoConfig", function() {
    "use strict";
    var defaults = {
        standardTileSize: 256,
        largeTileSize: 1024,
        veryLargeTileSize: 2048,
        minMapWidth: 900,
        minMapHeight: 600,
        panIncrement: 30,
        smallPanIncrement: 5,
        transitionEffect: "resize",
        visibility: !0,
        isBaseLayer: !1,
        wrapDateLine: !0,
        sphericalMercator: !0,
        bingLayerType: "Road",
        opacity: 1,
        layerAttribution: "",
        displayInLayerSwitcher: !0,
        projection: "EPSG:3857",
        displayProjection: "EPSG:4326",
        numZoomLevels: 15,
        transparent: !0,
        format: "image/png",
        tileSize: function(tileType) {
            var result;
            return tileType ? "large" === tileType ? result = new OpenLayers.Size(defaults.largeTileSize, defaults.largeTileSize) : "vlarge" === tileType && (result = new OpenLayers.Size(defaults.veryLargeTileSize, defaults.veryLargeTileSize)) : result = new OpenLayers.Size(defaults.standardTileSize, defaults.standardTileSize), 
            result;
        },
        layerType: "WMS"
    };
    return {
        defaultOptions: defaults,
        olv2Options: defaults,
        cesiumOptions: {
            includeCustomTerrainProvider: !1,
            customTerrainProviderUrl: null
        },
        olv3Options: {
            renderer: "canvas"
        }
    };
});

var angular = angular || {}, $ = $ || {}, ol = ol || {}, OpenLayers = OpenLayers || {}, app = angular.module("geowebtoolkit.core.map-directives", [ "geowebtoolkit.core.map-services", "geowebtoolkit.core.layer-services" ]);

app.directive("geoMap", [ "$timeout", "$compile", "GeoMapService", "GeoLayerService", "GeoDataService", "$q", "$log", function($timeout, $compile, GeoMapService, GeoLayerService, GeoDataService, $q, $log) {
    "use strict";
    return {
        restrict: "E",
        scope: {
            mapElementId: "@",
            datumProjection: "@",
            displayProjection: "@",
            centerPosition: "@",
            zoomLevel: "@",
            isStaticMap: "@",
            initialExtent: "=",
            framework: "@",
            existingMapInstance: "="
        },
        controller: [ "$scope", function($scope) {
            $log.info("map creation started..."), $("#" + $scope.mapElementId).empty(), $scope.initialPositionSet = !1, 
            $scope.layerPromises = [], $scope.layerDtoPromises = [];
            var self = this;
            self.addLayer = function(layer) {
                var deferredAll = $q.defer(), deferredLayer = $q.defer();
                if (null !== layer.then && "function" == typeof layer.then) deferredAll = layer, 
                $scope.layersReady ? layer.then(function(resultLayer) {
                    if (null == resultLayer) $log.info("failed to load layer"); else {
                        var layerDto = GeoMapService.addLayer($scope.mapInstance, resultLayer, $scope.framework);
                        deferredLayer.resolve(layerDto), $scope.$emit("layerAdded", layerDto);
                    }
                }) : ($scope.layerPromises.push(deferredAll), $scope.layerDtoPromises.push(deferredLayer)); else if ($scope.layersReady) {
                    var layerDto = GeoMapService.addLayer($scope.mapInstance, layer, $scope.framework);
                    deferredLayer.resolve(layerDto), $scope.$emit("layerAdded", layerDto);
                } else $scope.layerPromises.push(deferredAll.promise), $scope.layerDtoPromises.push(deferredLayer), 
                deferredAll.resolve(layer);
                return deferredLayer.promise;
            };
            var initialMarkerLayers = [];
            $scope.deferredMarkers = [], self.addMarkerLayer = function(layer, groupName) {
                if (groupName) {
                    initialMarkerLayers.push(groupName);
                    for (var markerLayer, foundExistingGroup = !1, i = 0; i < initialMarkerLayers.length; i++) if (markerLayer = initialMarkerLayers[i], 
                    markerLayer === groupName) {
                        foundExistingGroup = !0;
                        break;
                    }
                    if (foundExistingGroup) {
                        if ($scope.layersReady) {
                            var deferred = $q.defer();
                            return deferred.resolve(), deferred.promise;
                        }
                        var initDeferred = $q.defer();
                        return $scope.deferredMarkers.push(initDeferred), initDeferred.promise;
                    }
                    return self.addLayer(layer);
                }
                return self.addLayer(layer);
            }, self.getMapOptions = function() {
                return {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
            }, self.createLayer = function(layerArgs) {
                var layerOptions = GeoLayerService.defaultLayerOptions(layerArgs, $scope.framework);
                return GeoLayerService.createLayer(layerOptions, $scope.framework);
            }, self.zoomToMaxExtent = function() {
                GeoMapService.zoomToMaxExtent($scope.mapInstance, $scope.framework);
            }, self.currentZoomLevel = function() {
                return GeoMapService.currentZoomLevel($scope.mapInstance, $scope.framework);
            }, self.registerMapMouseMove = function(callback) {
                GeoMapService.registerMapMouseMove($scope.mapInstance, callback, $scope.framework);
            }, self.registerMapMouseMoveEnd = function(callback) {
                GeoMapService.registerMapMouseMoveEnd($scope.mapInstance, callback, $scope.framework);
            }, self.registerMapClick = function(callback) {
                GeoMapService.registerMapClick($scope.mapInstance, callback, $scope.framework);
            }, self.unRegisterMapClick = function(callback) {
                GeoMapService.unRegisterMapClick($scope.mapInstance, callback, $scope.framework);
            }, self.addControl = function(controlName, controlOptions, elementId, controlId) {
                return GeoMapService.addControl($scope.mapInstance, controlName, controlOptions, elementId, controlId, self.getMapOptions(), $scope.framework);
            }, self.getLonLatFromPixel = function(x, y, projection) {
                return GeoMapService.getLonLatFromPixel($scope.mapInstance, x, y, projection, $scope.framework);
            }, self.getPixelFromLonLat = function(lon, lat) {
                return GeoMapService.getPixelFromLonLat($scope.mapInstance, lon, lat, $scope.framework);
            }, self.getPointFromEvent = function(event) {
                return GeoMapService.getPointFromEvent(event, $scope.framework);
            }, self.getLayers = function() {
                return GeoMapService.getLayers($scope.mapInstance, $scope.framework);
            }, self.getLayersByName = function(layerName) {
                return GeoMapService.getLayersByName($scope.mapInstance, layerName, $scope.framework);
            }, self.zoomToLayer = function(layerId) {
                GeoMapService.zoomToLayer($scope.mapInstance, layerId, $scope.framework);
            }, self.getProjection = function() {
                return GeoMapService.getProjection($scope.mapInstance, self.getFrameworkVersion());
            }, self.getDisplayProjection = function() {
                return GeoMapService.getDisplayProjection($scope.mapInstance, self.getFrameworkVersion());
            }, self.getSize = function() {
                return GeoMapService.getSize($scope.mapInstance, self.getFrameworkVersion());
            }, self.setLayerVisibility = function(layerId, visibility) {
                GeoMapService.setLayerVisibility($scope.mapInstance, layerId, visibility, $scope.framework);
            }, self.createBoundingBox = function(lonLatArray) {
                return GeoMapService.createBoundingBox($scope.mapInstance, lonLatArray, $scope.framework);
            }, self.createBounds = function(geoJsonCoordinates, projection) {
                return GeoMapService.createBounds($scope.mapInstance, geoJsonCoordinates, projection, $scope.framework);
            }, self.zoomToExtent = function(lonLatArray) {
                GeoMapService.zoomToExtent($scope.mapInstance, lonLatArray, $scope.framework);
            }, self.zoomTo = function(zoomLevel) {
                GeoMapService.zoomTo($scope.mapInstance, zoomLevel, $scope.framework);
            }, self.setBaseLayer = function(layerId) {
                GeoMapService.setBaseLayer($scope.mapInstance, layerId, $scope.framework);
            }, self.setCenter = function(lat, lon, projection) {
                GeoMapService.setCenter($scope.mapInstance, lat, lon, projection, $scope.framework);
            }, self.getInitialExtent = function() {
                return $scope.initialExtent;
            }, self.resetInitialExtent = function() {
                var args = {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
                GeoMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework);
            }, self.setInitialPositionAndZoom = function() {
                var args = {
                    mapElementId: $scope.mapElementId,
                    datumProjection: $scope.datumProjection,
                    displayProjection: $scope.displayProjection,
                    centerPosition: $scope.centerPosition,
                    zoomLevel: $scope.zoomLevel,
                    initialExtent: $scope.initialExtent
                };
                $scope.centerPosition || ($scope.centerPosition = {
                    lon: 0,
                    lat: 0
                }), $scope.initialPositionSet || GeoMapService.setInitialPositionAndZoom($scope.mapInstance, args, $scope.framework), 
                $scope.initialPositionSet = !0;
            }, self.isBaseLayer = function(layerId) {
                return GeoMapService.isBaseLayer($scope.mapInstance, layerId, $scope.framework);
            }, self.getMapInstance = function() {
                return $scope.mapInstance;
            }, self.setOpacity = function(layerId, opacity) {
                GeoMapService.setOpacity($scope.mapInstance, layerId, opacity, $scope.framework);
            }, self.getMapElementId = function() {
                return GeoMapService.getMapElementId($scope.mapInstance, $scope.framework);
            }, self.setMapMarker = function(point, markerGroupName, iconUrl, args) {
                return GeoMapService.setMapMarker($scope.mapInstance, point, markerGroupName, iconUrl, args, $scope.framework);
            }, self.removeMapMarker = function(markerId) {
                GeoMapService.removeMapMarker($scope.mapInstance, markerId, $scope.framework);
            }, self.removeLayerByName = function(layerName) {
                GeoLayerService.removeLayerByName($scope.mapInstance, layerName, $scope.framework);
            }, self.removeLayersByName = function(layerName) {
                GeoLayerService.removeLayersByName($scope.mapInstance, layerName, $scope.framework);
            }, self.removeLayer = function(layerInstance) {
                GeoLayerService.removeLayer($scope.mapInstance, layerInstance, $scope.framework);
            }, self.removeLayerById = function(layerId) {
                GeoLayerService.removeLayerById($scope.mapInstance, layerId, $scope.framework);
            }, self.getMarkerCountForLayerName = function(layerName) {
                return GeoLayerService.getMarkerCountForLayerName($scope.mapInstance, layerName, $scope.framework);
            }, self.drawPolyLine = function(points, layerName) {
                GeoMapService.drawPolyLine($scope.mapInstance, points, layerName, $scope.framework);
            }, self.startRemoveSelectedFeature = function(layerName) {
                return GeoMapService.startRemoveSelectedFeature($scope.mapInstance, layerName, $scope.framework);
            }, self.stopRemoveSelectedFeature = function() {
                return GeoMapService.stopRemoveSelectedFeature($scope.mapInstance, $scope.framework);
            }, self.removeFeature = function(layerName, feature) {
                return GeoMapService.removeFeature($scope.mapInstance, layerName, feature, $scope.framework);
            }, self.startDrawingOnLayer = function(layerName, args) {
                return GeoMapService.startDrawingOnLayer($scope.mapInstance, layerName, args, $scope.framework);
            }, self.stopDrawing = function() {
                return GeoMapService.stopDrawing($scope.mapInstance, $scope.framework);
            }, self.drawLabel = function(layerName, args) {
                return GeoMapService.drawLabel($scope.mapInstance, layerName, args, $scope.framework);
            }, self.drawLabelWithPoint = function(layerName, args) {
                return GeoMapService.drawLabelWithPoint($scope.mapInstance, layerName, args, $scope.framework);
            }, self.isControlActive = function(controlId, controlName) {
                return GeoMapService.isControlActive($scope.mapInstance, controlId, controlName, $scope.framework);
            }, self.getLayersByWMSCapabilities = function(url) {
                return GeoDataService.getLayersByWMSCapabilities(url, $scope.framework);
            }, self.getWMSFeatures = function(url, layerNames, wmsVersion, pointEvent, contentType) {
                return GeoDataService.getWMSFeatures($scope.mapInstance, url, layerNames, wmsVersion, pointEvent, contentType, $scope.framework);
            }, self.getWMSFeaturesByLayerId = function(url, layerId, pointEvent) {
                return GeoDataService.getWMSFeaturesByLayerId($scope.mapInstance, url, layerId, pointEvent, $scope.framework);
            }, self.registerFeatureSelected = function(layerId, callback, element) {
                return GeoLayerService.registerFeatureSelected($scope.mapInstance, layerId, callback, element, $scope.framework);
            }, self.getFeatureInfo = function(url, featureType, featurePrefix, geometryName, point, tolerance) {
                return GeoMapService.getFeatureInfo($scope.mapInstance, url, featureType, featurePrefix, geometryName, point, tolerance, $scope.framework);
            }, self.getFeatureInfoFromLayer = function(layerId, point, tolerance) {
                return GeoMapService.getFeatureInfoFromLayer($scope.mapInstance, layerId, point, tolerance, $scope.framework);
            }, self.resetMapFired = function() {
                $scope.$emit("resetMapFired");
            }, self.activateControl = function(controlId) {
                GeoMapService.activateControl($scope.mapInstance, controlId, $scope.framework);
            }, self.deactivateControl = function(controlId) {
                GeoMapService.deactivateControl($scope.mapInstance, controlId, $scope.framework);
            }, self.registerControlEvent = function(controlId, eventName, callback) {
                GeoMapService.registerControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            }, self.unRegisterControlEvent = function(controlId, eventName, callback) {
                GeoMapService.unRegisterControlEvent($scope.mapInstance, controlId, eventName, callback, $scope.framework);
            }, self.registerMapEvent = function(eventName, callback) {
                GeoMapService.registerMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            }, self.registerLayerEvent = function(layerId, eventName, callback) {
                GeoLayerService.registerLayerEvent($scope.mapInstance, layerId, eventName, callback, $scope.framework);
            }, self.unRegisterLayerEvent = function(layerId, eventName, callback) {
                GeoLayerService.unRegisterLayerEvent($scope.mapInstance, layerId, eventName, callback, $scope.framework);
            }, self.unRegisterMapEvent = function(eventName, callback) {
                GeoMapService.unRegisterMapEvent($scope.mapInstance, eventName, callback, $scope.framework);
            }, self.getCurrentMapExtent = function() {
                return GeoMapService.getCurrentMapExtent($scope.mapInstance, $scope.framework);
            }, self.getMapScale = function() {
                return GeoMapService.getMapScale($scope.mapInstance, $scope.framework);
            }, self.getMapCenter = function() {
                return GeoMapService.getMapCenter($scope.mapInstance, $scope.framework);
            }, self.switch3d = function() {
                GeoMapService.is3dSupported($scope.mapInstance, $scope.framework) && (GeoMapService.is3d($scope.mapInstance, $scope.framework) ? GeoMapService.switchTo2dView($scope.mapInstance, $scope.framework) : GeoMapService.switchTo3dView($scope.mapInstance, $scope.framework));
            }, self.is3d = function() {
                return GeoMapService.is3dSupported($scope.mapInstance, $scope.framework) ? GeoMapService.is3d($scope.mapInstance, $scope.framework) : !1;
            }, self.filterFeatureLayer = function(layerId, filterValue, featureAttributes) {
                GeoLayerService.filterFeatureLayer($scope.mapInstance, layerId, filterValue, featureAttributes, $scope.framework);
            }, self.getLayerFeatures = function(layerId) {
                return GeoLayerService.getLayerFeatures($scope.mapInstance, layerId, $scope.framework);
            }, self.createFeature = function(geoJson) {
                return GeoLayerService.createFeature($scope.mapInstance, geoJson, $scope.framework);
            }, self.addFeatureToLayer = function(layerId, feature) {
                return GeoLayerService.addFeatureToLayer($scope.mapInstance, layerId, feature, $scope.framework);
            }, self.createWfsClient = function(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                return GeoMapService.createWfsClient(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid, $scope.framework);
            }, self.addWfsClient = function(wfsClient) {
                return GeoMapService.addWfsClient(wfsClient, $scope.framework);
            }, self.searchWfs = function(clientId, query, attribute) {
                return GeoMapService.searchWfs($scope.mapInstance, clientId, query, attribute, $scope.framework);
            }, self.getMeasureFromEvent = function(event) {
                return GeoMapService.getMeasureFromEvent($scope.mapInstance, event, $scope.framework);
            }, self.removeFeatureFromLayer = function(layerId, featureId) {
                GeoLayerService.removeFeatureFromLayer($scope.mapInstance, layerId, featureId, $scope.framework);
            }, self.raiseLayerDrawOrder = function(layerId, delta) {
                GeoLayerService.raiseLayerDrawOrder($scope.mapInstance, layerId, delta, $scope.framework);
            }, self.getFrameworkVersion = function() {
                return null != window.OpenLayers && $scope.mapInstance instanceof window.OpenLayers.Map ? "olv2" : null != window.ol && $scope.mapInstance instanceof window.ol.Map ? "olv3" : void 0;
            }, $scope.geoMap = self, $(window).bind("resize", function() {
                GeoMapService.mapResized($scope.mapInstance, $scope.framework);
            }), $scope.mapInstance = $scope.existingMapInstance ? $scope.existingMapInstance : GeoMapService.initialiseMap({
                mapElementId: $scope.mapElementId,
                datumProjection: $scope.datumProjection,
                displayProjection: $scope.displayProjection,
                initialExtent: $scope.initialExtent,
                centerPosition: $scope.centerPosition,
                zoomLevel: $scope.zoomLevel,
                isStaticMap: $scope.isStaticMap
            }, $scope.framework), $scope.$emit("mapInstanceReady", $scope.mapInstance), $scope.$emit("mapControllerReady", self), 
            $scope.$broadcast("mapControllerReady", self), $scope.$on("$destroy", function() {
                $log.info("map destruction started..."), $(window).off("resize.Viewport"), $timeout(function() {
                    $log.info("map destruction finishing..."), $log.info("removing " + $scope.geoMap.getLayers().length + " layers...");
                    for (var allLayers = $scope.geoMap.getLayers(), i = 0; i < allLayers.length; i++) {
                        var layer = allLayers[i];
                        $scope.geoMap.removeLayerById(layer.id);
                    }
                });
            });
        } ],
        link: function(scope) {
            function processLayers(layers) {
                $log.info("resolving all layers");
                for (var allLayerDtos = [], i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if ("string" == typeof layer) scope.layerDtoPromises[i].reject(layer); else {
                        var layerDto = GeoMapService.addLayer(scope.mapInstance, layer, scope.framework);
                        scope.layerDtoPromises[i].resolve(layerDto), allLayerDtos.push(layerDto);
                    }
                }
                for (var deferredMarkerIndex = 0; deferredMarkerIndex < scope.deferredMarkers.length; deferredMarkerIndex++) scope.deferredMarkers[deferredMarkerIndex].resolve();
                scope.$emit("layersReady", allLayerDtos), scope.$broadcast("layersReady", allLayerDtos), 
                scope.layersReady = !0, scope.existingMapInstance || scope.geoMap.setInitialPositionAndZoom();
            }
            $timeout(function() {
                $q.allSettled(scope.layerPromises).then(function(layers) {
                    processLayers(layers);
                }, function(layersWithErrors) {
                    processLayers(layersWithErrors);
                });
            });
        },
        transclude: !1
    };
} ]), app.config([ "$provide", function($provide) {
    $provide.decorator("$q", [ "$delegate", function($delegate) {
        var $q = $delegate;
        return $q.allSettled = $q.allSettled || function(promises) {
            var deferred = $q.defer();
            if (!angular.isArray(promises)) throw "allSettled can only handle an array of promises (for now)";
            var states = [], results = [], didAPromiseFail = !1;
            angular.forEach(promises, function(promise, key) {
                states[key] = !1;
            });
            var checkStates = function(states, results, deferred, failed) {
                var allFinished = !0;
                angular.forEach(states, function(state) {
                    state || (allFinished = !1);
                }), allFinished && (failed ? deferred.reject(results) : deferred.resolve(results));
            };
            return angular.forEach(promises, function(promise, key) {
                $q.when(promise).then(function(result) {
                    states[key] = !0, results[key] = result, checkStates(states, results, deferred, didAPromiseFail);
                }, function(reason) {
                    states[key] = !0, results[key] = reason, didAPromiseFail = !0, checkStates(states, results, deferred, didAPromiseFail);
                });
            }), deferred.promise;
        }, $q;
    } ]);
} ]), function() {
    var app = angular.module("geowebtoolkit.core.map-services", [ "geowebtoolkit.mapservices", "geowebtoolkit.core.map-config" ]);
    app.service("GeoMapService", [ "$log", "geoConfig", "mapServiceLocator", function($log, geoConfig, mapServiceLocator) {
        "use strict";
        var defaultFramework = "olv2";
        return {
            initialiseMap: function(args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                try {
                    return service.initialiseMap(args, new geoConfig());
                } catch (e) {
                    throw $log.error("Failed to initialise map"), e;
                }
            },
            zoomToMaxExtent: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToMaxExtent(mapInstance);
            },
            zoomTo: function(mapInstance, zoomLevel, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.zoomTo(mapInstance, zoomLevel);
            },
            getMapElementId: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getMapElementId(mapInstance);
            },
            getProjection: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getProjection(mapInstance);
            },
            getDisplayProjection: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getDisplayProjection(mapInstance);
            },
            getSize: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getSize(mapInstance);
            },
            currentZoomLevel: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.currentZoomLevel(mapInstance);
            },
            addLayer: function(mapInstance, layer, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.addLayer(mapInstance, layer);
            },
            registerMapMouseMove: function(mapInstance, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapMouseMove(mapInstance, callback);
            },
            registerMapMouseMoveEnd: function(mapInstance, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapMouseMoveEnd(mapInstance, callback);
            },
            registerMapClick: function(mapInstance, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapClick(mapInstance, callback);
            },
            unRegisterMapClick: function(mapInstance, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterMapClick(mapInstance, callback);
            },
            registerMapEvent: function(mapInstance, eventName, callback, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                service.registerMapEvent(mapInstance, eventName, callback, version);
            },
            unRegisterMapEvent: function(mapInstance, eventName, callback, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterMapEvent(mapInstance, eventName, callback, version);
            },
            getCurrentMapExtent: function(mapInstance, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                return service.getCurrentMapExtent(mapInstance);
            },
            getMapScale: function(mapInstance, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                return service.getMapScale(mapInstance);
            },
            getMapCenter: function(mapInstance, version) {
                var useVersion = version || "olv2", service = mapServiceLocator.getImplementation(useVersion);
                return service.getMapCenter(mapInstance);
            },
            addControl: function(mapInstance, controlName, controlOptions, elementId, controlId, mapOptions, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.addControl(mapInstance, controlName, controlOptions, elementId, controlId, mapOptions);
            },
            isControlActive: function(mapInstance, controlId, controlName, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.isControlActive(mapInstance, controlId, controlName);
            },
            activateControl: function(mapInstance, controlId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.activateControl(mapInstance, controlId);
            },
            deactivateControl: function(mapInstance, controlId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.deactivateControl(mapInstance, controlId);
            },
            registerControlEvent: function(mapInstance, controlId, eventName, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.registerControlEvent(mapInstance, controlId, eventName, callback);
            },
            unRegisterControlEvent: function(mapInstance, controlId, eventName, callback, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.unRegisterControlEvent(mapInstance, controlId, eventName, callback);
            },
            getLayers: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getLayers(mapInstance);
            },
            getLayersByName: function(mapInstance, layerName, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getLayersByName(mapInstance, layerName);
            },
            zoomToLayer: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToLayer(mapInstance, layerId);
            },
            setLayerVisibility: function(mapInstance, layerId, visibility, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.setLayerVisibility(mapInstance, layerId, visibility);
            },
            createBoundingBox: function(mapInstance, lonLatArray, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.createBoundingBox(mapInstance, lonLatArray);
            },
            createBounds: function(mapInstance, lonLatArray, projection, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.createBounds(mapInstance, lonLatArray, projection);
            },
            zoomToExtent: function(mapInstance, extent, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.zoomToExtent(mapInstance, extent);
            },
            setCenter: function(mapInstance, lat, lon, projection, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.setCenter(mapInstance, lat, lon, projection);
            },
            setInitialPositionAndZoom: function(mapInstance, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.setInitialPositionAndZoom(mapInstance, args, new geoConfig());
            },
            setBaseLayer: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.setBaseLayer(mapInstance, layerId);
            },
            isBaseLayer: function(mapInstance, layerId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.isBaseLayer(mapInstance, layerId);
            },
            setOpacity: function(mapInstance, layerId, opacity, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.setOpacity(mapInstance, layerId, opacity);
            },
            mapResized: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.mapResized(mapInstance);
            },
            setMapMarker: function(mapInstance, coords, markerGroupName, iconUrl, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.setMapMarker(mapInstance, coords, markerGroupName, iconUrl, args);
            },
            removeMapMarker: function(mapInstance, markerId, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                service.removeMapMarker(mapInstance, markerId);
            },
            getLonLatFromPixel: function(mapInstance, x, y, projection, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getLonLatFromPixel(mapInstance, x, y, projection);
            },
            getPixelFromLonLat: function(mapInstance, lon, lat, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getPixelFromLonLat(mapInstance, lon, lat);
            },
            getPointFromEvent: function(e, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getPointFromEvent(e);
            },
            drawPolyLine: function(mapInstance, points, layerName, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.drawPolyLine(mapInstance, points, layerName);
            },
            startRemoveSelectedFeature: function(mapInstance, layerName, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.startRemoveSelectedFeature(mapInstance, layerName);
            },
            stopRemoveSelectedFeature: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.stopRemoveSelectedFeature(mapInstance);
            },
            removeFeature: function(mapInstance, layerName, feature, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.removeFeature(mapInstance, layerName, feature);
            },
            drawFeature: function(mapInstance, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.drawFeature(mapInstance, args);
            },
            startDrawingOnLayer: function(mapInstance, layerName, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.startDrawingOnLayer(mapInstance, layerName, args);
            },
            stopDrawing: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.stopDrawing(mapInstance);
            },
            drawLabel: function(mapInstance, layerName, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.drawLabel(mapInstance, layerName, args);
            },
            drawLabelWithPoint: function(mapInstance, layerName, args, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.drawLabelWithPoint(mapInstance, layerName, args);
            },
            createWfsClient: function(url, featureType, featurePrefix, wfsVersion, geometryName, datumProjection, isLonLatOrderValid, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.createWfsClient(url, featureType, featurePrefix, wfsVersion, geometryName, datumProjection, isLonLatOrderValid);
            },
            getFeatureInfo: function(mapInstance, url, featureType, featurePrefix, geometryName, point, tolerance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getFeatureInfo(mapInstance, url, featureType, featurePrefix, geometryName, point, tolerance);
            },
            getFeatureInfoFromLayer: function(mapInstance, layerId, point, tolerance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getFeatureInfoFromLayer(mapInstance, layerId, point, tolerance);
            },
            getMeasureFromEvent: function(mapInstance, e, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.getMeasureFromEvent(mapInstance, e);
            },
            addWfsClient: function(wfsClient, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.addWfsClient(wfsClient);
            },
            is3dSupported: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.is3dSupported(mapInstance);
            },
            is3d: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.is3d(mapInstance);
            },
            switchTo3dView: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.switchTo3dView(mapInstance);
            },
            switchTo2dView: function(mapInstance, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.switchTo2dView(mapInstance);
            },
            searchWfs: function(mapInstance, clientId, query, attribute, version) {
                var useVersion = version || defaultFramework, service = mapServiceLocator.getImplementation(useVersion);
                return service.searchWfs(mapInstance, clientId, query, attribute);
            }
        };
    } ]), app.service("mapServiceLocator", [ "$injector", function($injector) {
        "use strict";
        var implementations = {
            olv2: "olv2MapService",
            olv3: "olv3MapService"
        };
        return {
            getImplementation: function(mapType) {
                return $injector.get(implementations[mapType]);
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.core.marker-directives", [ "geowebtoolkit.core.map-directives", "geowebtoolkit.core.map-services", "geowebtoolkit.core.layer-services" ]);
    app.directive("geoMapMarker", [ "$log", "$timeout", "GeoLayerService", function($log, $timeout, GeoLayerService) {
        return {
            restrict: "E",
            require: "^geoMap",
            scope: {
                markerIcon: "@",
                markerLong: "@",
                markerLat: "@",
                markerId: "@",
                markerWidth: "@",
                markerHeight: "@",
                mapMarkerClicked: "&",
                layerName: "@"
            },
            link: function($scope, element, attrs, mapController) {
                function createMapMarker() {
                    var lat, lon, width, height, iconUrl;
                    iconUrl = $scope.markerIcon, "string" == typeof $scope.markerLong && (lon = parseFloat($scope.markerLong)), 
                    "string" == typeof $scope.markerLat && (lat = parseFloat($scope.markerLat)), "string" == typeof $scope.markerWidth && (width = parseInt($scope.markerWidth)), 
                    "string" == typeof $scope.markerHeight && (height = parseInt($scope.markerHeight));
                    var layer = GeoLayerService.createLayer({
                        layerType: "markerlayer",
                        layerName: $scope.layerName
                    }, $scope.framework);
                    mapController.addMarkerLayer(layer, $scope.layerName).then(function() {
                        var position = mapController.getPixelFromLonLat(lon, lat);
                        $scope.markerDto = mapController.setMapMarker(position, $scope.layerName, iconUrl, {
                            width: width,
                            height: height
                        });
                    });
                }
                $scope.framework = mapController.getFrameworkVersion(), attrs.$observe("markerIcon", function() {}), 
                attrs.$observe("markerLong", function() {}), attrs.$observe("markerLat", function() {}), 
                attrs.$observe("markerId", function() {}), attrs.$observe("markerWidth", function() {}), 
                attrs.$observe("markerHeight", function() {}), createMapMarker(), $scope.$on("$destroy", function() {
                    mapController.removeMapMarker($scope.markerDto.id);
                });
            }
        };
    } ]);
}();

var angular = angular || {}, console = console || {}, $ = $ || {}, app = angular.module("geowebtoolkit.utils", []);

app.service("GeoUtils", [ function() {
    "use strict";
    function convertHexToRgb(hexVal) {
        return hexVal = parseInt("#" === hexVal.charAt(0) ? hexVal.substring(1, 7) : hexVal, 16), 
        [ Math.floor(hexVal / 65536), Math.floor(hexVal % 65536 / 256), hexVal % 256 ];
    }
    return {
        generateUuid: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = 16 * Math.random() | 0, v = "x" == c ? r : 3 & r | 8;
                return v.toString(16);
            });
        },
        convertHexToRgb: convertHexToRgb,
        convertHexAndOpacityToRgbArray: function(hexVal, opacity) {
            var a = convertHexToRgb(hexVal);
            return a.push(opacity), a;
        }
    };
} ]), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.vendor.bing-layers", [ "geowebtoolkit.core.layer-services" ]);
    app.directive("geoBingLayer", [ "$timeout", "$compile", "GeoLayerService", "$log", function($timeout, $compile, GeoLayerService, $log) {
        var validBingLayerTypes = [ "road", "aerial", "aerialwithlabels", "birdseye", "birdseyewithlabels" ], validateBingLayerType = function(layerType) {
            for (var i = 0; i < validBingLayerTypes.length; i++) {
                var validType = validBingLayerTypes[i];
                if (validType === layerType.toLowerCase()) return !0;
            }
            return !1;
        };
        return {
            restrict: "E",
            require: "^geoMap",
            scope: {
                layerType: "@",
                visibility: "@",
                wrapDateLine: "@",
                bingApiKey: "@",
                controllerEmitEventName: "@"
            },
            transclude: !1,
            controller: [ "$scope", function($scope) {
                var self = this;
                return $scope.controllerEmitEventName && $scope.$emit($scope.controllerEmitEventName, self), 
                self;
            } ],
            link: function($scope, element, attrs, mapController) {
                function reconstructLayer() {
                    $log.info("reconstructing layer...");
                    for (var allLAyers = mapController.getLayers(), layerIndex = null, i = 0; i < allLAyers.length; i++) if (allLAyers[i].id === $scope.layerDto.id) {
                        layerIndex = i;
                        break;
                    }
                    if (null != layerIndex) {
                        if (mapController.removeLayerById($scope.layerDto.id), $scope.layerDto = null, layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), 
                        layerOptions.initialExtent = mapController.getInitialExtent(), layerOptions.format = $scope.format, 
                        null == layerOptions.bingApiKey) throw new Error("Missing Bing Maps API key. Please provide your valid Bing Maps API key using the geo-bing-layer attribute 'bing-api-key'");
                        layer = GeoLayerService.createBingLayer(layerOptions, $scope.framework), mapController.addLayer(layer).then(function(layerDto) {
                            if ($scope.layerDto = layerDto, addLayerCallback(), null != $scope.layerDto) {
                                var delta = layerIndex - mapController.getLayers().length + 1;
                                mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                            }
                        });
                    }
                }
                $scope.framework = mapController.getFrameworkVersion(), $scope.mapAPI = {}, $scope.mapAPI.mapController = mapController;
                var layer, layerOptions = {};
                layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), layerOptions.layerType = layerOptions.layerType || layerOptions.bingLayerType, 
                validateBingLayerType(layerOptions.layerType) || ($log.warn("Invalid Bing layer type - " + layerOptions.layerType + ' used. Defaulting to "Road". Specify default Bing layer type in "geoConfig" - bingLayerType'), 
                layerOptions.layerType = "Road");
                var addLayerCallback = function() {
                    $scope.layerReady = !0;
                }, constructLayer = function() {
                    if ($scope.constructionInProgress = !0, layerOptions.mapElementId = mapController.getMapElementId(), 
                    $log.info("Bing " + layerOptions.layerType + " - constructing..."), null == layerOptions.bingApiKey) throw new Error("Missing Bing Maps API key. Please provide your valid Bing Maps API key using the geo-bing-layer attribute 'bing-api-key'");
                    layer = GeoLayerService.createBingLayer(layerOptions, $scope.framework), mapController.addLayer(layer).then(function(layerDto) {
                        $scope.layerDto = layerDto, addLayerCallback(), $log.info("construction complete..."), 
                        $scope.constructionInProgress = !1;
                    }, function(error) {
                        $scope.$emit(layerOptions.layerName + "_error", layerOptions), $scope.onError({
                            message: error,
                            layer: layerOptions
                        }), addLayerCallback(), $log.info("construction failed..."), $scope.constructionInProgress = !1;
                    });
                };
                attrs.$observe("visibility", function() {
                    $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setLayerVisibility($scope.layerDto.id, "true" === $scope.visibility);
                }), attrs.$observe("layerType", function() {
                    $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && $scope.initialiseLayer();
                }), $scope.initCount = 0, $scope.initialiseLayer = function() {
                    $log.info("initialising layer..."), null != $scope.layerDto ? reconstructLayer() : $scope.layerReady && $scope.constructionInProgress ? $log.info("...") : constructLayer();
                }, $scope.$on("$destroy", function() {
                    $scope.layerDto && mapController.removeLayerById($scope.layerDto.id), $(window).off("resize.Viewport");
                }), $scope.initialiseLayer();
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.vendor.google-layers", [ "geowebtoolkit.core.layer-services" ]);
    app.directive("geoGoogleLayer", [ "$timeout", "$compile", "GeoLayerService", "$log", function($timeout, $compile, GeoLayerService, $log) {
        var validGoogleLayerTypes = [ "street", "hybrid", "satellite", "terrain" ], validateGoogleLayerType = function(layerType) {
            for (var i = 0; i < validGoogleLayerTypes.length; i++) {
                var validType = validGoogleLayerTypes[i];
                if (validType === layerType.toLowerCase()) return !0;
            }
            return !1;
        };
        return {
            restrict: "E",
            require: "^geoMap",
            scope: {
                layerType: "@",
                visibility: "@",
                controllerEmitEventName: "@"
            },
            transclude: !1,
            controller: [ "$scope", function($scope) {
                var self = this;
                return $scope.controllerEmitEventName && $scope.$emit($scope.controllerEmitEventName, self), 
                self;
            } ],
            link: function($scope, element, attrs, mapController) {
                function reconstructLayer() {
                    $log.info("reconstructing layer...");
                    for (var allLAyers = mapController.getLayers(), layerIndex = null, i = 0; i < allLAyers.length; i++) if (allLAyers[i].id === $scope.layerDto.id) {
                        layerIndex = i;
                        break;
                    }
                    null != layerIndex && (mapController.removeLayerById($scope.layerDto.id), $scope.layerDto = null, 
                    layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), layerOptions.initialExtent = mapController.getInitialExtent(), 
                    layerOptions.format = $scope.format, layer = GeoLayerService.createGoogleLayer(layerOptions, $scope.framework), 
                    mapController.addLayer(layer).then(function(layerDto) {
                        if ($scope.layerDto = layerDto, addLayerCallback(), null != $scope.layerDto) {
                            var delta = layerIndex - mapController.getLayers().length + 1;
                            mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                        }
                    }));
                }
                $scope.framework = mapController.getFrameworkVersion(), $scope.mapAPI = {}, $scope.mapAPI.mapController = mapController;
                var layer, layerOptions = {};
                layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), layerOptions.layerType = layerOptions.layerType || layerOptions.googleLayerType, 
                validateGoogleLayerType(layerOptions.layerType) || ($log.warn("Invalid Google layer type - " + layerOptions.layerType + ' used. Defaulting to "Hybrid". Specify default Google layer type in "geoConfig" - googleLayerType'), 
                layerOptions.layerType = "Hybrid");
                var addLayerCallback = function() {
                    $scope.layerReady = !0;
                }, constructLayer = function() {
                    $scope.constructionInProgress = !0, layerOptions.mapElementId = mapController.getMapElementId(), 
                    $log.info("Google " + $scope.layerType + " - constructing..."), layer = GeoLayerService.createGoogleLayer(layerOptions, $scope.framework), 
                    mapController.addLayer(layer).then(function(layerDto) {
                        $scope.layerDto = layerDto, addLayerCallback(), $log.info("construction complete..."), 
                        $scope.constructionInProgress = !1;
                    }, function(error) {
                        $scope.$emit(layerOptions.layerName + "_error", layerOptions), $scope.onError({
                            message: error,
                            layer: layerOptions
                        }), addLayerCallback(), $log.info("construction failed..."), $scope.constructionInProgress = !1;
                    });
                };
                attrs.$observe("visibility", function() {
                    $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setLayerVisibility($scope.layerDto.id, "true" === $scope.visibility || $scope.visibility === !0);
                }), attrs.$observe("layerType", function() {
                    $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && $scope.initialiseLayer();
                }), $scope.initCount = 0, $scope.initialiseLayer = function() {
                    $log.info("initialising layer..."), null != $scope.layerDto ? reconstructLayer() : $scope.layerReady && $scope.constructionInProgress ? $log.info("...") : constructLayer();
                }, $scope.$on("$destroy", function() {
                    $scope.layerDto && mapController.removeLayerById($scope.layerDto.id), $(window).off("resize.Viewport");
                }), $scope.initialiseLayer();
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.vendor.osm-layers", [ "geowebtoolkit.core.layer-services" ]);
    app.directive("geoOsmLayer", [ "$timeout", "$compile", "GeoLayerService", "$log", function($timeout, $compile, GeoLayerService, $log) {
        return {
            restrict: "E",
            require: "^geoMap",
            scope: {
                wrapDateLine: "@",
                visibility: "@",
                controllerEmitEventName: "@"
            },
            transclude: !1,
            controller: [ "$scope", function($scope) {
                var self = this;
                return $scope.controllerEmitEventName && $scope.$emit($scope.controllerEmitEventName, self), 
                self;
            } ],
            link: function($scope, element, attrs, mapController) {
                function reconstructLayer() {
                    $log.info("reconstructing layer...");
                    for (var allLAyers = mapController.getLayers(), layerIndex = null, i = 0; i < allLAyers.length; i++) if (allLAyers[i].id === $scope.layerDto.id) {
                        layerIndex = i;
                        break;
                    }
                    null != layerIndex && (mapController.removeLayerById($scope.layerDto.id), $scope.layerDto = null, 
                    layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework), layerOptions.initialExtent = mapController.getInitialExtent(), 
                    layerOptions.format = $scope.format, layer = GeoLayerService.createLayer(layerOptions, $scope.framework), 
                    mapController.addLayer(layer).then(function(layerDto) {
                        if ($scope.layerDto = layerDto, addLayerCallback(), null != $scope.layerDto) {
                            var delta = layerIndex - mapController.getLayers().length + 1;
                            mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                        }
                    }));
                }
                $scope.framework = mapController.getFrameworkVersion(), $scope.mapAPI = {}, $scope.mapAPI.mapController = mapController;
                var layer, layerOptions = {};
                layerOptions = GeoLayerService.defaultLayerOptions(attrs, $scope.framework);
                var addLayerCallback = function() {
                    $scope.layerReady = !0;
                }, constructLayer = function() {
                    $scope.constructionInProgress = !0, layerOptions.mapElementId = mapController.getMapElementId(), 
                    $log.info("OpenStreetMaps Cycle - constructing..."), layer = GeoLayerService.createOsmLayer(layerOptions, $scope.framework), 
                    mapController.addLayer(layer).then(function(layerDto) {
                        $scope.layerDto = layerDto, addLayerCallback(), $log.info("construction complete..."), 
                        $scope.constructionInProgress = !1;
                    }, function(error) {
                        $scope.$emit(layerOptions.layerName + "_error", layerOptions), $scope.onError({
                            message: error,
                            layer: layerOptions
                        }), addLayerCallback(), $log.info("construction failed..."), $scope.constructionInProgress = !1;
                    });
                };
                attrs.$observe("visibility", function() {
                    $scope.layerReady && mapController && null != $scope.layerDto && $scope.layerDto.id && mapController.setLayerVisibility($scope.layerDto.id, "true" === $scope.visibility);
                }), $scope.initCount = 0, $scope.initialiseLayer = function() {
                    $log.info("initialising layer..."), null != $scope.layerDto ? reconstructLayer() : $scope.layerReady && $scope.constructionInProgress ? $log.info("...") : constructLayer();
                }, $scope.$on("$destroy", function() {
                    $scope.layerDto && mapController.removeLayerById($scope.layerDto.id), $(window).off("resize.Viewport");
                }), $scope.initialiseLayer();
            }
        };
    } ]);
}(), function() {
    "use strict";
    angular.module("geowebtoolkit.vendor-layers", [ "geowebtoolkit.vendor.google-layers", "geowebtoolkit.vendor.bing-layers", "geowebtoolkit.vendor.osm-layers" ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.mapservices.data.openlayersv2", []), olv2DataService = [ "$q", "$http", "geoConfig", function($q, $http, geoConfig) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var newBounds, projection = mapInstance.projection, bounds = mapInstance.getExtent(), bbox = bounds.toBBOX(), point = null != pointEvent && pointEvent instanceof MouseEvent ? pointEvent.xy : pointEvent, halfHeight = mapInstance.getSize().h / 2, halfWidth = mapInstance.getSize().w / 2, centerPoint = new OpenLayers.Geometry.Point(halfWidth, halfHeight), requestWidth = mapInstance.getSize().w, requestHeight = mapInstance.getSize().h, finalPoint = {
                x: point.x,
                y: point.y
            };
            if (mapInstance.getSize().w >= 2050) {
                if (point.x > centerPoint.x) if (point.y > centerPoint.y) {
                    var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, centerPoint.y)), bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(mapInstance.getSize().w, mapInstance.getSize().h));
                    newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat), 
                    finalPoint.x = point.x - halfWidth, finalPoint.y = point.y - halfHeight;
                } else {
                    var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, 0)), bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(mapInstance.getSize().w, mapInstance.getSize().h));
                    newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat), 
                    finalPoint.x = point.x - halfWidth;
                } else if (point.y > centerPoint.y) {
                    var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(0, centerPoint.y)), bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, mapInstance.getSize().h));
                    newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat), 
                    finalPoint.y = point.y - halfHeight;
                } else {
                    var topLeft = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(0, 0)), bottomRight = mapInstance.getLonLatFromPixel(new OpenLayers.Geometry.Point(centerPoint.x, centerPoint.y));
                    newBounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);
                }
                bbox = newBounds.toBBOX(), requestHeight = Math.floor(halfHeight), requestWidth = Math.floor(halfWidth);
            }
            return OpenLayers.Util.extend({
                service: "WMS",
                version: version,
                request: "GetFeatureInfo",
                bbox: bbox,
                feature_count: 100,
                height: requestHeight,
                width: requestWidth,
                format: OpenLayers.Format.WMSGetFeatureInfo,
                info_format: infoTextContentType
            }, parseFloat(version) >= 1.3 ? {
                crs: projection,
                i: parseInt(finalPoint.x),
                j: parseInt(finalPoint.y)
            } : {
                srs: projection,
                x: parseInt(finalPoint.x),
                y: parseInt(finalPoint.y)
            });
        }
        function resolveOpenLayersFormatConstructorByInfoFormat(infoFormat) {
            var result, infoType;
            switch (infoType = infoFormat && "string" == typeof infoFormat && 0 === infoFormat.indexOf("application/vnd.ogc.gml/3") ? "application/vnd.ogc.gml/3" : infoFormat) {
              case "application/vnd.ogc.gml":
                result = OpenLayers.Format.GML.v2;
                break;

              case "application/vnd.ogc.gml/3":
                result = OpenLayers.Format.GML.v3;
                break;

              case "text/html":
              case "text/plain":
                result = OpenLayers.Format.Text;
                break;

              case "application/json":
                result = OpenLayers.Format.GeoJSON;
                break;

              default:
                result = OpenLayers.Format.WMSGetFeatureInfo;
            }
            return result;
        }
        return {
            getLayersByWMSCapabilities: function(url) {
                var deferred = $q.defer(), getCapsUrl = url.indexOf("?") > 0 ? url + "&request=GetCapabilities" : url + "?request=GetCapabilities";
                return $http.get(getCapsUrl).success(function(data) {
                    var format = new OpenLayers.Format.WMSCapabilities(), response = format.read(data);
                    if (null == response || null == response.capability || null == response.capability.layers) deferred.reject("Response not recognised"); else {
                        var allLayers = format.read(data).capability.layers;
                        deferred.resolve(allLayers);
                    }
                }).error(function(data, status) {
                    deferred.reject(status);
                }), deferred.promise;
            },
            getWMSFeatures: function(mapInstance, url, layerNames, version, pointEvent, contentType) {
                var infoTextContentType = contentType || "text/xml", deferred = $q.defer(), params = generateRequestParams(mapInstance, pointEvent, version, infoTextContentType);
                0 !== layerNames.length && (params = OpenLayers.Util.extend({
                    layers: layerNames,
                    query_layers: layerNames
                }, params)), OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function(request) {
                        var format = new (resolveOpenLayersFormatConstructorByInfoFormat(infoTextContentType))(), features = format.read(request.responseText), geoJsonFormat = new OpenLayers.Format.GeoJSON(), geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                return geoConfig().defaultOptions.proxyHost && (requestParams.proxy = geoConfig().defaultOptions.proxyHost), 
                OpenLayers.Request.GET(requestParams), deferred.promise;
            },
            getWMSFeaturesByLayerId: function(mapInstance, url, layerId, point) {
                for (var getStyleNames = function(layer) {
                    var styleNames;
                    return styleNames = layer.params.STYLES ? layer.params.STYLES : OpenLayers.Util.isArray(layer.params.LAYERS) ? new Array(layer.params.LAYERS.length) : layer.params.LAYERS.toString().replace(/[^,]/g, "");
                }, deferred = $q.defer(), layerNames = [], styleNames = [], layers = [ mapInstance.getLayersBy("id", layerId)[0] ], i = 0, len = layers.length; len > i; i++) null != layers[i].params.LAYERS && (layerNames = layerNames.concat(layers[i].params.LAYERS), 
                styleNames = styleNames.concat(getStyleNames(layers[i])));
                var firstLayer = layers[0], projection = mapInstance.getProjection(), layerProj = firstLayer.projection;
                layerProj && layerProj.equals(mapInstance.getProjectionObject()) && (projection = layerProj.getCode());
                var params = OpenLayers.Util.extend({
                    service: "WMS",
                    version: firstLayer.params.VERSION,
                    request: "GetFeatureInfo",
                    exceptions: firstLayer.params.EXCEPTIONS,
                    bbox: mapInstance.getExtent().toBBOX(null, firstLayer.reverseAxisOrder()),
                    feature_count: 100,
                    height: mapInstance.getSize().h,
                    width: mapInstance.getSize().w,
                    format: OpenLayers.Format.WMSGetFeatureInfo,
                    info_format: firstLayer.params.INFO_FORMAT || "text/xml"
                }, parseFloat(firstLayer.params.VERSION) >= 1.3 ? {
                    crs: projection,
                    i: parseInt(point.x),
                    j: parseInt(point.y)
                } : {
                    srs: projection,
                    x: parseInt(point.x),
                    y: parseInt(point.y)
                });
                0 !== layerNames.length && (params = OpenLayers.Util.extend({
                    layers: layerNames,
                    query_layers: layerNames,
                    styles: styleNames
                }, params)), OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function(request) {
                        var format = new OpenLayers.Format.WMSGetFeatureInfo(), features = format.read(request.responseText), geoJsonFormat = new OpenLayers.Format.GeoJSON(), geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                return geoConfig().defaultOptions.proxyHost && (requestParams.proxy = geoConfig().defaultOptions.proxyHost), 
                OpenLayers.Request.GET(requestParams), deferred.promise;
            }
        };
    } ];
    app.service("WMSDataService", olv2DataService), app.service("olv2DataService", olv2DataService);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.mapservices.data.openlayersv3", []), olv2DataService = [ "$q", "$http", "geoConfig", function($q, $http, geoConfig) {
        function generateRequestParams(mapInstance, pointEvent, version, infoTextContentType) {
            var projection = mapInstance.getView().getProjection().getCode(), bounds = mapInstance.getView().calculateExtent(mapInstance.getSize()), olv2Bounds = new OpenLayers.Bounds(bounds[0], bounds[1], bounds[2], bounds[3]), bbox = olv2Bounds.toBBOX(), point = null != pointEvent && null != pointEvent.map ? pointEvent.pixel : pointEvent;
            null != point.position && (point = [ point.position.x, point.position.y ]);
            var newBounds, halfHeight = mapInstance.getSize()[1] / 2, halfWidth = mapInstance.getSize()[0] / 2, centerPoint = [ halfWidth, halfHeight ], requestWidth = mapInstance.getSize()[0], requestHeight = mapInstance.getSize()[1], finalPoint = {
                x: point[0],
                y: point[1]
            };
            if (mapInstance.getSize()[0] >= 2050) {
                if (point[0] > centerPoint[0]) if (point[1] > centerPoint[1]) {
                    var topLeft = mapInstance.getCoordinateFromPixel([ centerPoint[0], centerPoint[1] ]), bottomRight = mapInstance.getCoordinateFromPixel([ mapInstance.getSize()[0], mapInstance.getSize()[1] ]);
                    newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]), 
                    finalPoint.x = point[0] - halfWidth, finalPoint.y = point[1] - halfHeight;
                } else {
                    var topLeft = mapInstance.getCoordinateFromPixel([ centerPoint[0], 0 ]), bottomRight = mapInstance.getCoordinateFromPixel([ mapInstance.getSize()[0], mapInstance.getSize()[1] ]);
                    newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]), 
                    finalPoint.x = point[0] - halfWidth;
                } else if (point[1] > centerPoint[1]) {
                    var topLeft = mapInstance.getCoordinateFromPixel([ 0, centerPoint[1] ]), bottomRight = mapInstance.getCoordinateFromPixel([ centerPoint[0], mapInstance.getSize()[1] ]);
                    newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]), 
                    finalPoint.y = point[1] - halfHeight;
                } else {
                    var topLeft = mapInstance.getCoordinateFromPixel([ 0, 0 ]), bottomRight = mapInstance.getCoordinateFromPixel([ centerPoint[0], centerPoint[1] ]);
                    newBounds = new OpenLayers.Bounds(topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]);
                }
                bbox = newBounds.toBBOX(), requestHeight = Math.floor(halfHeight), requestWidth = Math.floor(halfWidth);
            }
            var params = OpenLayers.Util.extend({
                service: "WMS",
                version: version,
                request: "GetFeatureInfo",
                bbox: bbox,
                feature_count: 100,
                height: requestHeight,
                width: requestWidth,
                format: OpenLayers.Format.WMSGetFeatureInfo,
                info_format: infoTextContentType
            }, parseFloat(version) >= 1.3 ? {
                crs: projection,
                i: parseInt(finalPoint.x),
                j: parseInt(finalPoint.y)
            } : {
                srs: projection,
                x: parseInt(finalPoint.x),
                y: parseInt(finalPoint.y)
            });
            return params;
        }
        function resolveOpenLayersFormatConstructorByInfoFormat(infoFormat) {
            var result, infoType;
            switch (infoType = infoFormat && "string" == typeof infoFormat && 0 === infoFormat.indexOf("application/vnd.ogc.gml/3") ? "application/vnd.ogc.gml/3" : infoFormat) {
              case "application/vnd.ogc.gml":
                result = OpenLayers.Format.GML.v2;
                break;

              case "application/vnd.ogc.gml/3":
                result = OpenLayers.Format.GML.v3;
                break;

              case "text/html":
              case "text/plain":
                result = OpenLayers.Format.Text;
                break;

              case "application/json":
                result = OpenLayers.Format.GeoJSON;
                break;

              default:
                result = OpenLayers.Format.WMSGetFeatureInfo;
            }
            return result;
        }
        return {
            getLayersByWMSCapabilities: function(url) {
                var deferred = $q.defer(), getCapsUrl = url.indexOf("?") > 0 ? url + "&request=GetCapabilities" : url + "?request=GetCapabilities";
                return $http.get(getCapsUrl).success(function(data) {
                    var format = new OpenLayers.Format.WMSCapabilities(), allLayers = format.read(data).capability.layers;
                    deferred.resolve(allLayers);
                }).error(function(data, status) {
                    deferred.reject(status);
                }), deferred.promise;
            },
            getWMSFeatures: function(mapInstance, url, layerNames, version, pointEvent, contentType) {
                var infoTextContentType = contentType || "text/xml", deferred = $q.defer(), params = generateRequestParams(mapInstance, pointEvent, version, infoTextContentType);
                0 !== layerNames.length && (params = OpenLayers.Util.extend({
                    layers: layerNames,
                    query_layers: layerNames
                }, params)), OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function(request) {
                        var format = new (resolveOpenLayersFormatConstructorByInfoFormat(infoTextContentType))(), features = format.read(request.responseText), geoJsonFormat = new OpenLayers.Format.GeoJSON(), geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                return geoConfig().defaultOptions.proxyHost && (requestParams.proxy = geoConfig().defaultOptions.proxyHost), 
                OpenLayers.Request.GET(requestParams), deferred.promise;
            },
            getWMSFeaturesByLayerId: function(mapInstance, url, layerId, point) {
                for (var getStyleNames = function(layer) {
                    var styleNames;
                    return styleNames = layer.getParams().STYLES ? layer.getParams().STYLES : OpenLayers.Util.isArray(layer.getParams().LAYERS) ? new Array(layer.getParams().LAYERS.length) : layer.getParams().LAYERS.toString().replace(/[^,]/g, "");
                }, deferred = $q.defer(), layerNames = [], styleNames = [], layers = [ mapInstance.getLayersBy("id", layerId)[0] ], i = 0, len = layers.length; len > i; i++) null != layers[i].getParams().LAYERS && (layerNames = layerNames.concat(layers[i].getParams().LAYERS), 
                styleNames = styleNames.concat(getStyleNames(layers[i])));
                var firstLayer = layers[0], projection = mapInstance.getView().getProjection().getCode(), params = OpenLayers.Util.extend({
                    service: "WMS",
                    version: firstLayer.getParams().VERSION,
                    request: "GetFeatureInfo",
                    bbox: mapInstance.getExtent().toBBOX(null),
                    feature_count: 100,
                    height: mapInstance.getSize()[1],
                    width: mapInstance.getSize()[0],
                    format: OpenLayers.Format.WMSGetFeatureInfo,
                    info_format: firstLayer.params.INFO_FORMAT || "text/xml"
                }, parseFloat(firstLayer.params.VERSION) >= 1.3 ? {
                    crs: projection,
                    i: parseInt(point.x),
                    j: parseInt(point.y)
                } : {
                    srs: projection,
                    x: parseInt(point.x),
                    y: parseInt(point.y)
                });
                0 !== layerNames.length && (params = OpenLayers.Util.extend({
                    layers: layerNames,
                    query_layers: layerNames,
                    styles: styleNames
                }, params)), OpenLayers.Util.applyDefaults(params, {});
                var requestParams = {
                    url: url,
                    params: OpenLayers.Util.upperCaseObject(params),
                    callback: function(request) {
                        var format = new OpenLayers.Format.WMSGetFeatureInfo(), features = format.read(request.responseText), geoJsonFormat = new OpenLayers.Format.GeoJSON(), geoJsonFeatures = angular.fromJson(geoJsonFormat.write(features));
                        deferred.resolve(geoJsonFeatures);
                    },
                    scope: this
                };
                return geoConfig().defaultOptions.proxyHost && (requestParams.proxy = geoConfig().defaultOptions.proxyHost), 
                OpenLayers.Request.GET(requestParams), deferred.promise;
            }
        };
    } ];
    app.service("olv3DataService", olv2DataService);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.events-openlayers3", []);
    app.service("ol3CesiumEventManager", [ function() {
        function updateToolkitMapInstanceProperty(mapInstance, propertyName, propertyValue) {
            var _geowebtoolkit = mapInstance.get("_geowebtoolkit") || {};
            _geowebtoolkit[propertyName] = propertyValue, mapInstance.set("_geowebtoolkit", _geowebtoolkit);
        }
        function getToolkitMapInstanceProperty(mapInstance, propertyName) {
            var result = null;
            if (mapInstance.get("_geowebtoolkit")) {
                var temp = mapInstance.get("_geowebtoolkit");
                result = temp[propertyName];
            }
            return result;
        }
        return {
            registerMapMouseMove: function(mapInstance, cesiumAdapter, callback) {
                var existingEvent = getToolkitMapInstanceProperty(mapInstance, "registerMapMouseMove");
                existingEvent && $(mapInstance.getViewport()).un(callback), updateToolkitMapInstanceProperty(mapInstance, "registerMapMouseMove", callback), 
                $(mapInstance.getViewport()).on("mousemove", callback);
            },
            registerMapMouseMoveEnd: function(mapInstance, cesiumAdapter, callback) {
                $(mapInstance.getViewport()).on("mousemove", function(obj, e) {
                    var existingTimeout = getToolkitMapInstanceProperty(mapInstance, "mousemoveTimeout");
                    existingTimeout && window.clearTimeout(existingTimeout), existingTimeout = window.setTimeout(function() {
                        callback(obj, e);
                    }, 100), updateToolkitMapInstanceProperty(mapInstance, "mousemoveTimeout", existingTimeout);
                });
            },
            registerMapClick: function() {},
            unRegisterMapClick: function() {},
            registerMapEvent: function() {},
            unRegisterMapEvent: function() {},
            switchTo3dView: function() {},
            switchTo2dView: function() {},
            registerControlEvent: function() {},
            unRegisterControlEvent: function() {}
        };
    } ]);
}();

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, google = google || {}, app = angular.module("geowebtoolkit.mapservices.layer.openlayersv2", []);

app.service("olv2LayerService", [ "$log", "$q", "$timeout", function($log, $q, $timeout) {
    "use strict";
    var service = {
        xyzTileCachePath: "/tile/${z}/${y}/${x}",
        createLayer: function(args) {
            var layer;
            switch (args.layerType.toLowerCase()) {
              case "wms":
                layer = service.createWMSLayer(args);
                break;

              case "xyztilecache":
                layer = service.createXYZLayer(args);
                break;

              case "arcgiscache":
                layer = service.createArcGISCacheLayer(args);
                break;

              case "vector":
                layer = service.createFeatureLayer(args);
                break;

              case "googlestreet":
              case "googlehybrid":
              case "googlesatellite":
              case "googleterrain":
                layer = service.createGoogleMapsLayer(args);
                break;

              case "markerlayer":
                layer = service.createMarkerLayer(args);
                break;

              default:
                throw new Error("Invalid layerType used to create layer of name " + args.layerName + " - with layerType - " + args.layerType);
            }
            return layer.geoLayerType = args.layerType, layer;
        },
        createGoogleLayer: function(args) {
            if (null == args.layerType) throw new Error("'layerType' not specified for creating a Google Maps layer. Please specify a valid layer type, eg 'hybrid");
            var googleLayerType;
            switch (args.layerType.toLocaleLowerCase()) {
              case "googlehybrid":
              case "hybrid":
                googleLayerType = google.maps.MapTypeId.HYBRID;
                break;

              case "googlesatellite":
              case "satellite":
                googleLayerType = google.maps.MapTypeId.SATELLITE;
                break;

              case "googlestreet":
              case "street":
                googleLayerType = google.maps.MapTypeId.STREET;
                break;

              case "googleterrain":
              case "terrain":
                googleLayerType = google.maps.MapTypeId.TERRAIN;
                break;

              default:
                googleLayerType = google.maps.MapTypeId.HYBRID;
            }
            var options = {
                visibility: args.visibility === !0 || "true" === args.visibility,
                type: googleLayerType
            };
            return new OpenLayers.Layer.Google(args.layerType, options);
        },
        createBingLayer: function(args) {
            var bingLayerType, bingLayerName = args.layerName;
            switch (args.layerType.toLocaleLowerCase()) {
              case "aerial":
                bingLayerType = "Aerial", bingLayerName = bingLayerName || "Bing Aerial";
                break;

              case "aerialwithlabels":
                bingLayerType = "AerialWithLabels", bingLayerName = bingLayerName || "Bing Aerial With Labels";
                break;

              case "birdseye":
                bingLayerType = "Birdseye", bingLayerName = bingLayerName || "Bing Birdseye";
                break;

              case "birdseyewithlabels":
                bingLayerType = "BirdseyeWithLabels", bingLayerName = bingLayerName || "Bing Birdseye With Labels";
                break;

              case "road":
                bingLayerType = "Road", bingLayerName = bingLayerName || "Bing Roads";
                break;

              default:
                bingLayerType = "Road", bingLayerName = bingLayerName || "Bing Roads";
            }
            var result = new OpenLayers.Layer.Bing({
                key: args.bingApiKey,
                type: bingLayerType,
                name: bingLayerName,
                visibility: args.visibility === !0 || "true" === args.visibility
            });
            return result.wrapDateLine = args.wrapDateLine || !1, result;
        },
        createOsmLayer: function(args) {
            var result = new OpenLayers.Layer.OSM(args.layerName || "OpenCycleMap");
            return result.wrapDateLine = args.wrapDateLine || !1, result.visibility = args.visibility === !0 || "true" === args.visibility, 
            result;
        },
        createFeatureLayer: function(args) {
            var layer;
            return null == args.url ? layer = new OpenLayers.Layer.Vector(args.layerName) : (service.postAddLayerCache = service.postAddLayerCache || [], 
            layer = new OpenLayers.Layer.Vector(args.layerName, {
                strategies: [ new OpenLayers.Strategy.Fixed() ],
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style({
                        pointRadius: "10",
                        fillOpacity: .6,
                        fillColor: "#ffcc66",
                        strokeColor: "#cc6633"
                    }),
                    select: {
                        fillColor: "#8aeeef"
                    }
                }),
                protocol: new OpenLayers.Protocol.WFS({
                    url: args.url,
                    featureType: args.wfsFeatureType,
                    featurePrefix: args.wfsFeaturePrefix,
                    version: args.wfsVersion,
                    geometryName: args.wfsGeometryName,
                    srsName: args.datumProjection
                }),
                visibility: args.visibility
            })), null != args.postAddLayer && (service.postAddLayerCache[layer.id] = args.postAddLayer), 
            layer;
        },
        setFeatureStyle: function() {},
        createMarkerLayer: function(args) {
            return new OpenLayers.Layer.Markers(args.layerName);
        },
        createGoogleMapsLayer: function(args) {
            var googleLayerType;
            switch (args.layerType) {
              case "GoogleStreet":
                googleLayerType = google.maps.MapTypeId.STREET;
                break;

              case "GoogleHybrid":
                googleLayerType = google.maps.MapTypeId.HYBRID;
                break;

              case "GoogleSatellite":
                googleLayerType = google.maps.MapTypeId.SATELLITE;
                break;

              case "GoogleTerrain":
                googleLayerType = google.maps.MapTypeId.TERRAIN;
            }
            var options = {
                wrapDateLine: args.wrapDateLine,
                transitionEffect: args.transitionEffect,
                visibility: args.visibility === !0 || "true" === args.visibility,
                isBaseLayer: args.isBaseLayer === !0 || "true" === args.isBaseLayer,
                tileSize: args.tileSize(args.tileType),
                sphericalMercator: args.sphericalMercator,
                centerPosition: args.centerPosition,
                attribution: args.layerAttribution,
                numZoomLevels: 20,
                type: googleLayerType,
                animationEnabled: !0
            };
            return new OpenLayers.Layer.Google(args.layerName, options);
        },
        clearFeatureLayer: function(mapInstance, layerId) {
            var layer = service.getLayerById(mapInstance, layerId);
            layer ? layer.removeAllFeatures() : $log.error('clearFeatureLayer: Layer "' + layerId + '" not found.');
        },
        createXYZLayer: function(args) {
            var resultArgs = {
                layerName: args.layerName,
                layerUrl: args.layerUrl,
                options: {
                    wrapDateLine: args.wrapDateLine,
                    transitionEffect: args.transitionEffect,
                    visibility: args.visibility === !0 || "true" === args.visibility,
                    isBaseLayer: args.isBaseLayer === !0 || "true" === args.isBaseLayer,
                    tileSize: args.tileSize(args.tileType),
                    sphericalMercator: args.sphericalMercator,
                    centerPosition: args.centerPosition,
                    attribution: args.layerAttribution,
                    opacity: args.opacity
                }
            };
            return resultArgs.options.isBaseLayer && (args.resolutions && (resultArgs.options.resolutions = args.resolutions), 
            args.zoomOffset && (resultArgs.options.zoomOffset = args.zoomOffset)), null != args.maxZoomLevel && args.maxZoomLevel.length > 0 && (resultArgs.options.numZoomLevels = parseInt(args.maxZoomLevel)), 
            new OpenLayers.Layer.XYZ(resultArgs.layerName, resultArgs.layerUrl + service.xyzTileCachePath, resultArgs.options);
        },
        createWMSLayer: function(args) {
            var resultArgs = {
                layerName: args.layerName,
                layerUrl: args.layerUrl,
                layers: args.layers,
                wrapDateLine: args.wrapDateLine,
                visibility: args.visibility === !0 || "true" === args.visibility,
                isBaseLayer: args.isBaseLayer === !0 || "true" === args.isBaseLayer,
                transitionEffect: args.transitionEffect,
                tileSize: args.tileSize(args.tileType),
                sphericalMercator: args.sphericalMercator,
                tileType: args.tileType,
                projection: args.datumProjection,
                transparent: args.transparent,
                attribution: args.layerAttribution,
                opacity: args.opacity
            };
            return null != args.maxZoomLevel && args.maxZoomLevel.length > 0 && (resultArgs.numZoomLevels = parseInt(args.maxZoomLevel)), 
            new OpenLayers.Layer.WMS(resultArgs.layerName, resultArgs.layerUrl, {
                layers: resultArgs.layers,
                format: resultArgs.format,
                transparent: resultArgs.transparent
            }, resultArgs);
        },
        createArcGISCacheLayer: function(args) {
            var deferred = $q.defer(), jsonp = new OpenLayers.Protocol.Script(), scriptTimeout = $timeout(function() {
                deferred.reject("LayerTimeout");
            }, 1e4);
            return jsonp.createRequest(args.layerUrl, {
                f: "json",
                pretty: "true"
            }, function(data) {
                if ($timeout.cancel(scriptTimeout), null != data.error && null != data.error.code) return void deferred.reject("LayerError - " + data.error.code);
                var resultArgs = {
                    layerName: args.layerName,
                    layerUrl: args.layerUrl,
                    options: {
                        transitionEffect: args.transitionEffect,
                        visibility: args.visibility === !0 || "true" === args.visibility,
                        isBaseLayer: args.isBaseLayer === !0 || "true" === args.isBaseLayer,
                        tileSize: args.tileSize(),
                        alwaysInRange: !1,
                        displayInLayerSwitcher: !1,
                        opacity: args.opacity,
                        attribution: args.layerAttribution
                    }
                };
                null != args.maxZoomLevel && args.maxZoomLevel.length > 0 && (resultArgs.options.numZoomLevels = parseInt(args.maxZoomLevel)), 
                data && (resultArgs.options.layerInfo = data, null == resultArgs.options.numZoomLevels && (resultArgs.options.numZoomLevels = data.tileInfo.lods.length + 1));
                var layerResult = new OpenLayers.Layer.ArcGISCache(resultArgs.layerName, resultArgs.layerUrl, resultArgs.options);
                deferred.resolve(layerResult);
            }), deferred.promise;
        },
        defaultLayerOptions: function(args, config) {
            var layerOptions = angular.extend(config.defaultOptions, args);
            return layerOptions.centerPosition = service.parselatLong(layerOptions.centerPosition), 
            layerOptions;
        },
        cleanupLayer: function(mapInstance, layerId) {
            if (null != mapInstance.layers && 0 !== mapInstance.layers.length) {
                var layer = service.getLayerById(mapInstance, layerId);
                null != layer && mapInstance.removeLayer(layer);
            }
        },
        createFeature: function(mapInstance, geoJson) {
            var reader;
            return reader = mapInstance.projection !== geoJson.crs.properties.name ? new OpenLayers.Format.GeoJSON({
                externalProjection: geoJson.crs.properties.name,
                internalProjection: mapInstance.projection
            }) : new OpenLayers.Format.GeoJSON(), reader.read(angular.toJson(geoJson), geoJson.type);
        },
        addFeatureToLayer: function(mapInstance, layerId, feature) {
            var layer = service.getLayerById(mapInstance, layerId);
            layer.addFeatures(feature instanceof Array ? feature : [ feature ]);
            var writer = new OpenLayers.Format.GeoJSON(), featureDto = angular.fromJson(writer.write(feature));
            return featureDto.id = feature.id, featureDto;
        },
        parselatLong: function(latlong) {
            return latlong ? angular.fromJson(latlong) : null;
        },
        getLayerById: function(mapInstance, layerId) {
            for (var currentLayer, i = 0; i < mapInstance.layers.length; i++) if (mapInstance.layers[i].id === layerId) {
                currentLayer = mapInstance.layers[i];
                break;
            }
            return currentLayer;
        },
        removeLayerByName: function(mapInstance, layerName) {
            var layers = mapInstance.getLayersByName(layerName);
            layers.length > 0 && mapInstance.removeLayer(layers[0]);
        },
        removeLayersByName: function(mapInstance, layerName) {
            for (var layers = mapInstance.getLayersByName(layerName), i = 0; i < layers.length; i++) mapInstance.removeLayer(layers[i]);
        },
        removeLayer: function(mapInstance, layerInstance) {
            mapInstance.removeLayer(layerInstance);
        },
        removeLayerById: function(mapInstance, layerId) {
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            mapInstance.removeLayer(layer);
        },
        removeFeatureFromLayer: function(mapInstance, layerId, featureId) {
            var layer = mapInstance.getLayersBy("id", layerId)[0], feature = layer.getFeatureById(featureId);
            layer.removeFeatures(feature);
        },
        registerFeatureSelected: function(mapInstance, layerId, callback, element) {
            var layerProtocol, layer = mapInstance.getLayersBy("id", layerId)[0], layerType = layer.geoLayerType;
            "WMS" === layerType && (layerProtocol = OpenLayers.Protocol.WFS.fromWMSLayer(layer));
            var control = mapInstance.getControl("ctrlGetFeature");
            return control && mapInstance.removeControl(control), control = new OpenLayers.Control.GetFeature({
                protocol: layerProtocol,
                box: !0,
                hover: !0,
                multipleKey: "shiftKey",
                toggleKey: "ctrlKey"
            }), control.metadata = control.metadata || {}, control.metadata.type = "getfeature", 
            control.events.register("featureselected", element, callback), {
                id: "ctrlGetFeature",
                name: "getfeature"
            };
        },
        registerLayerEvent: function(mapInstance, layerId, eventName, callback) {
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            null == layer ? $log.warn('registerLayerEvent: Layer not found - "' + layerId + '"') : layer.events.register(eventName, layer, callback);
        },
        unRegisterLayerEvent: function(mapInstance, layerId, eventName, callback) {
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            null == layer ? $log.warn('unRegisterLayerEvent: Layer not found - "' + layerId + '"') : layer.events.unregister(eventName, layer, callback);
        },
        getMarkerCountForLayerName: function(mapInstance, layerName) {
            var layers = mapInstance.getLayersByName(layerName), count = 0;
            return layers.length > 0 && (count = null == layers[0].markers ? 0 : layers[0].markers.length), 
            count;
        },
        filterFeatureLayer: function(mapInstance, layerId, filterValue, featureAttributes) {
            for (var layer = service.getLayerById(mapInstance, layerId), filterArray = service.parseFeatureAttributes(featureAttributes), olFilters = [], i = 0; i < filterArray.length; i++) olFilters.push(new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: filterArray[i],
                matchCase: !1,
                value: filterValue.toUpperCase() + "*"
            }));
            var filter = new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.OR,
                filters: olFilters
            });
            1 === filter.filters.length ? (layer.filter = olFilters[0], layer.refresh({
                force: !0
            })) : (layer.filter = filter, layer.refresh({
                force: !0
            }));
        },
        parseFeatureAttributes: function(featureAttributes) {
            if (!featureAttributes) return null;
            var results = [];
            return -1 === featureAttributes.indexOf(",") ? results.push(featureAttributes) : results = featureAttributes.split(","), 
            results;
        },
        getLayerFeatures: function(mapInstance, layerId) {
            for (var features = [], layer = service.getLayerById(mapInstance, layerId), i = 0; i < layer.features.length; i++) features.push(layer.features[i]);
            return features;
        },
        raiseLayerDrawOrder: function(mapInstance, layerId, delta) {
            var layer = service.getLayerById(mapInstance, layerId);
            mapInstance.raiseLayer(layer, delta);
        },
        postAddLayerCache: {}
    };
    return service;
} ]), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.mapservices.layer.openlayersv3", []);
    app.service("olv3LayerService", [ "$log", "$q", "$timeout", "GeoLayer", "GeoUtils", function($log, $q, $timeout, GeoLayer, GeoUtils) {
        var service = {
            xyzTileCachePath: "/tile/{z}/{y}/{x}",
            createLayer: function(args) {
                var layer;
                switch (args.layerType) {
                  case "WMS":
                    layer = service.createWMSLayer(args);
                    break;

                  case "XYZTileCache":
                    layer = service.createXYZLayer(args);
                    break;

                  case "ArcGISCache":
                    layer = service.createArcGISCacheLayer(args);
                    break;

                  case "Vector":
                    layer = service.createFeatureLayer(args);
                    break;

                  case "markerlayer":
                    layer = service.createMarkerLayer(args);
                    break;

                  case "GoogleStreet":
                  case "GoogleHybrid":
                  case "GoogleSatellite":
                  case "GoogleTerrain":
                    throw new Error("Google map layers are not supported with OpenLayers 3. To use a Google maps layer, consider falling back to framework 'olv2'.");

                  default:
                    throw new Error("Invalid layerType used to create layer of name " + args.layerName + " - with layerType - " + args.layerType);
                }
                return layer.set("geoLayerType", args.layerType), args.maxZoomLevel && (layer.geoMaxZoom = parseInt(args.maxZoomLevel)), 
                args.minZoomLevel && (layer.geoMinZoom = parseInt(args.minZoomLevel)), layer;
            },
            createFeatureLayer: function(args) {
                var layer;
                if (null == args.url) layer = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    format: new ol.format.GeoJSON()
                }); else {
                    service.postAddLayerCache = service.postAddLayerCache || [];
                    {
                        new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: "rgba(255, 255, 255, 0.6)"
                            }),
                            stroke: new ol.style.Stroke({
                                color: "#319FD3",
                                width: 1
                            }),
                            text: new ol.style.Text({
                                font: "12px Calibri,sans-serif",
                                fill: new ol.style.Fill({
                                    color: "#000"
                                }),
                                stroke: new ol.style.Stroke({
                                    color: "#fff",
                                    width: 3
                                })
                            })
                        });
                    }
                    layer = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            url: args.url,
                            format: new ol.format.GeoJSON(),
                            style: args.style
                        })
                    });
                }
                return layer.set("name", args.layerName), layer.set("isBaseLayer", args.isBaseLayer || !1), 
                layer;
            },
            setFeatureStyle: function(featureInstance, styleArgs) {
                var style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: styleArgs.radius,
                        fill: new ol.style.Fill({
                            color: GeoUtils.convertHexAndOpacityToRgbArray(styleArgs.color, styleArgs.opacity)
                        }),
                        stroke: new ol.style.Stroke({
                            color: GeoUtils.convertHexAndOpacityToRgbArray(styleArgs.color, styleArgs.opacity),
                            width: styleArgs.radius
                        })
                    })
                });
                featureInstance.setStyle(style);
            },
            createMarkerLayer: function(args) {
                var result = new ol.layer.Vector({
                    source: new ol.source.Vector(),
                    format: new ol.format.GeoJSON()
                });
                return result.set("name", args.layerName), result;
            },
            createGoogleLayer: function() {
                throw new Error("Google map layers are not supported with OpenLayers 3. To use a Google maps layer, consider falling back to framework 'olv2'.");
            },
            createBingLayer: function(args) {
                var bingLayerType, bingLayerName = args.layerName;
                switch (args.layerType.toLocaleLowerCase()) {
                  case "aerial":
                    bingLayerType = "Aerial", bingLayerName = bingLayerName || "Bing Aerial";
                    break;

                  case "aerialwithlabels":
                    bingLayerType = "AerialWithLabels", bingLayerName = bingLayerName || "Bing Aerial With Labels";
                    break;

                  case "birdseye":
                    bingLayerType = "Birdseye", bingLayerName = bingLayerName || "Bing Birdseye";
                    break;

                  case "birdseyewithlabels":
                    bingLayerType = "BirdseyeWithLabels", bingLayerName = bingLayerName || "Bing Birdseye With Labels";
                    break;

                  case "road":
                    bingLayerType = "Road", bingLayerName = bingLayerName || "Bing Roads";
                    break;

                  default:
                    bingLayerType = "Road";
                }
                var layer = new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        key: args.bingApiKey,
                        imagerySet: bingLayerType
                    })
                });
                return layer.set("name", bingLayerName), layer.setVisible(args.visibility === !0 || "true" === args.visibility), 
                layer;
            },
            createOsmLayer: function(args) {
                var layer = new ol.layer.Tile({
                    source: new ol.source.OSM()
                });
                return layer.setVisible(args.visibility === !0 || "true" === args.visibility), layer;
            },
            clearFeatureLayer: function(mapInstance, layerId) {
                var layer = service.getLayerById(mapInstance, layerId);
                layer.getSource().clear();
            },
            createXYZLayer: function(args) {
                var sourceOptions = {
                    url: args.layerUrl + service.xyzTileCachePath,
                    crossOrigin: "*/*"
                };
                null != args.layerAttribution && (sourceOptions.attributions = [ new ol.Attribution({
                    html: args.layerAttribution
                }) ]);
                var layerOptions = {
                    opacity: args.opacity,
                    source: new ol.source.XYZ(sourceOptions),
                    visible: args.visibility === !0 || "true" === args.visibility
                }, result = new ol.layer.Tile(layerOptions);
                return result.set("name", args.layerName), result.set("isBaseLayer", args.isBaseLayer || !1), 
                result;
            },
            createWMSLayer: function(args) {
                var sourceOptions = {};
                sourceOptions.url = args.layerUrl, sourceOptions.params = {
                    LAYERS: args.layers,
                    TILED: !0
                }, args.format && (sourceOptions.params.FORMAT = args.format), sourceOptions.wrapX = !0, 
                null != args.wrapDateLine && (sourceOptions.wrapX = "true" === args.wrapDateLine || args.wrapDateLine === !0), 
                sourceOptions.serverType = "mapserver", null != args.layerAttribution && (sourceOptions.attributions = [ new ol.Attribution({
                    html: args.layerAttribution
                }) ]);
                var wmsSource = new ol.source.TileWMS(sourceOptions), layerOptions = {};
                layerOptions.source = wmsSource, layerOptions.visible = "true" === args.visibility || args.visibility === !0, 
                layerOptions.opacity = args.opacity;
                var result = new ol.layer.Tile(layerOptions);
                return result.set("name", args.layerName), result.set("isBaseLayer", args.isBaseLayer || !1), 
                result;
            },
            createArcGISCacheLayer: function(args) {
                var url = args.layerUrl + service.xyzTileCachePath, sourceOptions = {
                    crossOrigin: "*/*",
                    url: url
                }, layerOptions = {
                    opacity: args.opacity,
                    source: new ol.source.XYZ(sourceOptions),
                    visible: args.visibility === !0 || "true" === args.visibility
                }, result = new ol.layer.Tile(layerOptions);
                return result.set("name", args.layerName), result.set("isBaseLayer", args.isBaseLayer || !1), 
                result;
            },
            defaultLayerOptions: function(args, config) {
                var layerOptions = angular.extend(config.defaultOptions, args);
                return layerOptions.centerPosition = service.parselatLong(layerOptions.centerPosition), 
                layerOptions;
            },
            cleanupLayer: function(mapInstance, layerId) {
                var layer = service.getLayerBy(mapInstance, "id", layerId);
                null != layer && mapInstance.removeLayer(layer);
            },
            createFeature: function(mapInstance, geoJson) {
                var reader;
                return reader = new ol.format.GeoJSON(), reader.readFeature(JSON.stringify(geoJson), {
                    dataProjection: ol.proj.get(geoJson.crs.properties.name),
                    featureProjection: mapInstance.getView().getProjection()
                });
            },
            addFeatureToLayer: function(mapInstance, layerId, feature) {
                var layer = service.getLayerById(mapInstance, layerId), source = layer.getSource();
                if ("function" != typeof source.getFeatures) throw new Error("Layer does not have a valid source for features.");
                var featureJson, writer = new ol.format.GeoJSON();
                feature instanceof Array ? (source.addFeatures(feature), featureJson = writer.writeFeatures(feature)) : (source.addFeature(feature), 
                featureJson = writer.writeFeature(feature));
                var featureDto = angular.fromJson(featureJson);
                return feature.setId(feature.getId() || GeoUtils.generateUuid()), featureDto.id = feature.getId(), 
                featureDto;
            },
            parselatLong: function(latlong) {
                return latlong ? angular.fromJson(latlong) : null;
            },
            getLayerById: function(mapInstance, layerId) {
                return service.getLayerBy(mapInstance, "id", layerId);
            },
            getLayerBy: function(mapInstance, propertyName, propertyValue) {
                var layer = null, foundResult = !1;
                return mapInstance.getLayers().forEach(function(lyr) {
                    propertyValue === lyr.get(propertyName) && foundResult === !1 && (layer = lyr, foundResult = !0);
                }), layer;
            },
            getLayerByName: function(mapInstance, layerName) {
                return service.getLayerBy(mapInstance, "name", layerName);
            },
            getLayersBy: function(mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers(), results = [];
                return layers.forEach(function(layer) {
                    var propVal = layer.get(propertyName);
                    propVal && -1 !== propVal.indexOf(propertyValue) && results.push(GeoLayer.fromOpenLayersV3Layer(layer));
                }), results;
            },
            _getLayersBy: function(mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers(), results = [];
                return layers.forEach(function(layer) {
                    var propVal = layer.get(propertyName);
                    propVal && -1 !== propVal.indexOf(propertyValue) && results.push(layer);
                }), results;
            },
            removeLayerByName: function(mapInstance, layerName) {
                var layers = service._getLayersBy(mapInstance, "name", layerName);
                layers.length > 0 && mapInstance.removeLayer(layers[0]);
            },
            removeLayersByName: function(mapInstance, layerName) {
                for (var layers = service._getLayersBy(mapInstance, "name", layerName), i = 0; i < layers.length; i++) mapInstance.removeLayer(layers[i]);
            },
            removeLayer: function(mapInstance, layerInstance) {
                mapInstance.removeLayer(layerInstance);
            },
            removeLayerById: function(mapInstance, layerId) {
                var layer = service._getLayersBy(mapInstance, "id", layerId)[0];
                mapInstance.removeLayer(layer);
            },
            removeFeatureFromLayer: function(mapInstance, layerId, featureId) {
                for (var layer = service.getLayerById(mapInstance, layerId), features = layer.getSource().getFeatures(), i = 0; i < features.length; i++) {
                    var feature = features[i];
                    if (feature.id === featureId) {
                        layer.getSource().removeFeature(feature);
                        break;
                    }
                }
            },
            registerFeatureSelected: function(mapInstance, layerId, callback) {
                service.registeredInteractions = service.registeredInteractions || [];
                for (var i = 0; i < service.registeredInteractions.length; i++) {
                    var interaction = service.registeredInteractions[i];
                    interaction.id === "" + layerId + "_features" && mapInstance.removeInteraction(interaction.select);
                }
                var selectClick = new ol.interaction.Select({
                    condition: ol.events.condition.click
                });
                selectClick.on("select", function(e) {
                    e.target.get("id") === layerId && callback(e);
                }), service.registeredInteractions.push({
                    id: layerId + "_features",
                    select: selectClick
                }), mapInstance.addInteraction(selectClick);
            },
            registerLayerEvent: function(mapInstance, layerId, eventName, callback) {
                var layer = service.getLayerBy(mapInstance, "id", layerId);
                eventName = "loadstart" === eventName ? "tileloadstart" : eventName, eventName = "loadend" === eventName ? "tileloadend" : eventName, 
                layer.getSource().un(eventName, callback);
            },
            unRegisterLayerEvent: function(mapInstance, layerId, eventName, callback) {
                var layer = service.getLayerBy(mapInstance, "id", layerId);
                eventName = "loadstart" === eventName ? "tileloadstart" : eventName, eventName = "loadend" === eventName ? "tileloadend" : eventName, 
                layer.getSource().un(eventName, callback);
            },
            getMarkerCountForLayerName: function(mapInstance, layerName) {
                var layer = service.getLayerBy(mapInstance, "name", layerName);
                return null == layer ? 0 : "undefined" == typeof layer.getSource().getFeatures ? 0 : layer.getSource().getFeatures().length;
            },
            filterFeatureLayer: function() {
                throw new Error("NotImplementedError");
            },
            parseFeatureAttributes: function(featureAttributes) {
                if (!featureAttributes) return null;
                var results = [];
                return -1 === featureAttributes.indexOf(",") ? results.push(featureAttributes) : results = featureAttributes.split(","), 
                results;
            },
            getLayerFeatures: function(mapInstance, layerId) {
                var features = [], layer = service.getLayerById(mapInstance, layerId), source = layer.getSource();
                if (null == source.getFeatures) return features;
                for (var existingFeatures = source.getFeatures(), i = 0; i < existingFeatures.length; i++) {
                    var f = existingFeatures[i];
                    features.push(f);
                }
                return features;
            },
            raiseLayerDrawOrder: function(mapInstance, layerId, delta) {
                for (var layerIndex, allLayers = mapInstance.getLayers(), i = 0; i < allLayers.getLength(); i++) {
                    var currentLayer = allLayers.item(i);
                    if (currentLayer.get("id") === layerId) {
                        layerIndex = i;
                        break;
                    }
                }
                var updatedIndex = layerIndex + delta;
                if (layerIndex !== updatedIndex) {
                    var layerArray = mapInstance.getLayers().getArray();
                    layerArray.splice(updatedIndex, 0, layerArray.splice(layerIndex, 1)[0]), mapInstance.updateSize();
                }
            },
            postAddLayerCache: {}
        };
        return service;
    } ]);
}();

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, darwin = darwin || {}, app = angular.module("geowebtoolkit.mapservices.controls.openlayersv2", []);

app.service("olv2MapControls", [ function() {
    "use strict";
    var supportControls = [ {
        name: "permalink",
        constructor: OpenLayers.Control.Permalink
    }, {
        name: "overviewmap",
        constructor: OpenLayers.Control.OverviewMap
    }, {
        name: "scale",
        constructor: OpenLayers.Control.Scale
    }, {
        name: "scaleline",
        constructor: OpenLayers.Control.ScaleLine
    }, {
        name: "panzoombar",
        constructor: OpenLayers.Control.PanZoomBar
    }, {
        name: "zoomslider",
        constructor: OpenLayers.Control.PanZoomBar
    }, {
        name: "zoom",
        constructor: OpenLayers.Control.Zoom
    }, {
        name: "mouseposition",
        constructor: OpenLayers.Control.MousePosition
    }, {
        name: "attribution",
        constructor: OpenLayers.Control.Attribution
    }, {
        name: "measureline",
        constructor: OpenLayers.Control.Measure,
        customParams: [ OpenLayers.Handler.Path ]
    }, {
        name: "measurepolygon",
        constructor: OpenLayers.Control.Measure,
        customParams: [ OpenLayers.Handler.Polygon ]
    }, {
        name: "wmsgetfeatureinfo",
        constructor: OpenLayers.Control.WMSGetFeatureInfo
    } ], service = {
        resolveSupportedControl: function(name) {
            for (var control, i = 0; i < supportControls.length; i++) {
                var con = supportControls[i];
                if (con.name === name) {
                    control = con;
                    break;
                }
            }
            return control;
        },
        createControl: function(name, controlOptions, div) {
            var control;
            div && !controlOptions.div && (controlOptions.div = div);
            var supportedControl = service.resolveSupportedControl(name);
            if (null == supportedControl || null == supportedControl.constructor) throw new Error("Error in map control construction. Unsupported control or missing source for control constructor.");
            return control = supportedControl.customParams ? controlOptions ? new supportedControl.constructor(supportedControl.customParams[0], controlOptions) : new supportedControl.constructor(supportedControl.customParams[0]) : controlOptions ? new supportedControl.constructor(controlOptions) : new supportedControl.constructor();
        },
        registerControl: function(name, constructor) {
            supportControls.push({
                name: name,
                constructor: constructor
            });
        }
    };
    return service;
} ]), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.mapservices.controls.openlayersv3", []);
    app.service("olv3MapControls", [ function() {
        function mousePositionDefaults(controlOptions, mapOptions) {
            var result = {}, wgs84Default = function(dgts) {
                return function(coord) {
                    return coord[0] > 180 && (coord[0] = coord[0] - 360), coord[0] < -180 && (coord[0] = coord[0] + 360), 
                    coord[1] > 90 && (coord[1] = coord[1] - 180), coord[1] < -90 && (coord[1] = coord[1] + 180), 
                    ol.coordinate.toStringXY(coord, dgts);
                };
            }, wrappedFormatOutput = function(formatFn) {
                return function(coord) {
                    return coord[0] > 180 && (coord[0] = coord[0] - 360), coord[0] < -180 && (coord[0] = coord[0] + 360), 
                    coord[1] > 90 && (coord[1] = coord[1] - 180), coord[1] < -90 && (coord[1] = coord[1] + 180), 
                    formatFn({
                        lon: coord[0],
                        lat: coord[1]
                    });
                };
            };
            return result.coordinateFormat = null != controlOptions.formatOutput ? wrappedFormatOutput(controlOptions.formatOutput) : null == controlOptions.coordinateFormat ? wgs84Default(4) : controlOptions.coordinateFormat(4), 
            result.projection = controlOptions.projection || mapOptions.displayProjection || "EPSG:4326", 
            result;
        }
        var supportControls = [ {
            name: "overviewmap",
            constructor: ol.control.OverviewMap
        }, {
            name: "scaleline",
            constructor: ol.control.ScaleLine
        }, {
            name: "zoomslider",
            constructor: ol.control.ZoomSlider
        }, {
            name: "panzoombar",
            constructor: ol.control.ZoomSlider
        }, {
            name: "zoom",
            constructor: ol.control.Zoom
        }, {
            name: "mouseposition",
            constructor: ol.control.MousePosition,
            resolveCustomParams: mousePositionDefaults
        }, {
            name: "attribution",
            constructor: ol.control.Attribution
        } ], service = {
            resolveSupportedControl: function(name) {
                for (var control, i = 0; i < supportControls.length; i++) {
                    var con = supportControls[i];
                    if (con.name === name) {
                        control = con;
                        break;
                    }
                }
                return control;
            },
            createControl: function(name, controlOptions, div, mapOptions) {
                var control;
                div && !controlOptions.div && (controlOptions.element = div);
                var supportedControl = service.resolveSupportedControl(name);
                if (null == supportedControl || null == supportedControl.constructor) {
                    var message = "Error in map control construction for '" + name + "'. Unsupported control or missing source for control constructor.";
                    message += "\r\nSupported controls names are: ";
                    for (var i = 0; i < supportControls.length; i++) {
                        var con = supportControls[i];
                        message += "\r\n" + con.name;
                    }
                    throw new Error(message);
                }
                return supportedControl.resolveCustomParams ? (controlOptions = angular.extend(controlOptions, angular.copy(supportedControl.resolveCustomParams(controlOptions, mapOptions))), 
                control = new supportedControl.constructor(controlOptions)) : supportedControl.customParams ? (controlOptions = angular.extend(controlOptions, angular.copy(supportedControl.customParams[0])), 
                control = new supportedControl.constructor(controlOptions)) : control = controlOptions ? new supportedControl.constructor(controlOptions) : new supportedControl.constructor(), 
                control;
            },
            registerControl: function(name, constructor) {
                supportControls.push({
                    name: name,
                    constructor: constructor
                });
            }
        };
        return service;
    } ]), null != ol && null != ol.control && null != ol.control.ZoomSlider && (ol.control.ZoomSlider.prototype.getPositionForResolution_ = function(res) {
        try {
            var fn = this.getMap().getView().getValueForResolutionFunction();
            return 1 - fn(res);
        } catch (error) {}
    });
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.mapservices.map.ol3cesium", []);
    app.service("ol3CesiumMapService", [ function() {
        var spaceEventHandler, service = {
            registerMapClick: function(mapInstance, callback) {
                var scene = mapInstance.getCesiumScene();
                spaceEventHandler || (spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)), 
                spaceEventHandler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            unRegisterMapClick: function(mapInstance, callback) {
                var scene = mapInstance.getCesiumScene();
                spaceEventHandler || (spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)), 
                spaceEventHandler.removeInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            registerMapEvent: function(mapInstance, eventName, callback) {
                var scene = mapInstance.getCesiumScene();
                spaceEventHandler || (spaceEventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas)), 
                spaceEventHandler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            },
            unRegisterMapEvent: function() {},
            getCoordinateFromPixel: function(mapInstance, pixel) {
                var scene = mapInstance.getCesiumScene(), ellipsoid = scene.globe.ellipsoid, cartesian = scene.camera.pickEllipsoid(pixel, ellipsoid);
                if (cartesian) {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian), longitudeString = Cesium.Math.toDegrees(cartographic.longitude), latitudeString = Cesium.Math.toDegrees(cartographic.latitude), result = [ parseFloat(longitudeString), parseFloat(latitudeString) ];
                    return result;
                }
                return [ 0, 0 ];
            }
        };
        return service;
    } ]);
}();

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, app = angular.module("geowebtoolkit.mapservices.map.openlayersv2", [ "geowebtoolkit.mapservices.layer.openlayersv2", "geowebtoolkit.mapservices.controls.openlayersv2" ]);

app.service("olv2MapService", [ "olv2LayerService", "olv2MapControls", "GeoUtils", "GeoLayer", "$q", "$log", function(olv2LayerService, olv2MapControls, GeoUtils, GeoLayer, $q, $log) {
    "use strict";
    function updateToolkitMapInstanceProperty(mapInstance, propertyName, propertyValue) {
        mapInstance._geowebtoolkit = mapInstance._geowebtoolkit || {}, mapInstance._geowebtoolkit[propertyName] = propertyValue;
    }
    function getToolkitMapInstanceProperty(mapInstance, propertyName) {
        var result = null;
        return null != mapInstance._geowebtoolkit && (result = mapInstance._geowebtoolkit[propertyName]), 
        result;
    }
    function cleanClientCache(mapInstance, layerService) {
        for (var cache in layerService.postAddLayerCache) if (layerService.postAddLayerCache.hasOwnProperty(cache)) {
            for (var cacheInUse = !1, i = 0; i < mapInstance.layers.length; i++) {
                var layer = mapInstance.layers[i];
                cache === layer.id && (cacheInUse = !0);
            }
            cacheInUse || (layerService.postAddLayerCache[cache] = null);
        }
    }
    var service = {
        initialiseMap: function(args, mapConfig) {
            var config = {};
            return null == args.displayProjection && (args.displayProjection = mapConfig.defaultOptions.displayProjection), 
            service.displayProjection = args.displayProjection, null == args.datumProjection && (args.datumProjection = mapConfig.defaultOptions.projection), 
            null == args.datumProjection && ($log.warn("Datum projection has not been provided. Defaulting to EPSG:3857"), 
            args.datumProjection = "EPSG:3857"), null == args.displayProjection && ($log.warn("Display projection has not been provided. Defaulting to EPSG:4326"), 
            args.displayProjection = "EPSG:4326"), config.projection = args.datumProjection, 
            config.numZoomLevels = mapConfig.defaultOptions.numZoomLevels, config.displayProjection = args.displayProjection, 
            config.controls = args.isStaticMap || void 0 !== config.controls && null !== config.controls ? [] : [ new OpenLayers.Control.Navigation() ], 
            new OpenLayers.Map(args.mapElementId, config);
        },
        getParameterByName: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(document.URL);
            return null == results ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        zoomToMaxExtent: function(mapInstance) {
            mapInstance.zoomToMaxExtent();
        },
        currentZoomLevel: function(mapInstance) {
            return mapInstance.getZoom();
        },
        addLayer: function(mapInstance, layer) {
            return null == layer.then || "function" != typeof layer.then ? (null != layer.geoLayerType && -1 !== layer.geoLayerType.indexOf("Google") && (mapInstance.zoomDuration = 0), 
            mapInstance.addLayer(layer), service.postLayerAddAction(mapInstance, layer), GeoLayer.fromOpenLayersV2Layer(layer)) : void layer.then(function(resultLayer) {
                return mapInstance.addLayer(resultLayer), service.postLayerAddAction(mapInstance, layer), 
                GeoLayer.fromOpenLayersV2Layer(layer);
            });
        },
        postLayerAddAction: function(mapInstance, layer) {
            $log.info("post layer add fired"), olv2LayerService.postAddLayerCache[layer.id] && olv2LayerService.postAddLayerCache[layer.id]({
                map: mapInstance,
                layer: layer
            }), cleanClientCache(mapInstance, olv2LayerService);
        },
        registerMapMouseMove: function(mapInstance, callback) {
            mapInstance.events.register("mousemove", mapInstance, callback);
        },
        registerMapClick: function(mapInstance, callback) {
            mapInstance.events.register("click", mapInstance, callback);
        },
        unRegisterMapClick: function(mapInstance, callback) {
            mapInstance.events.unregister("click", mapInstance, callback);
        },
        registerMapMouseMoveEnd: function(mapInstance, callback) {
            mapInstance.events.register("moveend", mapInstance, callback);
        },
        registerMapEvent: function(mapInstance, eventName, callback) {
            mapInstance.events.register(eventName, mapInstance, callback);
        },
        unRegisterMapEvent: function(mapInstance, eventName, callback) {
            mapInstance.events.unregister(eventName, mapInstance, callback);
        },
        getCurrentMapExtent: function(mapInstance) {
            var currentExtent = mapInstance.getExtent();
            if (null == currentExtent) return null;
            currentExtent = currentExtent.transform(mapInstance.projection, service.displayProjection);
            var result = [], topLeft = [ currentExtent.left, currentExtent.top ], topRight = [ currentExtent.right, currentExtent.top ], bottomLeft = [ currentExtent.left, currentExtent.bottom ], bottomRight = [ currentExtent.right, currentExtent.bottom ];
            return result.push(topLeft), result.push(topRight), result.push(bottomLeft), result.push(bottomRight), 
            result;
        },
        getMapScale: function(mapInstance) {
            var scale = mapInstance.getScale();
            return scale;
        },
        getMapCenter: function(mapInstance) {
            var center = mapInstance.center;
            return center;
        },
        isControlActive: function(mapInstance, controlId) {
            for (var control, i = 0; mapInstance.controls.length; i++) {
                var existingControl = mapInstance.controls[i];
                if (existingControl.id === controlId) {
                    control = existingControl;
                    break;
                }
            }
            return control.active === !0;
        },
        addControl: function(mapInstance, controlName, controlOptions, elementId, controlId) {
            controlName = controlName.toLowerCase();
            var div, resultControl = {};
            elementId && (div = $("#" + elementId)[0]), "mouseposition" === controlName && (controlOptions = controlOptions || {});
            var con = olv2MapControls.createControl(controlName, controlOptions, div);
            return con.id = controlId || con.id, mapInstance.addControl(con), resultControl.id = con.id, 
            resultControl;
        },
        getControls: function(mapInstance) {
            for (var controls = [], olv2Controls = mapInstance.controls, i = 0; i < olv2Controls.length; i++) {
                var control = olv2Controls[i];
                controls.push({
                    id: control.metadata.id || control.id,
                    name: control.metadata.type
                });
            }
            return controls;
        },
        getControlById: function(mapInstance, controlId) {
            for (var result, olv2Controls = mapInstance.controls, i = 0; i < olv2Controls.length; i++) {
                var control = olv2Controls[i];
                if (control.id === controlId) {
                    result = control;
                    break;
                }
            }
            return result;
        },
        activateControl: function(mapInstance, controlId) {
            var control = service.getControlById(mapInstance, controlId);
            if (null == control) throw new Error('Control "' + controlId + '" not found. Failed to activate control');
            control.activate();
        },
        deactivateControl: function(mapInstance, controlId) {
            var control = service.getControlById(mapInstance, controlId);
            control.deactivate();
        },
        registerControlEvent: function(mapInstance, controlId, eventName, callback) {
            var control = service.getControlById(mapInstance, controlId);
            control.events.register(eventName, void 0, callback);
        },
        unRegisterControlEvent: function(mapInstance, controlId, eventName, callback) {
            var control = service.getControlById(mapInstance, controlId);
            control.events.unregister(eventName, void 0, callback);
        },
        getLayers: function(mapInstance) {
            var layers = [];
            return angular.forEach(mapInstance.layers, function(layer) {
                layers.push(GeoLayer.fromOpenLayersV2Layer(layer));
            }), layers;
        },
        getLayersByName: function(mapInstance, layerName) {
            if ("string" != typeof layerName && "number" != typeof layerName) throw new TypeError("Expected number");
            for (var layers = mapInstance.getLayersBy("name", layerName), results = [], i = 0; i < layers.length; i++) {
                var currentLayer = layers[i];
                results.push(GeoLayer.fromOpenLayersV2Layer(currentLayer));
            }
            return results;
        },
        setLayerVisibility: function(mapInstance, layerId, visibility) {
            if ("object" == typeof visibility) throw new TypeError("Expected boolean");
            var currentLayer = mapInstance.getLayersBy("id", layerId)[0];
            currentLayer.setVisibility(visibility);
        },
        createBoundingBox: function(mapInstance, geoJsonCoordinateArray) {
            for (var bounds = new OpenLayers.Bounds(), i = 0; i < geoJsonCoordinateArray.length; i++) bounds.extend(new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]));
            return bounds.toBBOX();
        },
        createBounds: function(mapInstance, geoJsonCoordinateArray, projection) {
            for (var bounds = new OpenLayers.Bounds(), i = 0; i < geoJsonCoordinateArray.length; i++) {
                var lonLat = new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]);
                lonLat = lonLat.transform(projection, mapInstance.projection), bounds.extend(lonLat);
            }
            return bounds;
        },
        zoomToExtent: function(mapInstance, extent) {
            var bounds = service.createBounds(mapInstance, extent, service.displayProjection);
            mapInstance.zoomToExtent(bounds, !1);
        },
        zoomToLayer: function(mapInstance, layerId) {
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            if (null == layer) throw new ReferenceError('Layer not found - id: "' + layerId + '".');
            var extent = layer.getExtent();
            mapInstance.zoomToExtent(extent);
        },
        zoomTo: function(mapInstance, zoomLevel) {
            if ("object" == typeof zoomLevel) throw new TypeError("Expected number");
            mapInstance.zoomTo(zoomLevel);
        },
        getMapElementId: function(mapInstance) {
            return "object" == typeof mapInstance.div ? $(mapInstance.div)[0].id : mapInstance.div;
        },
        getProjection: function(mapInstance) {
            return mapInstance.projection;
        },
        getDisplayProjection: function(mapInstance) {
            return mapInstance.displayProjection || service.displayProjection || "EPSG:4326";
        },
        getSize: function(mapInstance) {
            var size = mapInstance.getSize();
            return {
                width: size.w,
                height: size.h
            };
        },
        setBaseLayer: function(mapInstance, layerId) {
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            mapInstance.setBaseLayer(layer, !1);
        },
        setCenter: function(mapInstance, lat, lon, projection) {
            var loc = new OpenLayers.LonLat(lon, lat);
            if (null == projection) {
                var defaultTransformedLoc = loc.transform(mapInstance.displayProjection, mapInstance.projection);
                mapInstance.setCenter(defaultTransformedLoc);
            } else if (projection != mapInstance.projection) {
                var transformedLoc = loc.transform(projection, mapInstance.projection);
                mapInstance.setCenter(transformedLoc);
            } else mapInstance.setCenter(loc);
        },
        setInitialPositionAndZoom: function(mapInstance, args) {
            if ("" !== service.getParameterByName("zoom") && null != args.centerPosition) {
                var nPosition = new OpenLayers.LonLat(service.getParameterByName("lon"), service.getParameterByName("lat")).transform(), srcProj = new OpenLayers.Projection(service.displayProjection), destProj = new OpenLayers.Projection(mapInstance.getProjection()), transformedExtent = nPosition.transform(srcProj, destProj);
                mapInstance.setCenter(transformedExtent, service.getParameterByName("zoom"));
            } else if (null != args.initialExtent) {
                var bounds = service.createBounds(mapInstance, args.initialExtent, service.displayProjection);
                mapInstance.zoomToExtent(bounds, !0);
            } else if (args.centerPosition) {
                var position = JSON.parse(args.centerPosition), centerPos = new OpenLayers.LonLat(position[0], position[1]), srcProjection = new OpenLayers.Projection(service.displayProjection), destProjection = new OpenLayers.Projection(mapInstance.getProjection()), transformedCenter = centerPos.transform(srcProjection, destProjection);
                mapInstance.setCenter(transformedCenter, args.zoomLevel);
            } else mapInstance.zoomToMaxExtent();
        },
        isBaseLayer: function(mapInstance, layerId) {
            for (var currentLayer, result = !1, numOfLayers = mapInstance.layers.length, i = 0; numOfLayers > i; i++) if (mapInstance.layers[i].id === layerId) {
                currentLayer = mapInstance.layers[i];
                break;
            }
            return result = currentLayer ? -1 !== currentLayer.id.indexOf("ArcGISCache") ? currentLayer.options.isBaseLayer : currentLayer.isBaseLayer : !1;
        },
        setOpacity: function(mapInstance, layerId, opacity) {
            if ("object" == typeof opacity) throw new TypeError("Expected number");
            var layer = mapInstance.getLayersBy("id", layerId)[0];
            layer.setOpacity(opacity);
        },
        mapResized: function(mapInstance) {
            mapInstance.updateSize();
            for (var i = 0; i < mapInstance.layers.length; i++) mapInstance.layers[i].redraw(!0);
        },
        setMapMarker: function(mapInstance, coords, markerGroupName, iconUrl, args) {
            var markersLayers = mapInstance.getLayersBy("name", markerGroupName), opx = mapInstance.getLonLatFromPixel(coords), size = new OpenLayers.Size(args.width, args.height), offset = new OpenLayers.Pixel(-(size.w / 2), -size.h), icon = new OpenLayers.Icon(iconUrl, size, offset), marker = new OpenLayers.Marker(opx, icon.clone());
            marker.map = mapInstance;
            var id = GeoUtils.generateUuid();
            if (marker.id = id, null != markersLayers && markersLayers.length > 0 && "function" == typeof markersLayers[0].addMarker) markersLayers[0].addMarker(marker); else {
                var markers = new OpenLayers.Layer.Markers(markerGroupName);
                mapInstance.addLayer(markers), markers.addMarker(marker);
            }
            return {
                id: id,
                groupName: markerGroupName
            };
        },
        removeMapMarker: function(mapInstance, markerId) {
            for (var i = 0; i < mapInstance.layers.length; i++) {
                var layer = mapInstance.layers[i];
                if (null != layer.markers && layer.markers.length > 0) {
                    for (var j = 0; j < layer.markers.length; j++) {
                        var marker = layer.markers[j];
                        if (marker.id === markerId) {
                            layer.removeMarker(marker);
                            break;
                        }
                    }
                    break;
                }
            }
        },
        getLonLatFromPixel: function(mapInstance, x, y, projection) {
            if (null == x) throw new ReferenceError("'x' value cannot be null or undefined");
            if (null == y) throw new ReferenceError("'y' value cannot be null or undefined");
            var result = mapInstance.getLonLatFromPixel({
                x: x,
                y: y
            });
            return projection ? result = result.transform(mapInstance.projection, projection) : service.displayProjection && service.displayProjection !== mapInstance.projection && (result = result.transform(mapInstance.projection, service.displayProjection)), 
            result;
        },
        getPixelFromLonLat: function(mapInstance, lon, lat) {
            if (null == lon) throw new ReferenceError("'lon' value cannot be null or undefined");
            if (null == lat) throw new ReferenceError("'lat' value cannot be null or undefined");
            var pos = new OpenLayers.LonLat(lon, lat);
            return service.displayProjection && service.displayProjection !== mapInstance.projection && (pos = pos.transform(service.displayProjection, mapInstance.projection)), 
            mapInstance.getPixelFromLonLat(pos);
        },
        getPointFromEvent: function(e) {
            return {
                x: e.xy.x,
                y: e.xy.y
            };
        },
        drawPolyLine: function(mapInstance, points, layerName, datum) {
            var startPoint = new OpenLayers.Geometry.Point(points[0].lon, points[0].lat), endPoint = new OpenLayers.Geometry.Point(points[1].lon, points[1].lat), projection = datum || "EPSG:4326", vector = new OpenLayers.Layer.Vector(layerName), feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([ endPoint, startPoint ]).transform(new OpenLayers.Projection(projection), mapInstance.getProjection())), featureStyle = OpenLayers.Util.applyDefaults(featureStyle, OpenLayers.Feature.Vector.style["default"]);
            featureStyle.strokeWidth = 4, feature.style = featureStyle, vector.addFeatures([ feature ]), 
            mapInstance.addLayer(vector);
        },
        startRemoveSelectedFeature: function(mapInstance, layerName) {
            function onFeatureSelect(feature) {
                vector.removeFeatures(feature);
            }
            var vector, vectors = mapInstance.getLayersByName(layerName);
            if (!(vectors.length > 0)) return void $log.warn('Layer not found ("' + layerName + '") when starting the selection to remove features.');
            vector = vectors[0];
            var selectCtrl = new OpenLayers.Control.SelectFeature(vector, {
                onSelect: onFeatureSelect
            });
            mapInstance.addControl(selectCtrl), selectCtrl.activate(), updateToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl", selectCtrl);
        },
        stopRemoveSelectedFeature: function(mapInstance) {
            var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl");
            null != removeFeaturesControl && (removeFeaturesControl.deactivate(), mapInstance.removeControl(removeFeaturesControl), 
            updateToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl", null));
        },
        removeFeature: function(mapInstance, layerName, feature) {
            var vectors = mapInstance.getLayersByName(layerName);
            vectors[0].removeFeatures(feature);
        },
        startDrawingOnLayer: function(mapInstance, layerName, args) {
            var vector, vectors = mapInstance.getLayersByName(layerName || args.layerName);
            vectors.length > 0 ? vector = vectors[0] : (vector = new OpenLayers.Layer.Vector(layerName || args.layerName), 
            mapInstance.addLayer(vector)), vector.style = {
                fillColor: args.fillColor || args.color,
                fillOpacity: args.fillOpacity || args.opacity,
                pointRadius: args.pointRadius || args.radius,
                strokeColor: args.strokeColor || args.color,
                strokeOpacity: args.strokeOpacity || args.opacity
            };
            var existingDrawControl = getToolkitMapInstanceProperty(mapInstance, "drawingControl");
            if (!existingDrawControl) {
                var control;
                if ("point" === args.featureType.toLowerCase() ? control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Point) : "line" === args.featureType.toLowerCase() || "linestring" === args.featureType.toLowerCase() ? control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Path) : "box" === args.featureType.toLowerCase() ? control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.RegularPolygon, {
                    handlerOptions: {
                        sides: 4,
                        irregular: !0
                    }
                }) : "polygon" === args.featureType.toLowerCase() && (control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Polygon)), 
                "circle" === args.featureType.toLowerCase()) throw new Error("'startDrawingOnLayer' failed due to feature type 'Circle' is not a valid feature type for OpenLayers 2.");
                updateToolkitMapInstanceProperty(mapInstance, "drawingControl", control), mapInstance.addControl(control), 
                control.activate();
            }
        },
        stopDrawing: function(mapInstance) {
            var existingDrawControl = getToolkitMapInstanceProperty(mapInstance, "drawingControl");
            existingDrawControl && (existingDrawControl.deactivate(), mapInstance.removeControl(existingDrawControl), 
            updateToolkitMapInstanceProperty(mapInstance, "drawingControl", null));
        },
        drawLabel: function(mapInstance, layerName, args) {
            var vector, vectors = mapInstance.getLayersByName(layerName || args.layerName);
            vectors.length > 0 ? vector = vectors[0] : (vector = new OpenLayers.Layer.Vector(layerName || args.layerName), 
            mapInstance.addLayer(vector));
            var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection()), pointFeature = new OpenLayers.Feature.Vector(point);
            vector.style = {
                label: args.text,
                fontColor: args.fontColor || args.color,
                fontSize: args.fontSize,
                align: args.align,
                labelSelect: !0
            }, vector.addFeatures([ pointFeature ]);
            var featureId = GeoUtils.generateUuid();
            pointFeature.id = featureId;
            var geoJsonWriter = new OpenLayers.Format.GeoJSON(), geoJsonFeature = geoJsonWriter.write(pointFeature), result = angular.fromJson(geoJsonFeature);
            return result.id = featureId, result;
        },
        drawLabelWithPoint: function(mapInstance, layerName, args) {
            var vector, vectors = mapInstance.getLayersByName(layerName || args.layerName);
            vectors.length > 0 ? vector = vectors[0] : (vector = new OpenLayers.Layer.Vector(layerName || args.layerName), 
            mapInstance.addLayer(vector));
            var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection()), pointFeature = new OpenLayers.Feature.Vector(point), pointFeatureId = GeoUtils.generateUuid();
            pointFeature.id = pointFeatureId, vector.style = {
                label: args.text,
                pointRadius: args.pointRadius || "8",
                fontColor: args.fontColor || args.color || "#000000",
                fontSize: args.fontSize || "14px",
                align: args.align || "cm",
                labelYOffset: args.labelYOffset || 15,
                labelSelect: !0,
                fillColor: args.pointColor || args.color || "#000000",
                strokeColor: args.pointColor || args.color || "#000000",
                fillOpacity: args.pointOpacity || args.fillOpacity || .5,
                strokeOpacity: args.pointOpacity || args.strokeOpacity || 1
            }, vector.addFeatures([ pointFeature ]);
            var geoJsonWriter = new OpenLayers.Format.GeoJSON(), geoJsonFeature = geoJsonWriter.write([ pointFeature ]), result = angular.fromJson(geoJsonFeature);
            return result.features[0].id = pointFeatureId, result;
        },
        getFeatureInfo: function(mapInstance, url, featureType, featurePrefix, geometryName, pointEvent, tolerance) {
            tolerance = tolerance || 0;
            var deferred = $q.defer(), point = pointEvent instanceof MouseEvent ? pointEvent.xy : pointEvent, originalPx = new OpenLayers.Pixel(point.x, point.y), llPx = originalPx.add(-tolerance, tolerance), urPx = originalPx.add(tolerance, -tolerance), ll = mapInstance.getLonLatFromPixel(llPx), ur = mapInstance.getLonLatFromPixel(urPx), bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat), protocol = new OpenLayers.Protocol.WFS({
                formatOptions: {
                    outputFormat: "text/xml"
                },
                url: url,
                version: "1.1.0",
                srsName: mapInstance.projection,
                featureType: featureType,
                featurePrefix: featurePrefix,
                geometryName: geometryName,
                maxFeatures: 100
            }), filter = new OpenLayers.Filter.Spatial({
                type: OpenLayers.Filter.Spatial.BBOX,
                value: bounds
            });
            return protocol.read({
                filter: filter,
                callback: function(result) {
                    if (result.success()) {
                        for (var geoJSONFormat = new OpenLayers.Format.GeoJSON(), geoJson = geoJSONFormat.write(result.features), geoObject = angular.fromJson(geoJson), j = 0; j < geoObject.features.length; j++) geoObject.features[j].crs = {
                            type: "name",
                            properties: {
                                name: mapInstance.projection
                            }
                        };
                        deferred.resolve(geoObject);
                    } else deferred.reject(result.error);
                }
            }), deferred.promise;
        },
        getFeatureInfoFromLayer: function(mapInstance, layerId, pointEvent, tolerance) {
            tolerance = tolerance || 0;
            var layer, deferred = $q.defer(), point = pointEvent instanceof MouseEvent ? pointEvent.xy : pointEvent, originalPx = new OpenLayers.Pixel(point.x, point.y), llPx = originalPx.add(-tolerance, tolerance), urPx = originalPx.add(tolerance, -tolerance), ll = mapInstance.getLonLatFromPixel(llPx), ur = mapInstance.getLonLatFromPixel(urPx), bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat), layers = mapInstance.getLayersBy("id", layerId);
            if (!(layers.length > 0)) throw new Error("Invalid layer id");
            layer = layers[0];
            var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(layer), filter = new OpenLayers.Filter.Spatial({
                type: OpenLayers.Filter.Spatial.BBOX,
                value: bounds
            });
            return protocol.read({
                filter: filter,
                callback: function(result) {
                    if (result.success()) {
                        for (var geoJSONFormat = new OpenLayers.Format.GeoJSON(), geoJson = geoJSONFormat.write(result.features), geoObject = angular.fromJson(geoJson), j = 0; j < geoObject.features.length; j++) geoObject.features[j].crs = {
                            type: "name",
                            properties: {
                                name: mapInstance.projection
                            }
                        };
                        deferred.resolve(geoObject);
                    } else deferred.reject(result.error);
                }
            }), deferred.promise;
        },
        createWfsClient: function(url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
            var protocol = new OpenLayers.Protocol.WFS({
                url: url,
                featureType: featureType,
                featurePrefix: featurePrefix,
                version: version,
                geometryName: geometryName,
                srsName: datumProjection
            });
            return protocol.isLonLatOrderValid = isLonLatOrderValid, protocol;
        },
        addWfsClient: function(wfsClient) {
            service.wfsClientCache = service.wfsClientCache || [];
            var wfsClientId = GeoUtils.generateUuid();
            return service.wfsClientCache[wfsClientId] = wfsClient, {
                clientId: wfsClientId
            };
        },
        is3dSupported: function() {
            return !1;
        },
        is3d: function() {
            return !1;
        },
        switchTo3dView: function() {
            throw new Error("3D not supported in current map");
        },
        switchTo2dView: function() {},
        searchWfs: function(mapInstance, clientId, query, attribute) {
            var client = service.wfsClientCache[clientId], deferred = $q.defer(), callBackFn = function(response) {
                if ("200" !== response.priv.status || 200 === response.priv.status) return void deferred.resolve(null);
                for (var i = 0; i < response.features.length; i++) if (service.wfsClientCache[clientId].isLonLatOrderValid === !1) {
                    var invalidLat = response.features[i].geometry.x, invalidLon = response.features[i].geometry.y;
                    response.features[i].geometry.x = invalidLon, response.features[i].geometry.y = invalidLat;
                }
                for (var geoJSONFormat = new OpenLayers.Format.GeoJSON(), geoJson = geoJSONFormat.write(response.features), geoObject = angular.fromJson(geoJson), j = 0; j < geoObject.features.length; j++) geoObject.features[j].crs = {
                    type: "name",
                    properties: {
                        name: client.srsName
                    }
                };
                deferred.resolve(geoObject);
            }, filter = new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: attribute,
                matchCase: !1,
                value: query.toUpperCase() + "*"
            });
            return client.read({
                filter: filter,
                callback: callBackFn
            }), deferred.promise;
        },
        getMeasureFromEvent: function(mapInstance, e) {
            var points, format = new OpenLayers.Format.GeoJSON({
                externalProjection: service.displayProjection,
                internalProjection: mapInstance.projection
            }), geoJsonString = format.write(e.geometry);
            return points = angular.fromJson(geoJsonString), {
                measurement: e.measure,
                units: e.units,
                geoJson: points
            };
        },
        wfsClientCache: {}
    };
    return service;
} ]), function() {
    "use strict";
    var olCesiumInstance, cesiumMousePositionHandler, app = angular.module("geowebtoolkit.mapservices.map.openlayersv3", [ "geowebtoolkit.mapservices.layer.openlayersv3", "geowebtoolkit.mapservices.controls.openlayersv3", "geowebtoolkit.mapservices.map.ol3cesium", "geowebtoolkit.events-openlayers3" ]);
    app.service("olv3MapService", [ "olv3LayerService", "olv3MapControls", "GeoUtils", "GeoLayer", "ol3CesiumMapService", "ol3CesiumEventManager", "geoConfig", "$q", "$log", "$timeout", function(olv3LayerService, olv3MapControls, GeoUtils, GeoLayer, ol3CesiumMapService, ol3CesiumEventManager, appConfig, $q, $log, $timeout) {
        function updateToolkitMapInstanceProperty(mapInstance, propertyName, propertyValue) {
            var _geowebtoolkit = mapInstance.get("_geowebtoolkit") || {};
            _geowebtoolkit[propertyName] = propertyValue, mapInstance.set("_geowebtoolkit", _geowebtoolkit);
        }
        function getToolkitMapInstanceProperty(mapInstance, propertyName) {
            var result = null;
            if (mapInstance.get("_geowebtoolkit")) {
                var temp = mapInstance.get("_geowebtoolkit");
                result = temp[propertyName];
            }
            return result;
        }
        function addMapClickCallback(callback) {
            for (var i = 0; i < mapClickCallbacks.length; i++) if (mapClickCallbacks[i] === callback) return;
            mapClickCallbacks.push(callback);
        }
        function removeMapClickCallback(callback) {
            for (var i = 0; i < mapClickCallbacks.length; i++) mapClickCallbacks[i] === callback && mapClickCallbacks.slice(i);
        }
        function cleanClientCache(mapInstance, layerService) {
            for (var cache in layerService.postAddLayerCache) if (layerService.postAddLayerCache.hasOwnProperty(cache)) {
                for (var cacheInUse = !1, i = 0; i < mapInstance.getLayers().length; i++) {
                    var layer = mapInstance.getLayers()[i];
                    cache === layer.id && (cacheInUse = !0);
                }
                cacheInUse || (layerService.postAddLayerCache[cache] = null);
            }
        }
        var mapClickCallbacks = [], service = {
            initialiseMap: function(args, mapConfig) {
                var config = {}, viewOptions = {};
                if (null == args.displayProjection && mapConfig.defaultOptions && mapConfig.defaultOptions.displayProjection && (args.displayProjection = mapConfig.defaultOptions.displayProjection), 
                null == args.datumProjection && mapConfig.defaultOptions && mapConfig.defaultOptions.projection && (args.datumProjection = mapConfig.defaultOptions.projection), 
                null == args.datumProjection && ($log.warn("Datum projection has not been provided. Defaulting to EPSG:3857"), 
                args.datumProjection = "EPSG:3857"), null == args.displayProjection && ($log.warn("Display projection has not been provided. Defaulting to EPSG:4326"), 
                args.displayProjection = "EPSG:4326"), viewOptions.projection = ol.proj.get(args.datumProjection), 
                args.centerPosition) {
                    var center = JSON.parse(args.centerPosition);
                    viewOptions.center = ol.proj.transform([ center[0], center[1] ], args.displayProjection, args.datumProjection);
                }
                viewOptions.zoom = parseInt(args.zoomLevel), viewOptions.extent = viewOptions.projection.getExtent();
                var view = new ol.View(viewOptions);
                return view.geoMaxZoom = 28, view.geoMinZoom = 0, config.target = args.mapElementId, 
                config.renderer = null == appConfig.olv3Options ? "canvas" : appConfig.olv3Options.renderer || "canvas", 
                config.view = view, args.isStaticMap && (config.interactions = []), config.controls = [], 
                service.displayProjection = args.displayProjection, service.datumProjection = args.datumProjection, 
                new ol.Map(config);
            },
            getParameterByName: function(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(document.URL);
                return null == results ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            zoomToMaxExtent: function(mapInstance) {
                mapInstance.getView().setZoom(18);
            },
            currentZoomLevel: function(mapInstance) {
                return mapInstance.getView().getZoom();
            },
            addLayer: function(mapInstance, layer) {
                var layerMaxZoomLevel = layer.geoMaxZoom || mapInstance.getView().geoMaxZoom, layerMinZoomLevel = layer.geoMinZoom || mapInstance.getView().geoMinZoom;
                if (layerMaxZoomLevel < mapInstance.getView().geoMaxZoom || layerMinZoomLevel > mapInstance.getView().geoMinZoom) {
                    var exiistingView = mapInstance.getView(), options = {
                        projection: exiistingView.getProjection(),
                        center: exiistingView.getCenter(),
                        zoom: exiistingView.getZoom(),
                        maxZoom: layerMaxZoomLevel,
                        minZoom: layerMinZoomLevel
                    }, nView = new ol.View(options);
                    mapInstance.setView(nView);
                }
                return layer.disableDefaultUI ? void 0 : null == layer.then || "function" != typeof layer.then ? (null != layer.geoLayerType && -1 !== layer.geoLayerType.indexOf("Google") && (mapInstance.zoomDuration = 0), 
                mapInstance.addLayer(layer), service.postLayerAddAction(mapInstance, layer), GeoLayer.fromOpenLayersV3Layer(layer)) : void layer.then(function(resultLayer) {
                    return mapInstance.addLayer(resultLayer), service.postLayerAddAction(mapInstance, layer), 
                    GeoLayer.fromOpenLayersV3Layer(layer);
                });
            },
            postLayerAddAction: function(mapInstance, layer) {
                $log.info("post layer add fired"), olv3LayerService.postAddLayerCache[layer.id] && olv3LayerService.postAddLayerCache[layer.id]({
                    map: mapInstance,
                    layer: layer
                }), cleanClientCache(mapInstance, olv3LayerService);
            },
            registerMapMouseMove: function(mapInstance, callback) {
                ol3CesiumEventManager.registerMapMouseMove(mapInstance, olCesiumInstance, callback);
            },
            registerMapClick: function(mapInstance, callback) {
                return null == callback ? void $log.error('callback provided to "registerMapClick" was null') : (service.is3d(mapInstance) ? ol3CesiumMapService.registerMapClick(olCesiumInstance, callback) : mapInstance.on("click", callback), 
                void addMapClickCallback(callback));
            },
            unRegisterMapClick: function(mapInstance, callback) {
                null != callback && (service.is3d(mapInstance) ? ol3CesiumMapService.unRegisterMapClick(olCesiumInstance, callback) : mapInstance.un("click", callback), 
                removeMapClickCallback(callback));
            },
            registerMapMouseMoveEnd: function(mapInstance, callback) {
                ol3CesiumEventManager.registerMapMouseMoveEnd(mapInstance, olCesiumInstance, callback);
            },
            registerMapEvent: function(mapInstance, eventName, callback) {
                return service.is3d(mapInstance) ? void ol3CesiumMapService.registerMapEvent(olCesiumInstance, eventName, callback) : void mapInstance.on(eventName, callback);
            },
            unRegisterMapEvent: function(mapInstance, eventName, callback) {
                return service.is3d(mapInstance) ? void ol3CesiumMapService.unRegisterMapEvent(olCesiumInstance, eventName, callback) : void mapInstance.un(eventName, callback);
            },
            getCurrentMapExtent: function(mapInstance) {
                var ext = mapInstance.getView().calculateExtent(mapInstance.getSize());
                if (null == ext) return null;
                var result = [], topLeft = ol.proj.transform([ ext[0], ext[3] ], mapInstance.getView().getProjection(), service.displayProjection || "EPSG:4326"), topRight = ol.proj.transform([ ext[2], ext[3] ], mapInstance.getView().getProjection(), service.displayProjection || "EPSG:4326"), bottomLeft = ol.proj.transform([ ext[0], ext[1] ], mapInstance.getView().getProjection(), service.displayProjection || "EPSG:4326"), bottomRight = ol.proj.transform([ ext[2], ext[1] ], mapInstance.getView().getProjection(), service.displayProjection || "EPSG:4326");
                return result.push(topLeft), result.push(topRight), result.push(bottomLeft), result.push(bottomRight), 
                result;
            },
            getMapScale: function(mapInstance) {
                var view = mapInstance.getView(), resolution = view.getResolution(), units = mapInstance.getView().getProjection().getUnits(), dpi = 25.4 / .28, mpu = ol.proj.METERS_PER_UNIT[units];
                return resolution * mpu * 39.37 * dpi;
            },
            getMapCenter: function(mapInstance) {
                var center = mapInstance.getView().getCenter(), coords = {
                    lat: center[1],
                    lon: center[0]
                };
                return coords;
            },
            isControlActive: function(mapInstance, controlId, controlName) {
                if ("measureline" === controlName) {
                    var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction");
                    return null != measureEventDrawInteraction;
                }
                for (var controls = mapInstance.getControls(), i = 0; i < controls.getLength(); i++) {
                    var control = controls.item(i);
                    if (control.get("id") === controlId) return !0;
                }
                return !1;
            },
            addControl: function(mapInstance, controlName, controlOptions, elementId, controlId, mapOptions) {
                controlName = controlName.toLowerCase();
                var div, resultControl = {};
                elementId && (div = $("#" + elementId)[0]), "mouseposition" === controlName && (controlOptions = controlOptions || {}), 
                "overviewmap" === controlName && null != controlOptions && null != controlOptions.maximized && (controlOptions.collapsed = !controlOptions.maximized);
                var con = olv3MapControls.createControl(controlName, controlOptions, div, mapOptions);
                return con.set("id", controlId || con.get("id") || GeoUtils.generateUuid()), con.set("name", controlName || ""), 
                "overviewmap" === controlName ? $timeout(function() {
                    mapInstance.addControl(con);
                }, 1e3) : mapInstance.addControl(con), resultControl.id = con.get("id"), resultControl;
            },
            getControls: function(mapInstance) {
                for (var controls = [], olv2Controls = mapInstance.getControls(), i = 0; i < olv2Controls.getLength(); i++) {
                    var control = olv2Controls.item(i);
                    controls.push({
                        id: control.metadata.id || control.get("id"),
                        name: control.metadata.type
                    });
                }
                return controls;
            },
            getControlById: function(mapInstance, controlId) {
                for (var result, controls = mapInstance.getControls(), i = 0; i < controls.getLength(); i++) {
                    var control = controls.item(i);
                    if (control.get("id") === controlId) {
                        result = control;
                        break;
                    }
                }
                return result;
            },
            activateControl: function(mapInstance, controlId) {
                var isActive = service.isControlActive(mapInstance, controlId), cachedControl = service._getCachedControl(controlId);
                !isActive && cachedControl && (mapInstance.addControl(cachedControl), service._removeCachedControl(controlId));
            },
            _getCachedControl: function(controlId) {
                service.cachedControls = service.cachedControls || [];
                for (var i = 0; i < service.cachedControls.length; i++) {
                    var cachedControl = service.cachedControls[i];
                    if (cachedControl.get("id") === controlId) return cachedControl;
                }
                return null;
            },
            _removeCachedControl: function(controlId) {
                service.cachedControls = service.cachedControls || [];
                for (var i = 0; i < service.cachedControls.length; i++) {
                    var cachedControl = service.cachedControls[i];
                    cachedControl.get("id") === controlId && (service.cachedControls[i] = null);
                }
                return null;
            },
            deactivateControl: function(mapInstance, controlId) {
                var isActive = service.isControlActive(mapInstance, controlId), cachedControl = service._getCachedControl(controlId), currentControl = service.getControlById(mapInstance, controlId);
                isActive && !cachedControl && (service.cachedControls.push(currentControl), mapInstance.removeControl(currentControl));
            },
            registerControlEvent: function(mapInstance, controlId, eventName, callback) {
                var controls = mapInstance.getControls(), existingControl = null;
                if (controls.forEach(function(control) {
                    control.get("id") === controlId && (existingControl = control);
                }), null == existingControl) {
                    var measureEventVectorLayer, measureEventDrawInteraction;
                    "measurepartial" === eventName && (service.initMeasureEventLayer(mapInstance), measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer"), 
                    measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction"), 
                    service.handleMeasurePartial(mapInstance, measureEventVectorLayer, measureEventDrawInteraction, callback)), 
                    "measure" === eventName && (service.initMeasureEventLayer(mapInstance), measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer"), 
                    measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction"), 
                    service.handleMeasure(mapInstance, measureEventVectorLayer, measureEventDrawInteraction, callback));
                } else existingControl.on(eventName, callback);
            },
            initMeasureEventLayer: function(mapInstance) {
                var measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer");
                measureEventVectorLayer && mapInstance.removeLayer(measureEventVectorLayer);
                var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction");
                measureEventDrawInteraction && mapInstance.removeInteraction(measureEventDrawInteraction);
                var measureEventSource = getToolkitMapInstanceProperty(mapInstance, "measureEventSource");
                measureEventSource || (updateToolkitMapInstanceProperty(mapInstance, "measureEventSource", new ol.source.Vector()), 
                measureEventSource = getToolkitMapInstanceProperty(mapInstance, "measureEventSource")), 
                measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer"), 
                measureEventVectorLayer || (updateToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer", new ol.layer.Vector({
                    source: measureEventSource,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: "rgba(255, 255, 255, 0.2)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "#ffcc33",
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: "#ffcc33"
                            })
                        })
                    })
                })), measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer")), 
                measureEventVectorLayer.set("id", GeoUtils.generateUuid()), measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction"), 
                measureEventDrawInteraction || (updateToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction", new ol.interaction.Draw({
                    source: measureEventSource,
                    type: "LineString",
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: "rgba(255, 255, 255, 0.2)"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgba(0, 0, 0, 0.5)",
                            lineDash: [ 10, 10 ],
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: "rgba(0, 0, 0, 0.7)"
                            }),
                            fill: new ol.style.Fill({
                                color: "rgba(255, 255, 255, 0.2)"
                            })
                        })
                    })
                })), measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction")), 
                mapInstance.addLayer(measureEventVectorLayer), mapInstance.addInteraction(measureEventDrawInteraction);
            },
            handleMeasurePartial: function(mapInstance, vectorLayer, drawInteraction, callback) {
                drawInteraction.on("drawstart", function(e) {
                    var measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer");
                    measureEventVectorLayer && measureEventVectorLayer.getSource().clear();
                    var isDragging = !1;
                    service.pauseDoubleClickZoom_(mapInstance);
                    var sketchFeature = e.feature, measurePointerMoveEvent = function(event) {
                        isDragging = !!event.dragging;
                    };
                    updateToolkitMapInstanceProperty(mapInstance, "measurePointerMoveEvent", measurePointerMoveEvent);
                    var measurePointerUpEvent = function(event) {
                        var measureSingleClickTimeout = getToolkitMapInstanceProperty(mapInstance, "measureSingleClickTimeout");
                        measureSingleClickTimeout && $timeout.cancel(measureSingleClickTimeout), isDragging || updateToolkitMapInstanceProperty(mapInstance, "measureSingleClickTimeout", $timeout(function() {
                            var measureIsDrawEndComplete = getToolkitMapInstanceProperty(mapInstance, "measureIsDrawEndComplete");
                            measureIsDrawEndComplete ? updateToolkitMapInstanceProperty(mapInstance, "measureIsDrawEndComplete", !1) : (event.feature = sketchFeature, 
                            callback(event));
                        }, 10));
                    };
                    updateToolkitMapInstanceProperty(mapInstance, "measurePointerUpEvent", measurePointerUpEvent), 
                    mapInstance.on("pointerup", measurePointerUpEvent), mapInstance.on("pointermove", measurePointerMoveEvent), 
                    callback(e);
                }, service);
            },
            handleMeasure: function(mapInstance, vectorLayer, drawInteraction, callback) {
                updateToolkitMapInstanceProperty(mapInstance, "measureIsDrawEndComplete", !1), drawInteraction.on("drawend", function(e) {
                    service._cleanupMeasureEvents(mapInstance), callback(e), $timeout(function() {
                        service.enableDoubleClickZoom_(mapInstance);
                    }, 50), updateToolkitMapInstanceProperty(mapInstance, "measureIsDrawEndComplete", !0);
                }, service);
            },
            pauseDoubleClickZoom_: function(mapInstance) {
                var interactions = mapInstance.getInteractions();
                interactions.forEach(function(i) {
                    i instanceof ol.interaction.DoubleClickZoom && i.setActive(!1);
                });
            },
            enableDoubleClickZoom_: function(mapInstance) {
                var interactions = mapInstance.getInteractions();
                interactions.forEach(function(i) {
                    i instanceof ol.interaction.DoubleClickZoom && i.setActive(!0);
                });
            },
            unRegisterControlEvent: function(mapInstance, controlId, eventName, callback) {
                var controls = mapInstance.getControls(), existingControl = null;
                if (controls.forEach(function(control) {
                    control.get("id") === controlId && (existingControl = control);
                }), null == existingControl) {
                    var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction");
                    "measure" === eventName && measureEventDrawInteraction && service._cleanupMeasureEvents(mapInstance, !0), 
                    "measurepartial" === eventName && measureEventDrawInteraction && service._cleanupMeasureEvents(mapInstance, !0);
                } else existingControl.un(eventName, callback);
            },
            _cleanupMeasureEvents: function(mapInstance, remove) {
                var measurePointerUpEvent = getToolkitMapInstanceProperty(mapInstance, "measurePointerUpEvent");
                measurePointerUpEvent && mapInstance.un("pointerup", measurePointerUpEvent);
                var measurePointerMoveEvent = getToolkitMapInstanceProperty(mapInstance, "measurePointerMoveEvent");
                if (measurePointerMoveEvent && mapInstance.un("pointermove", measurePointerMoveEvent), 
                remove) {
                    var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction"), measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer");
                    measureEventDrawInteraction && mapInstance.removeInteraction(measureEventDrawInteraction), 
                    measureEventVectorLayer && mapInstance.removeLayer(measureEventVectorLayer), updateToolkitMapInstanceProperty(mapInstance, "measureEventVectorLayer", null), 
                    updateToolkitMapInstanceProperty(mapInstance, "measureEventDrawInteraction", null), 
                    updateToolkitMapInstanceProperty(mapInstance, "measureEventSource", null);
                }
            },
            getLayers: function(mapInstance) {
                var layers = [];
                return angular.forEach(mapInstance.getLayers(), function(layer) {
                    layers.push(GeoLayer.fromOpenLayersV3Layer(layer));
                }), layers;
            },
            _getLayersBy: function(mapInstance, propertyName, propertyValue) {
                var layers = mapInstance.getLayers(), results = [];
                return layers.forEach(function(layer) {
                    var propVal = layer.get(propertyName);
                    propVal && -1 !== propVal.indexOf(propertyValue) && results.push(layer);
                }), results;
            },
            getLayersByName: function(mapInstance, layerName) {
                if ("string" != typeof layerName && "number" != typeof layerName) throw new TypeError("Expected string or number");
                return olv3LayerService.getLayersBy(mapInstance, "name", layerName);
            },
            setLayerVisibility: function(mapInstance, layerId, visibility) {
                if ("string" != typeof visibility && "boolean" != typeof visibility) throw new TypeError('Invalid visibility value "' + visibility + '"');
                var layer = olv3LayerService.getLayerBy(mapInstance, "id", layerId);
                layer.setVisible(visibility);
            },
            createBoundingBox: function(mapInstance, geoJsonCoordinateArray) {
                for (var geomPoints = [], i = 0; i < geoJsonCoordinateArray.length; i++) {
                    var coord = geoJsonCoordinateArray[i];
                    geomPoints.push(new ol.geom.Point(coord));
                }
                var geomCollection = new ol.geom.GeometryCollection(geomPoints);
                return geomCollection.getExtent();
            },
            createBounds: function(mapInstance, geoJsonCoordinateArray, projection) {
                var bounds = [], view = mapInstance.getView();
                projection = projection || ol.proj.get("EPSG:4326");
                for (var i = 0; i < geoJsonCoordinateArray.length; i++) bounds.push(ol.proj.transform([ parseFloat(geoJsonCoordinateArray[i][0]), parseFloat(geoJsonCoordinateArray[i][1]) ], projection, view.getProjection().getCode()));
                return new ol.extent.boundingExtent(bounds);
            },
            zoomToExtent: function(mapInstance, extent) {
                var map = mapInstance, view = map.getView(), ex = (map.getSize(), extent), minPos = ol.proj.transform([ ex[0][0], ex[1][1] ], ol.proj.get(service.displayProjection || "ESPG:4326"), view.getProjection()), maxPos = ol.proj.transform([ ex[1][0], ex[0][1] ], ol.proj.get(service.displayProjection || "ESPG:4326"), view.getProjection()), bounds = [ minPos[0], minPos[1], maxPos[0], maxPos[1] ];
                mapInstance.getView().fit(bounds, mapInstance.getSize());
            },
            zoomToLayer: function(mapInstance, layerId) {
                var layer = olv3LayerService.getLayerBy(mapInstance, "id", layerId);
                if (null == layer) throw new ReferenceError('Layer not found - id: "' + layerId + '".');
                var extent = layer.getExtent();
                null != extent && mapInstance.getView().fit(extent, mapInstance.getSize());
            },
            zoomTo: function(mapInstance, zoomLevel) {
                if ("object" == typeof zoomLevel) throw new TypeError("Expected number");
                mapInstance.getView().setZoom(zoomLevel);
            },
            getMapElementId: function(mapInstance) {
                return mapInstance.getTarget();
            },
            getProjection: function(mapInstance) {
                return mapInstance.getView().getProjection().getCode();
            },
            getDisplayProjection: function() {
                return service.displayProjection || "ESPG:4326";
            },
            getSize: function(mapInstance) {
                var size = mapInstance.getSize();
                return {
                    width: size[0],
                    height: size[1]
                };
            },
            setBaseLayer: function(mapInstance, layerId) {
                var layers = service._getLayersBy(mapInstance, "isBaseLayer", !0);
                layers.forEach(function(layer) {
                    layer.setVisible(layer.get("id") === layerId ? !0 : !1);
                });
            },
            setCenter: function(mapInstance, lat, lon, projection) {
                var loc = [ parseFloat(lon), parseFloat(lat) ];
                if (null == projection) {
                    var defaultTransformedLoc = ol.proj.transform(loc, service.displayProjection, mapInstance.getView().getProjection());
                    mapInstance.getView().setCenter(defaultTransformedLoc);
                } else if (projection !== service.datumProjection) {
                    var transformedLoc = ol.proj.transform(loc, projection, mapInstance.getView().getProjection());
                    mapInstance.getView().setCenter(transformedLoc);
                } else mapInstance.getView().setCenter(loc);
            },
            setInitialPositionAndZoom: function(mapInstance, args) {
                if ("" !== service.getParameterByName("zoom") && null != args.centerPosition) throw new Error("NotImplemented");
                if (args.initialExtent) {
                    var ex = args.initialExtent, minPos = ol.proj.transform([ ex[0][0], ex[1][1] ], args.displayProjection, args.datumProjection), maxPos = ol.proj.transform([ ex[1][0], ex[0][1] ], args.displayProjection, args.datumProjection), bounds = [ minPos[0], minPos[1], maxPos[0], maxPos[1] ];
                    mapInstance.getView().fit(bounds, mapInstance.getSize(), {
                        nearest: !0
                    });
                } else {
                    if (args.centerPosition) {
                        var center = JSON.parse(args.centerPosition), pos = ol.proj.transform([ center[0], center[1] ], service.displayProjection, service.datumProjection);
                        mapInstance.getView().setCenter(pos);
                    }
                    args.zoomLevel && mapInstance.getView().setZoom(args.zoomLevel);
                }
            },
            isBaseLayer: function(mapInstance, layerId) {
                var layers = mapInstance.getLayers(), layerDrawIndex = null, i = 0, found = !1;
                return layers.forEach(function(layer) {
                    layer.get("id") !== layerId || found || (layerDrawIndex = i, found = !0), i++;
                }), 0 === layerDrawIndex;
            },
            setOpacity: function(mapInstance, layerId, opacity) {
                if ("object" == typeof opacity) throw new TypeError("Expected number");
                var layer = olv3LayerService.getLayerBy(mapInstance, "id", layerId);
                layer.setOpacity(opacity);
            },
            mapResized: function(mapInstance) {
                mapInstance.updateSize();
                for (var i = 0; i < mapInstance.getLayers().length; i++) mapInstance.getLayers()[i].redraw(!0);
            },
            setMapMarker: function(mapInstance, coords, markerGroupName, iconUrl, args) {
                var latLon, markerLayer = olv3LayerService.getLayerBy(mapInstance, "name", markerGroupName);
                service.is3d(mapInstance) ? (latLon = ol3CesiumMapService.getCoordinateFromPixel(olCesiumInstance, {
                    x: coords.x,
                    y: coords.y
                }), latLon = ol.proj.transform(latLon, "EPSG:4326", mapInstance.getView().getProjection().getCode())) : latLon = mapInstance.getCoordinateFromPixel([ coords.x, coords.y ]);
                var iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point(latLon)
                }), id = GeoUtils.generateUuid();
                iconFeature.setId(id);
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [ .5, 1 ],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                        opacity: args.opacity || 1,
                        src: iconUrl
                    })
                });
                if (iconFeature.setStyle(iconStyle), null != markerLayer) markerLayer.getSource().addFeature(iconFeature); else {
                    var source = new ol.source.Vector();
                    source.addFeature(iconFeature), markerLayer = new ol.layer.Vector({
                        source: source,
                        format: new ol.format.GeoJSON()
                    }), markerLayer.set("name", markerGroupName), mapInstance.addLayer(markerLayer);
                }
                return {
                    id: id,
                    groupName: markerGroupName
                };
            },
            removeMapMarker: function(mapInstance, markerId) {
                for (var i = 0; i < mapInstance.getLayers().getLength(); i++) {
                    var layer = mapInstance.getLayers().item(i), source = layer.getSource();
                    if ("function" == typeof source.getFeatures && source.getFeatures().length > 0) {
                        for (var j = 0; j < source.getFeatures().length; j++) {
                            var marker = source.getFeatures()[j];
                            if (marker.getId() === markerId) {
                                source.removeFeature(marker);
                                break;
                            }
                        }
                        break;
                    }
                }
            },
            getLonLatFromPixel: function(mapInstance, x, y, projection) {
                if (null == x) throw new ReferenceError("'x' value cannot be null or undefined");
                if (null == y) throw new ReferenceError("'y' value cannot be null or undefined");
                var result;
                return service.is3d(mapInstance) ? (result = ol3CesiumMapService.getCoordinateFromPixel(olCesiumInstance, {
                    x: x,
                    y: y
                }), {
                    lon: result[0],
                    lat: result[1]
                }) : (result = mapInstance.getCoordinateFromPixel([ x, y ]), projection ? result = ol.proj.transform(result, mapInstance.getView().getProjection(), projection) : service.displayProjection && service.displayProjection !== mapInstance.getView().getProjection() && (result = ol.proj.transform(result, mapInstance.getView().getProjection(), service.displayProjection)), 
                {
                    lon: result[0],
                    lat: result[1]
                });
            },
            getPixelFromLonLat: function(mapInstance, lon, lat) {
                if (null == lon) throw new ReferenceError("'lon' value cannot be null or undefined");
                if (null == lat) throw new ReferenceError("'lat' value cannot be null or undefined");
                var pos = [ lon, lat ];
                service.displayProjection !== mapInstance.getView().getProjection().getCode() && (pos = ol.proj.transform(pos, service.displayProjection, mapInstance.getView().getProjection()));
                var result = mapInstance.getPixelFromCoordinate(pos);
                return null == result && (mapInstance.renderSync(), result = mapInstance.getPixelFromCoordinate(pos)), 
                {
                    x: result[0],
                    y: result[1]
                };
            },
            getPointFromEvent: function(e) {
                return e.pixel ? {
                    x: e.pixel[0],
                    y: e.pixel[1]
                } : e.position ? e.position : void 0;
            },
            drawPolyLine: function(mapInstance, points, layerName, datum) {
                layerName || (layerName = GeoUtils.generateUuid());
                var vector, vectors = olv3LayerService._getLayersBy(mapInstance, "name", layerName), source = new ol.source.Vector(), style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: "rgba(255, 255, 255, 0.2)"
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#ffcc33",
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: "#ffcc33"
                        })
                    })
                }), startPoint = [ points[0].lon, points[0].lat ], endPoint = [ points[1].lon, points[1].lat ], geom = new ol.geom.LineString([ startPoint, endPoint ]), projection = datum || "EPSG:4326";
                geom.transform(projection, mapInstance.getView().getProjection());
                var feature = new ol.Feature({
                    geometry: geom,
                    name: layerName
                });
                if (feature.setId(GeoUtils.generateUuid()), vectors.length > 0) {
                    if (vector = vectors[0], !(vector.getSource().addFeature instanceof Function)) throw new Error("Layer name '" + layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                    vector.setStyle(style);
                } else vector = new ol.layer.Vector({
                    source: source,
                    style: style,
                    format: new ol.format.GeoJSON()
                }), vector.set("name", layerName), mapInstance.addLayer(vector);
                vector.getSource().addFeature(feature);
            },
            startRemoveSelectedFeature: function(mapInstance, layerName) {
                var layers = olv3LayerService._getLayersBy(mapInstance, "name", layerName);
                if (!layers || 0 === layers.length) return void $log.warn('Layer "' + layerName + "' not found. Remove selected layer interaction not added.");
                var layer = layers[0], select = new ol.interaction.Select({
                    condition: ol.events.condition.click
                });
                mapInstance.addInteraction(select), select.on("select", function(e) {
                    var source = layer.getSource();
                    if (!(source.removeFeature instanceof Function)) throw new Error("No valid layer found with name - " + layerName + " - to remove selected features.");
                    if (e.selected instanceof Array) for (var selectedIndex = 0; selectedIndex < e.selected.length; selectedIndex++) for (var selectedFeature = e.selected[selectedIndex], sourceIndex = 0; sourceIndex < source.getFeatures().length; sourceIndex++) {
                        var sourceFeature = source.getFeatures()[sourceIndex];
                        null != sourceFeature.get("id") && null != selectedFeature.get("id") && sourceFeature.get("id") === selectedFeature.get("id") && source.removeFeature(sourceFeature);
                    } else for (var j = 0; j < source.getFeatures().length; j++) {
                        var feature = source.getFeatures()[j];
                        if (feature.get("id") === e.selected.get("id")) {
                            source.removeFeature(feature);
                            break;
                        }
                    }
                    select.getFeatures().clear();
                }), updateToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl", select);
            },
            stopRemoveSelectedFeature: function(mapInstance) {
                var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl");
                removeFeaturesControl && (mapInstance.removeInteraction(removeFeaturesControl), 
                updateToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl", null));
            },
            removeFeature: function(mapInstance, layerName, feature) {
                var featureLayer = olv3LayerService.getLayersBy(mapInstance, "name", layerName);
                featureLayer.removeFeatures(feature);
            },
            startDrawingOnLayer: function(mapInstance, layerName, args) {
                var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, "removeFeaturesControl");
                removeFeaturesControl && mapInstance.removeInteraction(removeFeaturesControl);
                var interactionType, maxPoints, geometryFunction;
                switch (args.featureType.toLowerCase()) {
                  case "point":
                    interactionType = "Point";
                    break;

                  case "line":
                  case "linestring":
                    interactionType = "LineString";
                    break;

                  case "box":
                    interactionType = "LineString", maxPoints = 2, geometryFunction = function(coordinates, geometry) {
                        geometry || (geometry = new ol.geom.Polygon(null));
                        var start = coordinates[0], end = coordinates[1];
                        return geometry.setCoordinates([ [ start, [ start[0], end[1] ], end, [ end[0], start[1] ], start ] ]), 
                        geometry;
                    };
                    break;

                  case "polygon":
                    interactionType = "Polygon";
                    break;

                  case "circle":
                    interactionType = "Circle";
                }
                var vector, vectors = olv3LayerService._getLayersBy(mapInstance, "name", layerName || args.layerName), source = new ol.source.Vector(), style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: GeoUtils.convertHexAndOpacityToRgbArray(args.fillColor || args.color, args.opacity),
                        radius: args.fillRadius || args.radius
                    }),
                    stroke: new ol.style.Stroke({
                        color: GeoUtils.convertHexAndOpacityToRgbArray(args.strokeColor || args.color, args.opacity),
                        width: args.strokeRadius || args.radius
                    }),
                    image: new ol.style.Circle({
                        radius: args.circleRadius || args.radius,
                        fill: new ol.style.Fill({
                            color: GeoUtils.convertHexAndOpacityToRgbArray(args.circleColor || args.color, args.opacity)
                        })
                    })
                });
                if (vectors.length > 0) {
                    if (vector = vectors[0], !(vector.getSource().addFeature instanceof Function)) throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                    source = vector.getSource();
                } else vector = new ol.layer.Vector({
                    source: source,
                    style: style,
                    format: new ol.format.GeoJSON()
                }), vector.set("name", layerName || args.layerName), mapInstance.addLayer(vector);
                var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "featureDrawingInteraction");
                if (!existingDrawInteraction) {
                    var draw = new ol.interaction.Draw({
                        source: source,
                        type: interactionType,
                        format: new ol.format.GeoJSON(),
                        geometryFunction: geometryFunction,
                        maxPoints: maxPoints
                    });
                    draw.on("drawstart", function(e) {
                        e.feature && e.feature.setStyle(style);
                    }), draw.on("drawend", function(e) {
                        e.feature && e.feature.set("id", GeoUtils.generateUuid());
                    }), updateToolkitMapInstanceProperty(mapInstance, "featureDrawingInteraction", draw), 
                    mapInstance.addInteraction(draw);
                }
            },
            stopDrawing: function(mapInstance) {
                var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, "featureDrawingInteraction");
                existingDrawInteraction && (mapInstance.removeInteraction(existingDrawInteraction), 
                updateToolkitMapInstanceProperty(mapInstance, "featureDrawingInteraction", null));
            },
            drawLabel: function(mapInstance, layerName, args) {
                var vector, vectors = olv3LayerService._getLayersBy(mapInstance, "name", layerName || args.layerName), source = new ol.source.Vector(), alignText = "cm" === args.align ? "center" : args.align || args.textAlign, textStyle = new ol.style.Text({
                    textAlign: alignText,
                    textBaseline: args.baseline,
                    font: (args.fontWeight || args.weight || "normal") + " " + (args.fontSize || args.size || "12px") + " " + (args.font || "sans-serif"),
                    text: args.text,
                    fill: new ol.style.Fill({
                        color: args.fontColor || args.color,
                        width: args.fillWdith || args.width || 1
                    }),
                    stroke: new ol.style.Stroke({
                        color: args.fontColor || args.color,
                        width: args.outlineWidth || args.width || 1
                    }),
                    offsetX: args.offsetX || 0,
                    offsetY: args.offsetY || -1 * args.labelYOffset || 15,
                    rotation: args.rotation
                }), style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: args.circleRadius || args.radius,
                        fill: new ol.style.Fill({
                            color: GeoUtils.convertHexAndOpacityToRgbArray(args.fillColor || args.color || "#000000", args.opacity)
                        }),
                        stroke: new ol.style.Stroke({
                            color: GeoUtils.convertHexAndOpacityToRgbArray(args.strokeColor || args.color || "#000000", args.opacity),
                            width: args.strokeRadius || args.radius
                        })
                    }),
                    text: textStyle
                });
                if (vectors.length > 0) {
                    if (vector = vectors[0], !(vector.getSource().addFeature instanceof Function)) throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                } else vector = new ol.layer.Vector({
                    source: source,
                    style: style,
                    format: new ol.format.GeoJSON(),
                    id: "test"
                }), vector.set("name", layerName || args.layerName), mapInstance.addLayer(vector);
                var updatedPosition = ol.proj.transform([ args.lon, args.lat ], args.projection || service.displayProjection, mapInstance.getView().getProjection()), point = new ol.geom.Point(updatedPosition), pointFeature = new ol.Feature({
                    geometry: point,
                    id: GeoUtils.generateUuid()
                });
                pointFeature.setStyle(style), vector.getSource().addFeature(pointFeature);
                var format = new ol.format.GeoJSON();
                return angular.fromJson(format.writeFeature(pointFeature));
            },
            drawLabelWithPoint: function(mapInstance, layerName, args) {
                var vector, fillColor, vectors = olv3LayerService._getLayersBy(mapInstance, "name", layerName || args.layerName), source = new ol.source.Vector(), alignText = "cm" === args.align ? "center" : args.align || args.textAlign, textStyle = new ol.style.Text({
                    textAlign: alignText,
                    textBaseline: args.baseline,
                    font: (args.fontWeight || args.weight || "normal") + " " + (args.fontSize || args.size || "12px") + " " + (args.font || "sans-serif"),
                    text: args.text,
                    fill: new ol.style.Fill({
                        color: GeoUtils.convertHexAndOpacityToRgbArray(args.fontColor || args.color, args.opacity || 1),
                        width: args.fillWdith || args.width || 1
                    }),
                    stroke: new ol.style.Stroke({
                        color: GeoUtils.convertHexAndOpacityToRgbArray(args.fontColor || args.color, args.opacity || 1),
                        width: args.outlineWidth || args.width || 1
                    }),
                    offsetX: args.offsetX || 0,
                    offsetY: args.offsetY || -1 * args.labelYOffset || 15,
                    rotation: args.rotation
                }), fillColorHex = args.fillColor || args.color || "#000000", fillOpacity = args.fillOpacity || args.opacity || .5;
                fillColor = 0 === fillColorHex.indexOf("#") ? GeoUtils.convertHexAndOpacityToRgbArray(fillColorHex, fillOpacity) : args.fillColor || args.color;
                var strokeColor, strokeColorHex = args.fillColor || args.color || "#000000", strokeOpacity = args.strokeOpacity || args.opacity || 1;
                strokeColor = 0 === strokeColorHex.indexOf("#") ? GeoUtils.convertHexAndOpacityToRgbArray(strokeColorHex, strokeOpacity) : args.strokeColor || args.color;
                var style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: args.pointRadius || args.radius || "2",
                        fill: new ol.style.Fill({
                            color: fillColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: strokeColor,
                            width: args.strokeRadius || args.radius
                        })
                    }),
                    text: textStyle
                });
                if (vectors.length > 0) {
                    if (vector = vectors[0], !(vector.getSource().addFeature instanceof Function)) throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                } else vector = new ol.layer.Vector({
                    source: source,
                    format: new ol.format.GeoJSON()
                }), vector.set("name", layerName || args.layerName), mapInstance.addLayer(vector);
                var updatedPosition = ol.proj.transform([ args.lon, args.lat ], args.projection || service.displayProjection, mapInstance.getView().getProjection()), point = new ol.geom.Point(updatedPosition), pointFeature = new ol.Feature({
                    geometry: point,
                    id: GeoUtils.generateUuid()
                });
                pointFeature.setStyle(style), vector.getSource().addFeature(pointFeature);
                var format = new ol.format.GeoJSON();
                return angular.fromJson(format.writeFeatures([ pointFeature ]));
            },
            getFeatureInfo: function(mapInstance, url, featureType, featurePrefix, geometryName, pointEvent, tolerance) {
                if (null == OpenLayers) throw new Error("NotImplemented");
                $log.warn("getFeatureInfo not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server"), 
                tolerance = tolerance || 0;
                var deferred = $q.defer(), point = null != pointEvent && null != pointEvent.map ? pointEvent.pixel : pointEvent, originalPx = new OpenLayers.Pixel(point[0], point[1]), llPx = originalPx.add(-tolerance, tolerance), urPx = originalPx.add(tolerance, -tolerance), ll = mapInstance.getCoordinateFromPixel([ llPx.x, llPx.y ]), ur = mapInstance.getCoordinateFromPixel([ urPx.x, urPx.y ]), bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]), protocol = new OpenLayers.Protocol.WFS({
                    formatOptions: {
                        outputFormat: "text/xml"
                    },
                    url: url,
                    version: "1.1.0",
                    srsName: mapInstance.getView().getProjection().getCode(),
                    featureType: featureType,
                    featurePrefix: featurePrefix,
                    geometryName: geometryName,
                    maxFeatures: 100
                }), filter = new OpenLayers.Filter.Spatial({
                    type: OpenLayers.Filter.Spatial.BBOX,
                    value: bounds
                });
                return protocol.read({
                    filter: filter,
                    callback: function(result) {
                        if (result.success()) {
                            for (var geoJSONFormat = new OpenLayers.Format.GeoJSON(), geoJson = geoJSONFormat.write(result.features), geoObject = angular.fromJson(geoJson), j = 0; j < geoObject.features.length; j++) geoObject.features[j].crs = {
                                type: "name",
                                properties: {
                                    name: mapInstance.getView().getProjection().getCode()
                                }
                            };
                            deferred.resolve(geoObject);
                        } else deferred.reject(result.error);
                    }
                }), deferred.promise;
            },
            getFeatureInfoFromLayer: function(mapInstance, layerId, pointEvent, tolerance) {
                if (null == OpenLayers) throw new Error("NotImplemented");
                $log.warn("getFeatureInfoFromLayer not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server"), 
                tolerance = tolerance || 0;
                var layer, deferred = $q.defer(), point = null != pointEvent && null != pointEvent.map ? pointEvent.pixel : pointEvent, originalPx = new OpenLayers.Pixel(point.x, point.y), llPx = originalPx.add(-tolerance, tolerance), urPx = originalPx.add(tolerance, -tolerance), ll = mapInstance.getCoordinateFromPixel([ llPx.x, llPx.y ]), ur = mapInstance.getCoordinateFromPixel([ urPx.x, urPx.y ]), bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]), layers = olv3LayerService._getLayersBy(mapInstance, "id", layerId);
                if (!(layers.length > 0)) throw new Error("Invalid layer id");
                layer = layers[0];
                var typeName, featurePrefix, param = layer.getSource().getParams().LAYERS, parts = (OpenLayers.Util.isArray(param) ? param[0] : param).split(":");
                parts.length > 1 && (featurePrefix = parts[0]), typeName = parts.pop();
                var protocolOptions = {
                    url: layer.getSource().getUrls()[0],
                    featureType: typeName,
                    featurePrefix: featurePrefix,
                    srsName: layer.projection && layer.projection.getCode() || layer.map && layer.map.getProjectionObject().getCode(),
                    version: "1.1.0"
                }, protocol = new OpenLayers.Protocol.WFS(OpenLayers.Util.applyDefaults(null, protocolOptions)), filter = new OpenLayers.Filter.Spatial({
                    type: OpenLayers.Filter.Spatial.BBOX,
                    value: bounds
                });
                return protocol.read({
                    filter: filter,
                    callback: function(result) {
                        if (result.success()) {
                            for (var geoJSONFormat = new OpenLayers.Format.GeoJSON(), geoJson = geoJSONFormat.write(result.features), geoObject = angular.fromJson(geoJson), j = 0; j < geoObject.features.length; j++) geoObject.features[j].crs = {
                                type: "name",
                                properties: {
                                    name: mapInstance.projection
                                }
                            };
                            deferred.resolve(geoObject);
                        } else deferred.reject(result);
                    }
                }), deferred.promise;
            },
            createWfsClient: function() {
                throw new Error("NotImplemented");
            },
            addWfsClient: function(wfsClient) {
                service.wfsClientCache = service.wfsClientCache || [];
                var wfsClientId = GeoUtils.generateUuid();
                return service.wfsClientCache[wfsClientId] = wfsClient, {
                    clientId: wfsClientId
                };
            },
            is3dSupported: function() {
                return null != window.olcs;
            },
            is3d: function() {
                return null != olCesiumInstance ? olCesiumInstance.getEnabled() : !1;
            },
            switchTo3dView: function(mapInstance) {
                if (olCesiumInstance) olCesiumInstance.setEnabled(!0); else {
                    olCesiumInstance = new olcs.OLCesium({
                        map: mapInstance,
                        target: mapInstance.getTarget()
                    });
                    var scene = olCesiumInstance.getCesiumScene(), cesiumOptions = appConfig().cesiumOptions;
                    if (null != cesiumOptions && cesiumOptions.includeCustomTerrainProvider) {
                        var terrainProvider = new Cesium.CesiumTerrainProvider({
                            url: cesiumOptions.customTerrainProviderUrl
                        });
                        scene.terrainProvider = terrainProvider;
                    }
                    olCesiumInstance.setEnabled(!0);
                }
                service.syncMapControlsWithOl3Cesium(mapInstance, mapInstance.getTarget());
            },
            switchTo2dView: function(mapInstance) {
                olCesiumInstance && (olCesiumInstance.setEnabled(!1), service.syncMapControlsWithOl3(mapInstance, mapInstance.getTarget()));
            },
            syncMapControlsWithOl3Cesium: function(mapInstance, targetId) {
                var controls = mapInstance.getControls(), mapElement = $("#" + targetId)[0];
                controls.forEach(function(control) {
                    if (control instanceof ol.control.MousePosition && mapElement) {
                        var scene = olCesiumInstance.getCesiumScene(), ellipsoid = scene.globe.ellipsoid, handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                        handler.setInputAction(function(movement) {
                            var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                            if (cartesian) {
                                var cartographic = ellipsoid.cartesianToCartographic(cartesian), longitudeString = Cesium.Math.toDegrees(cartographic.longitude), latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                                $(".ol-mouse-position")[0].innerText = control.getCoordinateFormat()([ longitudeString, latitudeString ]);
                            }
                        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE), cesiumMousePositionHandler = handler;
                    }
                    control instanceof ol.control.ScaleLine && mapInstance.render();
                });
                for (var i = 0; i < mapClickCallbacks.length; i++) {
                    var cb = mapClickCallbacks[i];
                    ol3CesiumMapService.registerMapClick(olCesiumInstance, cb), mapInstance.un("click", cb);
                }
            },
            syncMapControlsWithOl3: function(mapInstance) {
                for (var i = 0; i < mapClickCallbacks.length; i++) {
                    var cb = mapClickCallbacks[i];
                    ol3CesiumMapService.unRegisterMapClick(olCesiumInstance, cb), mapInstance.on("click", cb);
                }
            },
            searchWfs: function() {
                throw new Error("NotImplemented");
            },
            getMeasureFromEvent: function(mapInstance, e) {
                if (null == e.feature && null == e.geometry) throw new Error("Feature cannot be null in Measure event");
                null != e.geometry && e.geometry instanceof Array && 2 === e.geometry.length && (e.feature = new ol.Feature(new ol.geom.Point(e.geometry))), 
                null != e.geometry && e.geometry instanceof Array && e.geometry.length > 2 && (e.feature = new ol.Feature(new ol.geom.LineString(e.geometry)));
                var feature = e.feature.clone(), geom = feature.getGeometry().transform(mapInstance.getView().getProjection(), service.displayProjection || "EPSG:4326"), format = new ol.format.GeoJSON(), geoJson = format.writeFeature(feature), featureGeoJson = angular.fromJson(geoJson), distance = service.getGeometryLength(mapInstance, geom), units = "m";
                return distance > 1e3 && (units = "km", distance /= 1e3), {
                    measurement: distance,
                    units: units,
                    geoJson: featureGeoJson.geometry
                };
            },
            getGeometryLength: function(mapInstance, geom) {
                for (var coordinates = geom.getCoordinates(), length = 0, wgs84Sphere = new ol.Sphere(6378137), i = 0, ii = coordinates.length - 1; ii > i; ++i) length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
                return length;
            },
            wfsClientCache: {}
        };
        return service;
    } ]);
}();

var angular = angular || {}, OpenLayers = OpenLayers || {}, console = console || {}, $ = $ || {}, app = angular.module("geowebtoolkit.mapservices", [ "geowebtoolkit.mapservices.layer.openlayersv2", "geowebtoolkit.mapservices.map.openlayersv2", "geowebtoolkit.mapservices.layer.openlayersv3", "geowebtoolkit.mapservices.map.openlayersv3", "geowebtoolkit.mapservices.data.openlayersv2", "geowebtoolkit.mapservices.data.openlayersv3" ]);

app.factory("GeoLayer", [ "GeoUtils", function(GeoUtils) {
    "use strict";
    var GeoLayer = function(id, name, type, visibility, opacity) {
        this.id = id, this.name = name, this.type = type, this.visibility = visibility, 
        this.opacity = opacity;
    };
    return GeoLayer.fromOpenLayersV2Layer = function(layer) {
        var layerType, useLayerType = -1 === layer.id.indexOf("_ArcGISCache_");
        layerType = useLayerType ? layer.geoLayerType : "ArcGISCache";
        var opacity;
        return opacity = "string" == typeof layer.opacity ? Number(layer.opacity) : layer.opacity, 
        new GeoLayer(layer.id, layer.name, layerType, layer.visibility, opacity);
    }, GeoLayer.fromOpenLayersV3Layer = function(layer) {
        var opacity, layerType = layer.geoLayerType || layer.get("geoLayerType");
        return opacity = "string" == typeof layer.get("opacity") ? Number(layer.get("opacity")) : layer.get("opacity"), 
        layer.get("id") || layer.set("id", GeoUtils.generateUuid()), new GeoLayer(layer.get("id"), layer.get("name"), layerType, layer.get("visible"), opacity);
    }, GeoLayer;
} ]), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.base-layer-selector", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoBaseLayerSelector", [ "$timeout", function($timeout) {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/base-layer-selector/base-layer-selector.html",
            replace: !0,
            scope: {
                layersData: "=",
                mapController: "=",
                controllerEmitEventName: "@"
            },
            controller: [ "$scope", function($scope) {
                var self = this;
                self.selectBaseLayer = function(layerId) {
                    $scope.selectedBaseLayerId = layerId;
                }, $scope.$emit($scope.controllerEmitEventName, self);
            } ],
            link: function($scope) {
                $scope.$watch("selectedBaseLayerId", function(newVal) {
                    null != newVal && $scope.mapController.setBaseLayer(newVal);
                }), $scope.$watch("layersData", function(newVal) {
                    if (newVal) for (var i = 0; i < newVal.length; i++) $scope.layersData[i].visibility === !0 && setSelectedValue($scope.layersData[i]);
                });
                var setSelectedValue = function(layer) {
                    $timeout(function() {
                        $scope.selectedBaseLayerId = layer.id;
                    });
                };
            },
            transclude: !0
        };
    } ]);
}(), function() {
    "use strict";
    angular.module("geowebtoolkit.ui.components", [ "geowebtoolkit.ui.components.opacity-slider", "geowebtoolkit.ui.components.layer-control", "geowebtoolkit.ui.components.layers-drop-down", "geowebtoolkit.ui.components.base-layer-selector", "geowebtoolkit.ui.components.google-place-name-search", "geowebtoolkit.ui.components.geo-place-name-search", "geowebtoolkit.ui.components.layer-interaction-toggle", "geowebtoolkit.ui.components.deprecated", "geowebtoolkit.ui.components.measure-toggle" ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.deprecated", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoDialogToggle", [ function() {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/deprecated/dialog-toggle.html",
            transclude: !0,
            scope: {
                geoDialogController: "=",
                geoToggleClicked: "&"
            },
            link: function($scope) {
                $scope.toggleDialog = function() {
                    var dialogOpen = !$scope.geoDialogController.isClosed();
                    dialogOpen ? $scope.geoDialogController.closeDialog() : $scope.geoDialogController.openDialog(), 
                    $scope.geoToggleClicked({
                        dialogController: $scope.geoDialogController
                    });
                };
            }
        };
    } ]), app.directive("geoStaticDialog", [ "$timeout", "GeoUtils", function($timeout, GeoUtils) {
        return {
            restrict: "AE",
            templateUrl: "src/main/js/ui/components/deprecated/static-dialog.html",
            scope: {
                controllerEmitEventName: "@",
                dialogConfig: "=",
                dialogWindowResize: "&",
                dialogClosed: "&",
                dialogOpened: "&"
            },
            controller: [ "$scope", function($scope) {
                $(window).bind("resize", function() {
                    null != $scope.dialogWindowResize && ($scope.dialogConfig = angular.extend($scope.dialogConfig, $scope.dialogWindowResize())), 
                    $scope.dialogConfig.autoOpen = !$scope.isClosed, $("#" + $scope.dialogId).dialog($scope.dialogConfig);
                }), $scope.dialogId = GeoUtils.generateUuid();
                var self = this;
                self.openDialog = function() {
                    $("#" + $scope.dialogId).dialog("open"), $scope.isClosed = !1, $scope.dialogOpened();
                }, self.closeDialog = function() {
                    $("#" + $scope.dialogId).dialog("close"), $scope.isClosed = !0, $scope.dialogClosed();
                }, self.isClosed = function() {
                    return $scope.isClosed;
                }, $scope.$emit($scope.controllerEmitEventName, self);
            } ],
            link: function($scope) {
                $scope.$on("$destroy", function() {
                    $("#" + $scope.dialogId).dialog("destroy").remove();
                });
                var dialogConfigWatch = $scope.$watch("dialogConfig", function(data) {
                    null != data && ($scope.dialogReady = !0, $("#" + $scope.dialogId).bind("dialogclose", function() {
                        $scope.isClosed = !0, $timeout(function() {
                            $scope.$apply();
                        }), $scope.dialogClosed();
                    }), $scope.isClosed = !data.autoOpen, dialogConfigWatch());
                });
            },
            transclude: !0
        };
    } ]), app.directive("geoLayersDialog", [ "GeoUtils", function(GeoUtils) {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/deprecated/layers-dialog.html",
            scope: {
                layersData: "=",
                dialogConfig: "=",
                mapController: "="
            },
            controller: [ "$scope", function($scope) {
                $(window).bind("resize", function() {
                    $scope.dialogConfig.autoOpen = !$scope.isClosed, $("#" + $scope.dialogId).dialog($scope.dialogConfig);
                }), $scope.dialogId = GeoUtils.generateUuid(), $scope.isClosed = !$scope.dialogConfig.autoOpen;
                var self = this;
                self.openDialog = function() {
                    $("#" + $scope.dialogId).dialog("open"), $scope.isClosed = !1;
                }, self.closeDialog = function() {
                    $("#" + $scope.dialogId).dialog("close"), $scope.isClosed = !0;
                }, self.isClosed = function() {
                    return $scope.isClosed;
                }, $scope.$emit("layersDialogReady", self);
            } ],
            link: function($scope, $element, $attrs) {
                $scope.filterBaseLayers = function(layer) {
                    var layerIsBaseLayer = $scope.mapController.isBaseLayer(layer.id);
                    return !layerIsBaseLayer;
                }, $scope.$on("$destroy", function() {
                    $("#" + $scope.dialogId).dialog("destroy").remove();
                }), $scope.$watch($attrs.uiRefresh, function() {
                    $("#" + $scope.dialogId).bind("dialogclose", function() {
                        $scope.isClosed = !$scope.isClosed;
                    });
                });
            },
            transclude: !0
        };
    } ]), app.directive("geoSearchWfs", [ "$q", "$interpolate", "$log", function($q, $interpolate, $log) {
        return {
            restrict: "EA",
            templateUrl: "src/main/js/ui/components/deprecated/search-wfs.html",
            scope: {
                resultTemplateUrl: "@",
                mapController: "=",
                searchEndPoints: "=",
                onResults: "&",
                onResultsSelected: "&",
                onPerformSearch: "&",
                primaryWfsProperty: "@",
                searchIconUrl: "@",
                placeHolder: "@",
                activateKey: "@"
            },
            controller: [ "$scope", function($scope) {
                $scope.waitingForResponse = !1;
            } ],
            link: function($scope, $element, $attrs) {
                function filterQuery(searchQuery) {
                    return searchQuery.replace("'", "").replace('"', "").replace("%", "").replace("*", "");
                }
                $element.bind("keydown", function(args) {
                    args.keyCode == $scope.activateKey && ($scope.searchButtonClicked(), $scope.$apply());
                });
                var attribute, clients = [];
                if ($scope.limitResults = 10, $scope.$watch("searchEndPoints", function(newVal) {
                    if (newVal) {
                        if (null == $scope.mapController) return;
                        clients = [];
                        for (var i = 0; i < $scope.searchEndPoints.length; i++) {
                            var wfsClient = $scope.mapController.createWfsClient($scope.searchEndPoints[i].url, $scope.searchEndPoints[i].featureType, $scope.searchEndPoints[i].featurePrefix, $scope.searchEndPoints[i].version, $scope.searchEndPoints[i].geometryName, $scope.searchEndPoints[i].datumProjection, $scope.searchEndPoints[i].isLonLatOrderValid), clientDto = $scope.mapController.addWfsClient(wfsClient);
                            clientDto.endPointId = $scope.searchEndPoints[i].id, clients.push(clientDto), attribute = $scope.searchEndPoints[i].featureAttributes;
                        }
                    }
                }), null == $attrs.searchEndPoints && null != $scope.mapController) {
                    var wfsClient = $scope.mapController.createWfsClient($scope.url, $scope.featureType, $scope.featurePrefix, $scope.version, $scope.geometryName, $scope.datumProjection);
                    clients.push($scope.mapController.addWfsClient(wfsClient));
                }
                var searchFunction = function(query) {
                    query = filterQuery(query), $scope.searchResults = [];
                    var deferred = $q.defer(), count = 0, allResults = [];
                    $scope.waitingForResponse = !0;
                    for (var i = 0; i < clients.length; i++) {
                        var currentClient = clients[i];
                        $scope.mapController.searchWfs(clients[i].clientId, query, attribute).then(function(data) {
                            if (null == data) return $log.error("Search server is unavailable."), void deferred.resolve([]);
                            count++;
                            for (var j = 0; j < data.features.length; j++) data.features[j].endPointId = currentClient.endPointId, 
                            allResults.push(data.features[j]);
                            count === clients.length && (deferred.resolve(allResults), $scope.waitingForResponse = !1);
                        });
                    }
                    return deferred.promise;
                };
                $scope.getSearchResults = function(query) {
                    return null != query && query.length >= 3 ? searchFunction(query).then(function(data) {
                        return $scope.onResults({
                            data: data
                        }), data.slice(0, 10);
                    }) : [];
                }, $scope.onSelected = function($item) {
                    $scope.onResultsSelected({
                        item: $item
                    });
                }, $scope.searchButtonClicked = function() {
                    return "object" == typeof $scope.query && null != $scope.query.properties && ($scope.query = $scope.query.properties[$scope.primaryWfsProperty]), 
                    null != $scope.query ? searchFunction($scope.query).then(function(data) {
                        return $scope.onPerformSearch({
                            data: data
                        }), data;
                    }) : void 0;
                };
            },
            transclude: !0
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.geo-place-name-search", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoNamesPlaceSearch", [ "$http", "$q", "$timeout", function($http, $q, $timeout) {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/geo-names-place-search/geo-names-place-search.html",
            scope: {
                mapController: "=",
                searchIconUrl: "@",
                geoNamesApiKey: "@",
                zoomLevel: "@",
                countryCode: "@",
                resultTemplateUrl: "@",
                onResults: "&",
                onResultsSelected: "&",
                onPerformSearch: "&",
                activateKey: "@"
            },
            controller: [ "$scope", function() {} ],
            link: function($scope, $element) {
                $element.find('input[type="text"]')[0];
                $element.bind("keydown", function(args) {
                    if (args.keyCode == $scope.activateKey) {
                        if ($scope.typeAheadSelected) return;
                        $scope.searchButtonClicked(), $scope.$apply();
                    }
                });
                var searchFunction = function(query, rowCount) {
                    "object" == typeof query && (query = query.properties.name), $scope.searchResults = [];
                    var deferred = $q.defer();
                    $scope.waitingForResponse = !0;
                    var url = "http://api.geonames.org/searchJSON?q=" + encodeURIComponent(query).replace("%20", "+") + "&maxRows=" + rowCount + "&country=" + $scope.countryCode.toUpperCase() + "&username=" + $scope.geoNamesApiKey;
                    return $http.get(url).success(function(results) {
                        $scope.waitingForResponse = !1;
                        for (var geoJsonResults = [], i = 0; i < results.geonames.length; i++) {
                            var geoName = results.geonames[i];
                            geoJsonResults.push($scope.convertGeoNameToGeoJson(geoName));
                        }
                        deferred.resolve(geoJsonResults);
                    }), deferred.promise;
                };
                $scope.getSearchResults = function(query) {
                    return null != query && query.length >= 3 ? searchFunction(query, 10).then(function(data) {
                        return $scope.searchInProgress ? [] : ($scope.onResults({
                            data: data
                        }), data);
                    }) : [];
                }, $scope.onSelected = function($item) {
                    $scope.typeAheadSelected = !0, $timeout(function() {
                        $scope.typeAheadSelected = !1;
                    }, 50), $scope.onResultsSelected({
                        item: $item
                    });
                }, $scope.searchButtonClicked = function() {
                    return $scope.searchInProgress = !0, null != $scope.query ? searchFunction($scope.query, 50).then(function(data) {
                        return $scope.searchInProgress = !1, $scope.onPerformSearch({
                            data: data
                        }), data;
                    }) : void 0;
                }, $scope.convertGeoNameToGeoJson = function(geoNameResult) {
                    var geoJson = {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [ parseFloat(geoNameResult.lng), parseFloat(geoNameResult.lat) ]
                        },
                        crs: {
                            type: "name",
                            properties: {
                                name: "EPSG:4326"
                            }
                        }
                    };
                    geoJson.properties = {};
                    for (var prop in geoNameResult) geoNameResult.hasOwnProperty(prop) && (geoJson.properties[prop] = geoNameResult[prop]);
                    return geoJson;
                };
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.google-place-name-search", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("googlePlaceNameSearch", [ function() {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/google-place-name-search/google-place-name-search.html",
            scope: {
                mapController: "=",
                searchIconUrl: "@",
                zoomLevel: "@",
                countryCode: "@"
            },
            controller: [ "$scope", function() {} ],
            link: function($scope, $element) {
                var input = $element.find('input[type="text"]')[0], googleAC = new google.maps.places.Autocomplete(input, {
                    componentRestrictions: {
                        country: $scope.countryCode
                    }
                });
                google.maps.event.addListener(googleAC, "place_changed", function() {
                    var place = googleAC.getPlace();
                    place.geometry && ($scope.mapController.zoomTo($scope.zoomLevel), $scope.mapController.setCenter(place.geometry.location.k, place.geometry.location.A, "EPSG:4326"));
                });
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.layer-control", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoLayerControl", [ "GeoUtils", function(GeoUtils) {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/layer-control/layer-control.html",
            scope: {
                layerData: "=",
                mapController: "=",
                onVisible: "&",
                onHidden: "&",
                onOpacityChange: "&",
                layerDisabled: "=",
                onStartLoading: "&",
                onFinishedLoading: "&"
            },
            controller: [ "$scope", function($scope) {
                $scope.elementId = GeoUtils.generateUuid();
            } ],
            compile: function() {
                return {
                    post: function(scope) {
                        var loadStartEvent = function() {
                            scope.onStartLoading({
                                layerId: scope.layerData.id
                            });
                        }, loadend = function() {
                            scope.onFinishedLoading({
                                layerId: scope.layerData.id
                            });
                        };
                        scope.$watch("layerData", function(newVal) {
                            if (null != newVal) {
                                if (scope.layerData.visibility = scope.layerData.visibility === !0 || "true" === scope.layerData.visibility, 
                                null == scope.mapController) throw new Error("mapController is not available");
                                null != scope.layerData.id && (scope.mapController.registerLayerEvent(scope.layerData.id, "loadstart", loadStartEvent), 
                                scope.mapController.registerLayerEvent(scope.layerData.id, "loadend", loadend));
                            }
                        });
                    },
                    pre: function(scope) {
                        scope.changeOpacity = function(layerId, opacity) {
                            scope.onOpacityChange({
                                layerId: layerId,
                                opacity: opacity
                            });
                        }, scope.layerClicked = function() {
                            scope.mapController.setLayerVisibility(scope.layerData.id, scope.layerData.visibility), 
                            scope.layerData.visibility ? scope.onVisible({
                                layerId: scope.layerData.id
                            }) : scope.onHidden({
                                layerId: scope.layerData.id
                            });
                        };
                    }
                };
            },
            transclude: !0
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.layer-interaction-toggle", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoLayerInteractionToggle", [ function() {
        return {
            restrict: "E",
            replace: "true",
            templateUrl: "src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html",
            transclude: !0,
            scope: {
                toggleIconSource: "@",
                controllerEmitEventName: "@",
                toggleOnCallback: "&",
                toggleOffCallback: "&",
                onLayerClickCallback: "&",
                mapController: "=",
                layerInteractionId: "="
            },
            controller: [ "$scope", function($scope) {
                var self = this;
                self.activate = function() {
                    $scope.activate();
                }, self.deactivate = function() {
                    $scope.deactivate();
                }, self.isToggleActive = function() {
                    return $scope.isToggleOn;
                }, $scope.$emit($scope.controllerEmitEventName, self);
            } ],
            link: function($scope, $element) {
                $scope.isToggleOn = !1, $scope.activate = function() {
                    $scope.mapController.registerMapClick(callback), $element.removeClass("geoUiToggleOff"), 
                    $element.addClass("geoUiToggleOn"), $scope.isToggleOn = !0, $scope.toggleOnCallback();
                }, $scope.deactivate = function() {
                    $scope.mapController.unRegisterMapClick(callback), $element.removeClass("geoUiToggleOn"), 
                    $element.addClass("geoUiToggleOff"), $scope.isToggleOn = !1, $scope.toggleOffCallback();
                }, $scope.toggleClicked = function() {
                    $scope.isToggleOn = !$scope.isToggleOn, $scope.isToggleOn ? $scope.activate() : $scope.deactivate();
                };
                var callback = function(e) {
                    var xyPoint = $scope.mapController.getPointFromEvent(e);
                    $scope.onLayerClickCallback({
                        point: xyPoint,
                        interactionId: $scope.layerInteractionId
                    });
                };
            }
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.layers-drop-down", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoLayersDropDown", [ function() {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/layers-drop-down/layers-drop-down.html",
            replace: !1,
            scope: {
                layersData: "=",
                selectedModel: "=",
                controllerEmitEventName: "@",
                onSelectedLayerChanged: "&",
                onLayersInitialised: "&",
                layerGroupId: "@",
                includeNone: "@"
            },
            controller: [ "$scope", function($scope) {
                var self = this;
                $scope.selectLayer = function() {
                    $scope.onSelectedLayerChanged({
                        layerId: $scope.selectedModel,
                        groupId: $scope.layerGroupId
                    });
                }, self.selectLayer = $scope.selectLayer, $scope.$emit($scope.controllerEmitEventName, self);
            } ],
            link: function($scope) {
                $scope.$watch("layersData", function(newVal) {
                    newVal && !$scope.selectedModel && ($scope.includeNone && "$none$" !== $scope.layersData[0].id && $scope.layersData.unshift({
                        id: "$none$",
                        name: "None"
                    }), $scope.selectedModel = newVal[0].id, $scope.onLayersInitialised({
                        layerId: $scope.selectedModel,
                        groupId: $scope.layerGroupId
                    }));
                });
            },
            transclude: !0
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.measure-toggle", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoMeasureToggle", [ function() {
        return {
            restrict: "EA",
            templateUrl: "src/main/js/ui/components/measure-toggle/measure-toggle.html",
            scope: {
                resolveStyle: "&",
                toggleOnCallback: "&",
                toggleOffCallback: "&",
                onFinish: "&",
                onUpdate: "&",
                mapControlId: "@",
                controllerEmitEventName: "@",
                mapController: "="
            },
            controller: [ "$scope", function($scope) {
                var self = this;
                self.activate = function() {
                    $scope.activate();
                }, self.deactivate = function() {
                    $scope.deactivate();
                }, self.isToggleActive = function() {
                    return $scope.mapController.isControlActive($scope.mapControlId);
                }, $scope.$emit($scope.controllerEmitEventName, self);
            } ],
            link: function($scope, $element) {
                $scope.handleMeasurements = function(event) {
                    var measurement = $scope.mapController.getMeasureFromEvent(event);
                    $scope.onFinish({
                        event: measurement
                    });
                }, $scope.handlePartialMeasure = function(event) {
                    var measurement = $scope.mapController.getMeasureFromEvent(event);
                    $scope.onUpdate({
                        event: measurement
                    });
                }, $scope.activate = function() {
                    $scope.mapController.activateControl($scope.mapControlId), $scope.mapController.registerControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements), 
                    $scope.mapController.registerControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure), 
                    $element.removeClass("geoUiToggleOff"), $element.addClass("geoUiToggleOn"), $scope.toggleOnCallback();
                }, $scope.deactivate = function() {
                    $scope.mapController.deactivateControl($scope.mapControlId), $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements), 
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handlePartialMeasure), 
                    $element.removeClass("geoUiToggleOn"), $element.addClass("geoUiToggleOff"), $scope.toggleOffCallback();
                }, $scope.handleToggle = function() {
                    $scope.mapController.isControlActive($scope.mapControlId, "measureline") ? $scope.deactivate() : $scope.activate();
                }, $scope.$on("$destroy", function() {
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measure", $scope.handleMeasurements), 
                    $scope.mapController.unRegisterControlEvent($scope.mapControlId, "measurepartial", $scope.handleMeasurements);
                });
            },
            transclude: !0,
            replace: "true"
        };
    } ]);
}(), function() {
    "use strict";
    var app = angular.module("geowebtoolkit.ui.components.opacity-slider", [ "geowebtoolkit.ui.directives", "ui.utils", "geowebtoolkit.utils" ]);
    app.directive("geoLayerOpacitySlider", [ "$timeout", function($timeout) {
        return {
            restrict: "E",
            templateUrl: "src/main/js/ui/components/opacity-slider/opacity-slider.html",
            replace: !0,
            scope: {
                layerId: "@",
                layerOpacity: "=",
                mapController: "=",
                layerDisabled: "=",
                titleText: "@",
                onOpacityChange: "&"
            },
            controller: [ "$scope", function($scope) {
                $scope.changeOpacitySlide = function(e, ui) {
                    $scope.layerOpacity = ui.value, $timeout(function() {
                        $scope.$apply(), $scope.onOpacityChange({
                            layerId: $scope.layerId,
                            opacity: $scope.layerOpacity
                        });
                    });
                }, $scope.getSliderOptions = function() {
                    return {
                        min: 0,
                        max: 1,
                        range: !1,
                        step: .01,
                        slide: $scope.changeOpacitySlide,
                        value: $scope.layerOpacity,
                        disabled: $scope.layerDisabled
                    };
                };
            } ],
            link: function($scope, $element) {
                $scope.$watch("layerOpacity", function(newVal, oldVal) {
                    newVal && oldVal !== newVal && ($($element).slider($scope.getSliderOptions()), $scope.layerId && $scope.mapController.setOpacity($scope.layerId, newVal));
                }), $timeout(function() {
                    $element.find(".ui-slider-handle").attr("title", $scope.titleText);
                });
            },
            transclude: !0
        };
    } ]);
}();

var angular = angular || {}, console = console || {}, $ = $ || {}, google = google || {};

angular.module("geowebtoolkit.ui", [ "geowebtoolkit.ui.directives", "geowebtoolkit.ui.templates", "geowebtoolkit.ui.components", "ui.utils", "geowebtoolkit.utils" ]);

var app = angular.module("geowebtoolkit.ui.directives", [ "geowebtoolkit.utils" ]);

app.directive("geoZoomToExtentButton", [ function() {
    "use strict";
    return {
        restrict: "E",
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            extentPoints: "=",
            mapController: "=",
            beforeZoom: "&"
        },
        link: function($scope) {
            $scope.zoomTo = function() {
                var bounds = $scope.mapController.createBounds($scope.extentPoints);
                $scope.beforeZoom({
                    points: bounds
                }), $scope.mapController.zoomToExtent(bounds);
            };
        },
        transclude: !0
    };
} ]), app.directive("geoZoomToCenterPositionAnchor", [ function() {
    "use strict";
    return {
        restrict: "E",
        template: '<a ng-click="zoomTo()"><div ng-transclude></div></a>',
        scope: {
            geoJsonCoord: "=",
            projection: "@",
            mapController: "=",
            zoomLevel: "@"
        },
        link: function($scope) {
            $scope.zoomTo = function() {
                $scope.mapController.setCenter($scope.geoJsonCoord[1], $scope.geoJsonCoord[0], $scope.projection), 
                $scope.mapController.zoomTo($scope.zoomLevel);
            };
        },
        transclude: !0
    };
} ]), app.directive("geoZoomToLayerButton", [ function() {
    "use strict";
    return {
        restrict: "E",
        template: '<button type="button" ng-click="zoom()"><div ng-transclude></div></button>',
        scope: {
            layerId: "@",
            mapController: "=",
            beforeZoom: "&"
        },
        link: function($scope) {
            $scope.zoomTo = function() {
                $scope.mapController.zoomToLayer($scope.layerId);
            };
        },
        transclude: !0
    };
} ]), app.directive("geoToggle", [ function() {
    "use strict";
    var templateCache = '<button type="button" ng-click="toggle()"><div ng-transclude></div></button>';
    return {
        restrict: "E",
        replace: "true",
        template: templateCache,
        transclude: !0,
        scope: {
            geoToggleClicked: "&"
        },
        link: function($scope) {
            $scope.toggle = function() {
                $scope.geoToggleClicked();
            };
        }
    };
} ]), app.directive("fixIeSelect", function() {
    "use strict";
    return {
        restrict: "A",
        controller: [ "$scope", "$element", "$timeout", function($scope, $element, $timeout) {
            $scope.$watch("options", function() {
                {
                    var $option = $("<option>");
                    $element.css("width");
                }
                $element.css("width"), $element.addClass("repaint").removeClass("repaint"), $option.appendTo($element).remove(), 
                $timeout(function() {
                    $element.css("width", "auto");
                }), $option = null;
            });
        } ]
    };
});
//# sourceMappingURL=geo-web-toolkit-min.js.map