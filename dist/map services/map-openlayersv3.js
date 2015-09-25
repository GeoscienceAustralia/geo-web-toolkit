/* global angular, ol, olcs, $, Cesium */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.openlayersv3',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3',
            'gawebtoolkit.mapservices.map.ol3cesium',
            'gawebtoolkit.events-openlayers3'
        ]);

    var olCesiumInstance;
    var cesiumMousePositionHandler;

    app.service('olv3MapService', [
        'olv3LayerService',
        'olv3MapControls',
        'GAWTUtils',
        'GeoLayer',
        'ol3CesiumMapService',
        'ol3CesiumEventManager',
        'ga.config',
        '$q',
        '$log',
        '$timeout',
        function (olv3LayerService, olv3MapControls, GAWTUtils, GeoLayer, ol3CesiumMapService, ol3CesiumEventManager, appConfig, $q, $log, $timeout) {

            function updateToolkitMapInstanceProperty(mapInstance, propertyName, propertyValue) {
                var _geowebtoolkit = mapInstance.get('_geowebtoolkit') || {};
                _geowebtoolkit[propertyName] = propertyValue;
                mapInstance.set('_geowebtoolkit', _geowebtoolkit);
            }

            function getToolkitMapInstanceProperty(mapInstance, propertyName) {
                var result = null;
                if (mapInstance.get('_geowebtoolkit')) {
                    var temp = mapInstance.get('_geowebtoolkit');
                    result = temp[propertyName];
                }
                return result;
            }

            var mapClickCallbacks = [];

            function addMapClickCallback(callback) {
                for (var i = 0; i < mapClickCallbacks.length; i++) {
                    if (mapClickCallbacks[i] === callback) {
                        return;
                    }
                }
                mapClickCallbacks.push(callback);
            }

            function removeMapClickCallback(callback) {
                for (var i = 0; i < mapClickCallbacks.length; i++) {
                    if (mapClickCallbacks[i] === callback) {
                        mapClickCallbacks.slice(i);
                    }
                }
            }

            var service = {
                /**
                 * Initialises/Creates map object providing applications defaults from 'ga.config' module provided by
                 * 'gawebtoolkit.services' module, or application above, and attributes passed to gaMap directive.
                 * @param args {Object} - arguments passed from ga-map directive
                 * @param mapConfig {Object} - defaults passed from either toolkit or overridden in consuming application
                 * */
                initialiseMap: function (args, mapConfig) {
                    var config = {};
                    //.controls = [];
                    //convert olv2 params to olv3.
                    var viewOptions = {};

                    if (args.displayProjection == null && mapConfig.defaultOptions && mapConfig.defaultOptions.displayProjection) {
                        args.displayProjection = mapConfig.defaultOptions.displayProjection;
                    }

                    if (args.datumProjection == null && mapConfig.defaultOptions && mapConfig.defaultOptions.projection) {
                        args.datumProjection = mapConfig.defaultOptions.projection;
                    }
                    if (args.datumProjection == null) {
                        $log.warn('Datum projection has not been provided. Defaulting to EPSG:3857');
                        args.datumProjection = 'EPSG:3857';
                    }
                    if (args.displayProjection == null) {
                        $log.warn('Display projection has not been provided. Defaulting to EPSG:4326');
                        args.displayProjection = 'EPSG:4326';
                    }
                    viewOptions.projection = ol.proj.get(args.datumProjection);
                    if (args.centerPosition) {
                        var center = JSON.parse(args.centerPosition);
                        viewOptions.center = ol.proj.transform([center[0], center[1]], args.displayProjection, args.datumProjection);
                    }

                    viewOptions.zoom = parseInt(args.zoomLevel);
                    viewOptions.extent = viewOptions.projection.getExtent();
                    var view = new ol.View(viewOptions);
                    view.geoMaxZoom = 28; //Default max zoom;
                    view.geoMinZoom = 0; //Default min zoom;
                    config.target = args.mapElementId;

                    config.renderer = appConfig.olv3Options == null ? 'canvas' : (appConfig.olv3Options.renderer || 'canvas');

                    config.view = view;
                    if (args.isStaticMap) {
                        config.interactions = [];
                    }
                    config.controls = [];

                    service.displayProjection = args.displayProjection;
                    service.datumProjection = args.datumProjection;
                    return new ol.Map(config);
                },
                // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
                getParameterByName: function (name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name +
                        "=([^&#]*)"), results = regex.exec(document.URL);

                    return results == null ?
                        "" :
                        decodeURIComponent(results[1].replace(/\+/g, " "));
                },
                zoomToMaxExtent: function (mapInstance) {
                    //TODO, no 'maxExtent' in olv3. Look for alternative or way to compute.
                    mapInstance.getView().setZoom(18);
                },
                currentZoomLevel: function (mapInstance) {
                    return mapInstance.getView().getZoom();
                },
                addLayer: function (mapInstance, layer) {
                    var layerMaxZoomLevel = layer.geoMaxZoom || mapInstance.getView().geoMaxZoom;
                    var layerMinZoomLevel = layer.geoMinZoom || mapInstance.getView().geoMinZoom;
                    if (layerMaxZoomLevel < mapInstance.getView().geoMaxZoom || layerMinZoomLevel > mapInstance.getView().geoMinZoom) {
                        var exiistingView = mapInstance.getView();
                        var options = {
                            projection: exiistingView.getProjection(),
                            center: exiistingView.getCenter(),
                            zoom: exiistingView.getZoom(),
                            maxZoom: layerMaxZoomLevel,
                            minZoom: layerMinZoomLevel
                        };
                        var nView = new ol.View(options);
                        mapInstance.setView(nView);
                    }

                    if (layer.disableDefaultUI) {
                        //TODO Google maps not supported by OLV3, need to handle vendor maps differently so toolkit can give
                        //better feedback to developers about what isn't supported and possible alternatives.
                        return;
                        //var view = mapInstance.getView();
                        //view.on('change:center', function() {
                        //    var center = ol.proj.transform(view.getCenter(), view.getProjection(), 'EPSG:4326');
                        //    layer.setCenter(new google.maps.LatLng(center[1], center[0]));
                        //});
                        //view.on('change:resolution', function() {
                        //    layer.setZoom(view.getZoom());
                        //});
                        //return GeoLayer.fromOpenLayersV3Layer(layer)
                    }

                    if (layer.then != null && typeof layer.then === 'function') {
                        layer.then(function (resultLayer) {
                            mapInstance.addLayer(resultLayer);
                            service.postLayerAddAction(mapInstance, layer);
                            return GeoLayer.fromOpenLayersV3Layer(layer);
                        });
                    } else {
                        if (layer.geoLayerType != null && layer.geoLayerType.indexOf('Google') !== -1) {
                            mapInstance.zoomDuration = 0;
                        }

                        mapInstance.addLayer(layer);
                        service.postLayerAddAction(mapInstance, layer);
                        return GeoLayer.fromOpenLayersV3Layer(layer);
                    }
                },
                postLayerAddAction: function (mapInstance, layer) {
                    $log.info('post layer add fired');
                    if (olv3LayerService.postAddLayerCache[layer.id]) {
                        olv3LayerService.postAddLayerCache[layer.id]({map: mapInstance, layer: layer});
                    }
                    cleanClientCache(mapInstance, olv3LayerService);
                },
                registerMapMouseMove: function (mapInstance, callback) {
                    ol3CesiumEventManager.registerMapMouseMove(mapInstance, olCesiumInstance, callback);
                },
                registerMapClick: function (mapInstance, callback) {
                    if (callback == null) {
                        $log.error('callback provided to "registerMapClick" was null');
                        return;
                    }
                    if (service.is3d(mapInstance)) {
                        ol3CesiumMapService.registerMapClick(olCesiumInstance, callback);
                    } else {
                        mapInstance.on('click', callback);
                    }
                    addMapClickCallback(callback);
                },
                unRegisterMapClick: function (mapInstance, callback) {
                    if (callback == null) {
                        return;
                    }
                    if (service.is3d(mapInstance)) {
                        ol3CesiumMapService.unRegisterMapClick(olCesiumInstance, callback);
                    } else {
                        mapInstance.un('click', callback);
                    }
                    removeMapClickCallback(callback);
                },
                //TODO unregister
                registerMapMouseMoveEnd: function (mapInstance, callback) {
                    ol3CesiumEventManager.registerMapMouseMoveEnd(mapInstance, olCesiumInstance, callback);
                },
                registerMapEvent: function (mapInstance, eventName, callback) {
                    if (service.is3d(mapInstance)) {
                        ol3CesiumMapService.registerMapEvent(olCesiumInstance, eventName, callback);
                        return;
                    }
                    mapInstance.on(eventName, callback);
                },
                unRegisterMapEvent: function (mapInstance, eventName, callback) {
                    if (service.is3d(mapInstance)) {
                        ol3CesiumMapService.unRegisterMapEvent(olCesiumInstance, eventName, callback);
                        return;
                    }
                    mapInstance.un(eventName, callback);
                },
                getCurrentMapExtent: function (mapInstance) {
                    var ext = mapInstance.getView().calculateExtent(mapInstance.getSize());
                    if (ext == null) {
                        return null;
                    }
                    var result = [];
                    var topLeft = ol.proj.transform([ext[0], ext[3]], mapInstance.getView().getProjection(), service.displayProjection || 'EPSG:4326');
                    var topRight = ol.proj.transform([ext[2], ext[3]], mapInstance.getView().getProjection(), service.displayProjection || 'EPSG:4326');
                    var bottomLeft = ol.proj.transform([ext[0], ext[1]], mapInstance.getView().getProjection(), service.displayProjection || 'EPSG:4326');
                    var bottomRight = ol.proj.transform([ext[2], ext[1]], mapInstance.getView().getProjection(), service.displayProjection || 'EPSG:4326');
                    result.push(topLeft);
                    result.push(topRight);
                    result.push(bottomLeft);
                    result.push(bottomRight);
                    return result;
                },
                getMapScale: function (mapInstance) {
                    var view = mapInstance.getView();
                    var resolution = view.getResolution();
                    var units = mapInstance.getView().getProjection().getUnits();
                    var dpi = 25.4 / 0.28;
                    var mpu = ol.proj.METERS_PER_UNIT[units];
                    var scale = resolution * mpu * 39.37 * dpi;
                    return scale;
                },
                getMapCenter: function (mapInstance) {
                    var center = mapInstance.getView().getCenter();
                    var coords = {
                        lat: center[1],
                        lon: center[0]
                    }
                    return coords;
                },
                //return bool
                isControlActive: function (mapInstance, controlId, controlName) {
                    //Handle UI control compatibility.
                    if (controlName === 'measureline') {
                        var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                        return measureEventDrawInteraction != null;
                    }
                    //TODO no active state in olv3
                    var controls = mapInstance.getControls();
                    for (var i = 0; i < controls.getLength(); i++) {
                        var control = controls.item(i);
                        if (control.get('id') === controlId) {
                            return true;
                        }
                    }
                    return false;
                },
                //return geo-web-toolkit control dto
                addControl: function (mapInstance, controlName, controlOptions, elementId, controlId, mapOptions) {
                    controlName = controlName.toLowerCase();
                    var resultControl = {};
                    var div;
                    if (elementId) {
                        div = $('#' + elementId)[0];
                    }
                    //Sensible default for mouse position
                    if (controlName === 'mouseposition') {
                        controlOptions = controlOptions || {};
                    }

                    //OLV3 changed name for 'maximized' option. Parse if present.
                    if (controlName === 'overviewmap' && controlOptions != null && controlOptions.maximized != null) {
                        controlOptions.collapsed = !controlOptions.maximized;
                    }
                    var con = olv3MapControls.createControl(controlName, controlOptions, div, mapOptions);
                    con.set('id', controlId || con.get('id') || GAWTUtils.generateUuid());
                    con.set('name', controlName || '');
                    //Overview map can't be added after the map creation unless the map has performed a render.
                    //HACK to wait for map before adding this control.
                    if (controlName === 'overviewmap') {
                        $timeout(function () {
                            mapInstance.addControl(con);
                        }, 1000);
                    } else {
                        mapInstance.addControl(con);
                    }

                    resultControl.id = con.get('id');
                    return resultControl;
                },
                //return olv3 control with .metadata { id: '', name: '' }
                getControls: function (mapInstance) {
                    var controls = [];
                    var olv2Controls = mapInstance.getControls();
                    for (var i = 0; i < olv2Controls.getLength(); i++) {
                        var control = olv2Controls.item(i);
                        controls.push({
                            id: control.metadata.id || control.get('id'),
                            name: control.metadata.type
                        });
                    }
                    return controls;
                },
                //return olv3 control
                getControlById: function (mapInstance, controlId) {
                    var result;
                    var controls = mapInstance.getControls();

                    for (var i = 0; i < controls.getLength(); i++) {
                        var control = controls.item(i);
                        if (control.get('id') === controlId) {
                            result = control;
                            break;
                        }
                    }
                    return result;
                },
                //return void
                activateControl: function (mapInstance, controlId) {
                    var isActive = service.isControlActive(mapInstance, controlId);
                    var cachedControl = service._getCachedControl(controlId);
                    if (!isActive && cachedControl) {
                        mapInstance.addControl(cachedControl);
                        service._removeCachedControl(controlId);
                    }
                },
                _getCachedControl: function (controlId) {
                    service.cachedControls = service.cachedControls || [];
                    for (var i = 0; i < service.cachedControls.length; i++) {
                        var cachedControl = service.cachedControls[i];
                        if (cachedControl.get('id') === controlId) {
                            return cachedControl;
                        }
                    }
                    return null;
                },
                _removeCachedControl: function (controlId) {
                    service.cachedControls = service.cachedControls || [];
                    for (var i = 0; i < service.cachedControls.length; i++) {
                        var cachedControl = service.cachedControls[i];
                        if (cachedControl.get('id') === controlId) {
                            service.cachedControls[i] = null;
                        }
                    }
                    return null;
                },
                //return void
                deactivateControl: function (mapInstance, controlId) {
                    var isActive = service.isControlActive(mapInstance, controlId);
                    var cachedControl = service._getCachedControl(controlId);
                    var currentControl = service.getControlById(mapInstance, controlId);
                    if (isActive && !cachedControl) {
                        service.cachedControls.push(currentControl);
                        mapInstance.removeControl(currentControl);
                    }
                },
                //return void
                registerControlEvent: function (mapInstance, controlId, eventName, callback) {
                    //First check if control exists and then for previous OLV2 events, eg measure so we can handle them as ol.interactions
                    var controls = mapInstance.getControls();
                    var existingControl = null;
                    controls.forEach(function (control) {
                        if (control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if (existingControl == null) {
                        var measureEventVectorLayer;
                        var measureEventDrawInteraction;
                        if (eventName === 'measurepartial') {
                            service.initMeasureEventLayer(mapInstance);
                            measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                            measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                            service.handleMeasurePartial(mapInstance, measureEventVectorLayer, measureEventDrawInteraction, callback);
                        }
                        if (eventName === 'measure') {
                            service.initMeasureEventLayer(mapInstance);
                            measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                            measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                            service.handleMeasure(mapInstance, measureEventVectorLayer, measureEventDrawInteraction, callback);
                        }

                    } else {
                        existingControl.on(eventName, callback);
                    }
                },
                initMeasureEventLayer: function (mapInstance) {
                    //Clear existing layer if exists
                    var measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                    if (measureEventVectorLayer) {
                        mapInstance.removeLayer(measureEventVectorLayer);
                    }
                    var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                    if (measureEventDrawInteraction) {
                        mapInstance.removeInteraction(measureEventDrawInteraction);
                    }
                    var measureEventSource = getToolkitMapInstanceProperty(mapInstance, 'measureEventSource');
                    if (!measureEventSource) {
                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventSource', new ol.source.Vector());
                        measureEventSource = getToolkitMapInstanceProperty(mapInstance, 'measureEventSource');
                    }

                    measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                    if (!measureEventVectorLayer) {
                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer', new ol.layer.Vector({
                            source: measureEventSource,
                            style: new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: '#ffcc33',
                                    width: 2
                                }),
                                image: new ol.style.Circle({
                                    radius: 7,
                                    fill: new ol.style.Fill({
                                        color: '#ffcc33'
                                    })
                                })
                            })
                        }));
                        measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                    }

                    measureEventVectorLayer.set('id', GAWTUtils.generateUuid());

                    measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                    if (!measureEventDrawInteraction) {
                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction', new ol.interaction.Draw({
                            source: measureEventSource,
                            type: "LineString",
                            style: new ol.style.Style({
                                fill: new ol.style.Fill({
                                    color: 'rgba(255, 255, 255, 0.2)'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: 'rgba(0, 0, 0, 0.5)',
                                    lineDash: [10, 10],
                                    width: 2
                                }),
                                image: new ol.style.Circle({
                                    radius: 5,
                                    stroke: new ol.style.Stroke({
                                        color: 'rgba(0, 0, 0, 0.7)'
                                    }),
                                    fill: new ol.style.Fill({
                                        color: 'rgba(255, 255, 255, 0.2)'
                                    })
                                })
                            })
                        }));
                        measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                    }

                    mapInstance.addLayer(measureEventVectorLayer);
                    mapInstance.addInteraction(measureEventDrawInteraction);
                },
                handleMeasurePartial: function (mapInstance, vectorLayer, drawInteraction, callback) {
                    drawInteraction.on("drawstart", function (e) {
                        var measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                        if (measureEventVectorLayer) {
                            measureEventVectorLayer.getSource().clear();
                        }
                        var isDragging = false;
                        service.pauseDoubleClickZoom_(mapInstance);
                        var sketchFeature = e.feature;
                        var measurePointerMoveEvent = function (event) {
                            isDragging = !!event.dragging;
                        };
                        updateToolkitMapInstanceProperty(mapInstance, 'measurePointerMoveEvent', measurePointerMoveEvent);

                        var measurePointerUpEvent = function (event) {
                            var measureSingleClickTimeout = getToolkitMapInstanceProperty(mapInstance, 'measureSingleClickTimeout');
                            if (measureSingleClickTimeout) {
                                $timeout.cancel(measureSingleClickTimeout);
                            }
                            if (!isDragging) {
                                updateToolkitMapInstanceProperty(mapInstance, 'measureSingleClickTimeout', $timeout(function () {
                                    var measureIsDrawEndComplete = getToolkitMapInstanceProperty(mapInstance, 'measureIsDrawEndComplete');
                                    if (!measureIsDrawEndComplete) {
                                        event.feature = sketchFeature;
                                        callback(event);
                                    } else {
                                        updateToolkitMapInstanceProperty(mapInstance, 'measureIsDrawEndComplete', false);
                                    }
                                }, 10));
                            }
                        };
                        updateToolkitMapInstanceProperty(mapInstance, 'measurePointerUpEvent', measurePointerUpEvent);

                        mapInstance.on('pointerup', measurePointerUpEvent);
                        mapInstance.on('pointermove', measurePointerMoveEvent);
                        callback(e);
                    }, service);
                },
                handleMeasure: function (mapInstance, vectorLayer, drawInteraction, callback) {
                    updateToolkitMapInstanceProperty(mapInstance, 'measureIsDrawEndComplete', false);
                    drawInteraction.on("drawend", function (e) {
                        service._cleanupMeasureEvents(mapInstance);
                        callback(e);
                        //HACK to handle enable/disable of default double click zoom
                        $timeout(function () {
                            service.enableDoubleClickZoom_(mapInstance);
                        }, 50);
                        updateToolkitMapInstanceProperty(mapInstance, 'measureIsDrawEndComplete', true);
                    }, service);
                },
                pauseDoubleClickZoom_: function (mapInstance) {
                    var interactions = mapInstance.getInteractions();
                    interactions.forEach(function (i) {
                        if (i instanceof ol.interaction.DoubleClickZoom) {
                            i.setActive(false);
                        }
                    });
                },
                enableDoubleClickZoom_: function (mapInstance) {
                    var interactions = mapInstance.getInteractions();
                    interactions.forEach(function (i) {
                        if (i instanceof ol.interaction.DoubleClickZoom) {
                            i.setActive(true);
                        }
                    });
                },
                //return void
                unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
                    //First check if control exists and then for previous OLV2 events, eg measure so we can handle them as ol.interactions
                    var controls = mapInstance.getControls();
                    var existingControl = null;
                    controls.forEach(function (control) {
                        if (control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if (existingControl == null) {
                        var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                        if (eventName === 'measure' && measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            service._cleanupMeasureEvents(mapInstance, true);
                        }
                        if (eventName === 'measurepartial' && measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            service._cleanupMeasureEvents(mapInstance, true);
                        }
                    } else {
                        existingControl.un(eventName, callback);
                    }
                },
                _cleanupMeasureEvents: function (mapInstance, remove) {
                    //Handle measure with custom implementation as OLV3 does not have a measure control
                    var measurePointerUpEvent = getToolkitMapInstanceProperty(mapInstance, 'measurePointerUpEvent');
                    if (measurePointerUpEvent) {
                        mapInstance.un('pointerup', measurePointerUpEvent);
                    }
                    var measurePointerMoveEvent = getToolkitMapInstanceProperty(mapInstance, 'measurePointerMoveEvent');
                    if (measurePointerMoveEvent) {
                        mapInstance.un('pointermove', measurePointerMoveEvent);
                    }

                    if (remove) {
                        var measureEventDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction');
                        var measureEventVectorLayer = getToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer');
                        if (measureEventDrawInteraction) mapInstance.removeInteraction(measureEventDrawInteraction);
                        if (measureEventVectorLayer) mapInstance.removeLayer(measureEventVectorLayer);

                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventVectorLayer', null);
                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventDrawInteraction', null);
                        updateToolkitMapInstanceProperty(mapInstance, 'measureEventSource', null);
                    }
                },
                /**
                 * Gets the current list of layers in the map instance and returns as Layer type (geo-web-toolkit DTO)
                 * @param {Object} mapInstance - the map instance that ga-map directive holds, implementation specific
                 * @returns {Layer[]}
                 * */
                getLayers: function (mapInstance) {
                    var layers = [];
                    angular.forEach(mapInstance.getLayers(), function (layer) {
                        layers.push(GeoLayer.fromOpenLayersV3Layer(layer));
                    });
                    return layers;
                },
                _getLayersBy: function (mapInstance, propertyName, propertyValue) {
                    var layers = mapInstance.getLayers();
                    var results = [];
                    layers.forEach(function (layer) {

                        var propVal = layer.get(propertyName);
                        if (propVal && propVal.indexOf(propertyValue) !== -1) {
                            results.push(layer);
                        }
                    });
                    return results;
                },
                //Returns array of geo-web-toolkit layer DTO by name using olv3 getLayerByName?
                getLayersByName: function (mapInstance, layerName) {
                    if (typeof layerName !== 'string' && typeof layerName !== 'number') {
                        throw new TypeError('Expected string or number');
                    }
                    return olv3LayerService.getLayersBy(mapInstance, 'name', layerName);
                },
                /**
                 * Updated the layer visibility on the map instance via the provided layerId
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param layerId {string} - unique ID of the layer to set the new visibility
                 * @param visibility {Boolean} - true or false indicating if the layer is to be visible or not
                 * */
                setLayerVisibility: function (mapInstance, layerId, visibility) {
                    if (typeof visibility !== 'string' && typeof visibility !== 'boolean') {
                        throw new TypeError('Invalid visibility value "' + visibility + '"');
                    }
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    layer.setVisible(visibility);
                },
                /**
                 * Methods that takes a geoJson coordinates array and returns OpenLayers boundingbox
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
                 * @return {Object} - OpenLayers bounding box
                 * */
                createBoundingBox: function (mapInstance, geoJsonCoordinateArray) {
                    var geomPoints = [];
                    for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
                        var coord = geoJsonCoordinateArray[i];
                        geomPoints.push(new ol.geom.Point(coord));
                    }
                    var geomCollection = new ol.geom.GeometryCollection(geomPoints);
                    return geomCollection.getExtent();
                },
                /**
                 * Method that takes a geoJson coordinates array and returns OpenLayers.Bounds
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
                 * @param projection {string} - projection that the provided coordinates are in
                 * @returns {Object} - OpenLayers.Bounds object
                 * */
                createBounds: function (mapInstance, geoJsonCoordinateArray, projection) {
                    var bounds = [];
                    var view = mapInstance.getView();

                    for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
                        bounds.push(ol.proj.transform([parseFloat(geoJsonCoordinateArray[i][0]), parseFloat(geoJsonCoordinateArray[i][1])], projection, view.getProjection()));
                    }

                    var extent = new ol.extent.boundingExtent(bounds)
                    return extent;
                },
                /**
                 * Zooms to a specified extent
                 * //TODO What is common data structure for 'extent' object, current takes OpenLayers bounds
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param extent {[][]} - extent, eg [[10,10],[5,5]]
                 * @example
                 * var bounds = mapController.createBounds([[100.0,-20.0],[160.0,-20.0],[100.0,-40.0],[160.0,-40.0]]);
                 * mapController.zoomToExtent(bounds);
                 * */
                zoomToExtent: function (mapInstance, extent) {
                    var map = mapInstance;
                    var view = map.getView();
                    var size = map.getSize();
                    view.fit(extent, size);
                },
                //TODO sensible errors when unsupported layerId is used.
                zoomToLayer: function (mapInstance, layerId) {
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    if (layer == null) {
                        throw new ReferenceError('Layer not found - id: "' + layerId + '".');
                    }
                    //Only valid for some layers
                    var extent = layer.getExtent();
                    if (extent == null) {
                        // If not extent, ignore and do nothing.
                        return;
                    }
                    //var transformedExtent = extent.transform(new OpenLayers.Projection(mapInstance.getProjection()), layer.projection);
                    mapInstance.getView().fit(extent, mapInstance.getSize());
                },
                /**
                 * Sets a new zoom level of on the map instance
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param zoomLevel {Number} - zoom level between 1-19, not all zoom levels are valid for every map.
                 * */
                zoomTo: function (mapInstance, zoomLevel) {
                    if (typeof zoomLevel === 'object') {
                        throw new TypeError('Expected number');
                    }
                    mapInstance.getView().setZoom(zoomLevel);
                },
                getMapElementId: function (mapInstance) {
                    return mapInstance.getTarget();
                },
                getProjection: function (mapInstance) {
                    return mapInstance.getView().getProjection().getCode();
                },
                getDisplayProjection: function (mapInstance) {
                    return service.displayProjection || 'ESPG:4326';
                },
                getSize: function (mapInstance) {
                    var size = mapInstance.getSize();
                    return {width: size[0], height: size[1] };
                },
                /**
                 * Changes base layer to specified layer ID
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param layerId {string} - ID of the layer that is to be the new base layer
                 * */
                setBaseLayer: function (mapInstance, layerId) {
                    var layers = service._getLayersBy(mapInstance, 'isBaseLayer', true);

                    layers.forEach(function (layer) {
                        if (layer.get('id') === layerId) {
                            layer.setVisible(true);
                        } else {
                            layer.setVisible(false);
                        }
                    });
                },
                /**
                 * Updates the maps view to center on the lon/lat provided.
                 * Assumed same projection unless projection provided.
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * @param lat {Number} - Latitude of the new centre position.
                 * @param lon {Number} - Longitude of the new centre position.
                 * @param projection {string} - Projection of the provided lat and lon.
                 * */
                setCenter: function (mapInstance, lat, lon, projection) {
                    var loc = [parseFloat(lon), parseFloat(lat)];
                    if (projection == null) {
                        var defaultTransformedLoc = ol.proj.transform(loc, service.displayProjection, mapInstance.getView().getProjection());
                        mapInstance.getView().setCenter(defaultTransformedLoc);
                    } else if (projection != service.datumProjection) {
                        var transformedLoc = ol.proj.transform(loc, projection, mapInstance.getView().getProjection());
                        mapInstance.getView().setCenter(transformedLoc);
                    } else {
                        mapInstance.getView().setCenter(loc);
                    }
                },
                setInitialPositionAndZoom: function (mapInstance, args) {
                    // If a permalink has been provided use th zoom level and current position provided,
                    // other wise use the defaults provided by the config
                    if (service.getParameterByName('zoom') !== '' && args.centerPosition != null) {
                        throw new Error("NotImplemented");
                    }

                    if (args.initialExtent) {
                        var ex = args.initialExtent;

                        var minPos = ol.proj.transform(
                            [ex[0][0], ex[1][1]],
                            args.displayProjection,
                            args.datumProjection);

                        var maxPos = ol.proj.transform(
                            [ex[1][0], ex[0][1]],
                            args.displayProjection,
                            args.datumProjection);

                        var bounds = [
                            minPos[0],
                            minPos[1],
                            maxPos[0],
                            maxPos[1]
                        ];
                        mapInstance.getView().fit(bounds, mapInstance.getSize());
                    } else {
                        if (args.centerPosition) {
                            var center = JSON.parse(args.centerPosition);
                            var pos = ol.proj.transform(
                                [center[0], center[1]],
                                service.displayProjection,
                                service.datumProjection);
                            mapInstance.getView().setCenter(pos);
                        }
                        if (args.zoomLevel) {
                            mapInstance.getView().setZoom(args.zoomLevel);
                        }
                    }
                },
                isBaseLayer: function (mapInstance, layerId) {
                    var layers = mapInstance.getLayers();
                    var layerDrawIndex = null;
                    var i = 0;
                    var found = false;
                    layers.forEach(function (layer) {
                        if (layer.get('id') === layerId && !found) {
                            layerDrawIndex = i;
                            found = true;
                        }
                        i++;
                    });
                    return layerDrawIndex === 0;
                },
                /**
                 * Updates the layer with the specified layerId with the provided opacity
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * @param layerId {string} - ID of the layer to have opacity updated.
                 * @param opacity {Number} - new opacity value between 0 and 1.0.
                 * */
                setOpacity: function (mapInstance, layerId, opacity) {
                    if (typeof opacity === 'object') {
                        throw new TypeError("Expected number");
                    }
                    var layer = olv3LayerService.getLayerBy(mapInstance, 'id', layerId);
                    layer.setOpacity(opacity);
                },
                /**
                 * Updates all layers as the map contains size has been changed.
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
                 * */
                mapResized: function (mapInstance) {
                    mapInstance.updateSize();
                    for (var i = 0; i < mapInstance.getLayers().length; i++) {
                        mapInstance.getLayers()[i].redraw(true);
                    }
                },
                setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl, args) {
                    var markerLayer = olv3LayerService.getLayerBy(mapInstance, 'name', markerGroupName);
                    var latLon;
                    if (service.is3d(mapInstance)) {
                        latLon = ol3CesiumMapService.getCoordinateFromPixel(olCesiumInstance, {x: coords.x, y: coords.y});
                        latLon = ol.proj.transform(latLon, 'EPSG:4326', mapInstance.getView().getProjection().getCode());
                    } else {
                        latLon = mapInstance.getCoordinateFromPixel([coords.x, coords.y]);
                    }

                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(latLon)
                    });
                    var id = GAWTUtils.generateUuid();
                    iconFeature.setId(id);

                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            anchor: [0.5, 1.0],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            opacity: args.opacity || 1.0,
                            src: iconUrl
                        }))
                    });

                    iconFeature.setStyle(iconStyle);
                    // Marker layer exists so get the layer and add the marker
                    if (markerLayer != null) {
                        markerLayer.getSource().addFeature(iconFeature);
                    } else { // Marker layer does not exist so we create the layer then add the marker
                        var source = new ol.source.Vector();
                        source.addFeature(iconFeature);
                        markerLayer = new ol.layer.Vector({
                            source: source,
                            format: new ol.format.GeoJSON()
                        });
                        markerLayer.set('name', markerGroupName);
                        mapInstance.addLayer(markerLayer);
                    }
                    return { id: id, groupName: markerGroupName};
                },
                removeMapMarker: function (mapInstance, markerId) {
                    for (var i = 0; i < mapInstance.getLayers().getLength(); i++) {
                        var layer = mapInstance.getLayers().item(i);
                        var source = layer.getSource();
                        if (typeof source.getFeatures === 'function' && source.getFeatures().length > 0) {
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
                getLonLatFromPixel: function (mapInstance, x, y, projection) {
                    //TODO return gaMaps data structure, eg obj = { lat: Number,lon: Number }
                    //If olv2 returns this structure then, should a new object get created instead
                    //of reference to olv2 obj?
                    if (x == null) {
                        throw new ReferenceError("'x' value cannot be null or undefined");
                    }
                    if (y == null) {
                        throw new ReferenceError("'y' value cannot be null or undefined");
                    }
                    var result;
                    if (service.is3d(mapInstance)) {
                        result = ol3CesiumMapService.getCoordinateFromPixel(olCesiumInstance, {x: x, y: y});
                        return {
                            lon: result[0],
                            lat: result[1]
                        };
                    }
                    result = mapInstance.getCoordinateFromPixel([x, y]);

                    if (projection) {
                        result = ol.proj.transform(result, mapInstance.getView().getProjection(), projection);
                    } else if (service.displayProjection && service.displayProjection !== mapInstance.getView().getProjection()) {
                        result = ol.proj.transform(result, mapInstance.getView().getProjection(), service.displayProjection);
                    }
                    return {
                        lon: result[0],
                        lat: result[1]
                    };
                },
                getPixelFromLonLat: function (mapInstance, lon, lat) {
                    if (lon == null) {
                        throw new ReferenceError("'lon' value cannot be null or undefined");
                    }
                    if (lat == null) {
                        throw new ReferenceError("'lat' value cannot be null or undefined");
                    }
                    var pos = [lon, lat];
                    if (service.displayProjection !== mapInstance.getView().getProjection().getCode()) {
                        pos = ol.proj.transform(pos, service.displayProjection, mapInstance.getView().getProjection());
                    }
                    var result = mapInstance.getPixelFromCoordinate(pos);
                    //Due to olv3 rendering async, function getPixelFromCoordinate may return null and a force render is required.
                    if (result == null) {
                        mapInstance.renderSync();
                        result = mapInstance.getPixelFromCoordinate(pos);
                    }
                    return {
                        x: result[0],
                        y: result[1]
                    };
                },
                getPointFromEvent: function (e) {
                    // Open layers requires the e.xy object, be careful not to use e.x and e.y will return an
                    // incorrect value in regards to your screen pixels
                    if (e.pixel) {
                        return {
                            x: e.pixel[0],
                            y: e.pixel[1]
                        };
                    }
                    //ol3-cesium
                    if (e.position) {
                        return e.position;
                    }
                },
                drawPolyLine: function (mapInstance, points, layerName, datum) {
                    if (!layerName) {
                        layerName = GAWTUtils.generateUuid();
                    }
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ffcc33',
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: '#ffcc33'
                            })
                        })
                    });

                    var startPoint = [points[0].lon, points[0].lat];
                    var endPoint = [points[1].lon, points[1].lat];

                    var geom = new ol.geom.LineString([startPoint, endPoint]);
                    var projection = datum || 'EPSG:4326';
                    geom.transform(projection, mapInstance.getView().getProjection());
                    var feature = new ol.Feature({
                        geometry: geom,
                        name: layerName
                    });
                    feature.setId(GAWTUtils.generateUuid());

                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if (!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name', layerName);
                        mapInstance.addLayer(vector);
                    }

                    vector.getSource().addFeature(feature);
                },
                startRemoveSelectedFeature: function (mapInstance, layerName) {
                    var layers = olv3LayerService._getLayersBy(mapInstance, 'name', layerName);
                    if (!layers || layers.length === 0) {
                        $log.warn('Layer "' + layerName + "' not found. Remove selected layer interaction not added.");
                        return;
                    }
                    var layer = layers[0];
                    var select = new ol.interaction.Select({
                        condition: ol.events.condition.click
                    });

                    mapInstance.addInteraction(select);

                    select.on('select', function (e) {
                        var source = layer.getSource();
                        if (source.removeFeature instanceof Function) {
                            if (e.selected instanceof Array) {
                                for (var selectedIndex = 0; selectedIndex < e.selected.length; selectedIndex++) {
                                    var selectedFeature = e.selected[selectedIndex];
                                    for (var sourceIndex = 0; sourceIndex < source.getFeatures().length; sourceIndex++) {
                                        var sourceFeature = source.getFeatures()[sourceIndex];
                                        if (sourceFeature.get('id') != undefined && selectedFeature.get('id') != undefined) {
                                            if (sourceFeature.get('id') === selectedFeature.get('id')) {
                                                source.removeFeature(sourceFeature);
                                            }
                                        }
                                    }
                                }
                            } else {
                                for (var j = 0; j < source.getFeatures().length; j++) {
                                    var feature = source.getFeatures()[j];
                                    if (feature.get('id') === e.selected.get('id')) {
                                        source.removeFeature(feature);
                                        break;
                                    }
                                }
                            }
                        } else {
                            throw new Error("No valid layer found with name - " + layerName + " - to remove selected features.");
                        }
                        select.getFeatures().clear();
                    });


                    updateToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl', select);
                },
                stopRemoveSelectedFeature: function (mapInstance) {
                    var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl');
                    if (removeFeaturesControl) {
                        mapInstance.removeInteraction(removeFeaturesControl);
                        updateToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl', null);
                    }
                },
                removeFeature: function (mapInstance, layerName, feature) {
                    var featureLayer = olv3LayerService.getLayersBy(mapInstance, 'name', layerName);
                    featureLayer.removeFeatures(feature);
                },
                startDrawingOnLayer: function (mapInstance, layerName, args) {
                    var removeFeaturesControl = getToolkitMapInstanceProperty(mapInstance, 'removeFeaturesControl');
                    if (removeFeaturesControl) {
                        mapInstance.removeInteraction(removeFeaturesControl);
                    }
                    var interactionType;
                    var maxPoints, geometryFunction;
                    //Drawing interaction types are case sensitive and represent GeometryType in OpenLayers 3
                    switch (args.featureType.toLowerCase()) {
                        case 'point':
                            interactionType = 'Point';
                            break;
                        case 'line':
                        case 'linestring':
                            interactionType = 'LineString';
                            break;
                        case 'box':
                            interactionType = 'LineString';
                            maxPoints = 2;
                            geometryFunction = function (coordinates, geometry) {
                                if (!geometry) {
                                    geometry = new ol.geom.Polygon(null);
                                }
                                var start = coordinates[0];
                                var end = coordinates[1];
                                geometry.setCoordinates([
                                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                                ]);
                                return geometry;
                            };
                            break
                        case 'polygon':
                            interactionType = 'Polygon';
                            break;
                        case 'circle':
                            interactionType = 'Circle';
                    }

                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();

                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: GAWTUtils.convertHexAndOpacityToRgbArray(args.fillColor || args.color, args.opacity),
                            radius: args.fillRadius || args.radius
                        }),
                        stroke: new ol.style.Stroke({
                            color: GAWTUtils.convertHexAndOpacityToRgbArray(args.strokeColor || args.color, args.opacity),
                            width: args.strokeRadius || args.radius
                        }),
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: GAWTUtils.convertHexAndOpacityToRgbArray(args.circleColor || args.color, args.opacity)
                            })
                        })
                    });

                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if (!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        source = vector.getSource();
                    } else {
                        // Create the layer if it doesn't exist
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name', layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction');
                    if (!existingDrawInteraction) {
                        var draw = new ol.interaction.Draw({
                            source: source,
                            type: /** @type {ol.geom.GeometryType} */ (interactionType),
                            format: new ol.format.GeoJSON(),
                            geometryFunction: geometryFunction,
                            maxPoints: maxPoints
                        });

                        draw.on('drawstart', function (e) {
                            if (e.feature) {
                                e.feature.setStyle(style);
                            }
                        });

                        draw.on('drawend', function (e) {
                            if (e.feature) {
                                e.feature.set('id', GAWTUtils.generateUuid());
                            }
                        });

                        updateToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction', draw);
                        mapInstance.addInteraction(draw);
                    }
                },
                stopDrawing: function (mapInstance) {
                    var existingDrawInteraction = getToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction');
                    if (existingDrawInteraction) {
                        mapInstance.removeInteraction(existingDrawInteraction);
                        updateToolkitMapInstanceProperty(mapInstance, 'featureDrawingInteraction', null);
                    }
                },
                drawLabel: function (mapInstance, layerName, args) {
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var alignText = args.align === 'cm' ? 'center' : args.align || args.textAlign;
                    var textStyle = new ol.style.Text({
                        textAlign: alignText,
                        textBaseline: args.baseline,
                        font: (args.fontWeight || args.weight || 'normal') + ' ' + (args.fontSize || args.size || '12px') + ' ' + (args.font || 'sans-serif'),
                        text: args.text,
                        fill: new ol.style.Fill({color: args.fontColor || args.color, width: args.fillWdith || args.width || 1}),
                        stroke: new ol.style.Stroke({color: args.fontColor || args.color, width: args.outlineWidth || args.width || 1}),
                        offsetX: args.offsetX || 0,
                        offsetY: args.offsetY || (args.labelYOffset * -1) || 15,
                        rotation: args.rotation
                    });

                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: GAWTUtils.convertHexAndOpacityToRgbArray(args.fillColor || args.color || '#000000', args.opacity)
                            }),
                            stroke: new ol.style.Stroke(
                                {
                                    color: GAWTUtils.convertHexAndOpacityToRgbArray(args.strokeColor || args.color || '#000000', args.opacity),
                                    width: args.strokeRadius || args.radius
                                })
                        }),
                        text: textStyle
                    });
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if (!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style,
                            format: new ol.format.GeoJSON(),
                            id: "test"
                        });

                        vector.set('name', layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var updatedPosition = ol.proj.transform([args.lon, args.lat],
                        (args.projection || service.displayProjection),
                        mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedPosition);
                    var pointFeature = new ol.Feature({
                        geometry: point,
                        id: GAWTUtils.generateUuid()
                    });
                    pointFeature.setStyle(style);
                    vector.getSource().addFeature(pointFeature);

                    // Add the text to the style of the layer
                    //vector.setStyle(style);
                    var format = new ol.format.GeoJSON();

                    //Always return geoJson
                    return angular.fromJson(format.writeFeature(pointFeature));
                },
                drawLabelWithPoint: function (mapInstance, layerName, args) {
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.Vector();
                    var alignText = args.align === 'cm' ? 'center' : args.align || args.textAlign;
                    var textStyle = new ol.style.Text({
                        textAlign: alignText,
                        textBaseline: args.baseline,
                        font: (args.fontWeight || args.weight || 'normal') + ' ' + (args.fontSize || args.size || '12px') + ' ' + (args.font || 'sans-serif'),
                        text: args.text,
                        fill: new ol.style.Fill({color: GAWTUtils.convertHexAndOpacityToRgbArray(args.fontColor || args.color, args.opacity || 1), width: args.fillWdith || args.width || 1}),
                        stroke: new ol.style.Stroke({color: GAWTUtils.convertHexAndOpacityToRgbArray(args.fontColor || args.color, args.opacity || 1), width: args.outlineWidth || args.width || 1}),
                        offsetX: args.offsetX || 0,
                        offsetY: args.offsetY || (args.labelYOffset * -1) || 15,
                        rotation: args.rotation
                    });

                    var fillColor;
                    var fillColorHex = args.fillColor || args.color || '#000000';
                    var fillOpacity = args.fillOpacity || args.opacity || 0.5;
                    if (fillColorHex.indexOf('#') === 0) {
                        fillColor = GAWTUtils.convertHexAndOpacityToRgbArray(fillColorHex, fillOpacity);
                    } else {
                        fillColor = args.fillColor || args.color;
                    }

                    var strokeColor;
                    var strokeColorHex = args.fillColor || args.color || '#000000';
                    var strokeOpacity = args.strokeOpacity || args.opacity || 1.0;
                    if (strokeColorHex.indexOf('#') === 0) {
                        strokeColor = GAWTUtils.convertHexAndOpacityToRgbArray(strokeColorHex, strokeOpacity);
                    } else {
                        strokeColor = args.strokeColor || args.color;
                    }

                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: args.pointRadius || args.radius || '2',
                            fill: new ol.style.Fill({
                                color: fillColor
                            }),
                            stroke: new ol.style.Stroke(
                                {
                                    color: strokeColor,
                                    width: args.strokeRadius || args.radius
                                })
                        }),
                        text: textStyle
                    });
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if (!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            format: new ol.format.GeoJSON()
                        });

                        vector.set('name', layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    // Create a point to display the text
                    var updatedPosition = ol.proj.transform([args.lon, args.lat],
                        (args.projection || service.displayProjection),
                        mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedPosition);

                    var pointFeature = new ol.Feature({
                        geometry: point,
                        id: GAWTUtils.generateUuid()
                    });
                    pointFeature.setStyle(style);
                    vector.getSource().addFeature(pointFeature);

                    var features = [pointFeature];
                    var format = new ol.format.GeoJSON();
                    //Always return geoJson
                    return angular.fromJson(format.writeFeatures([pointFeature]));
                },
                getFeatureInfo: function (mapInstance, url, featureType, featurePrefix, geometryName, pointEvent, tolerance) {
                    if (OpenLayers == null) {
                        throw new Error("NotImplemented");
                    }
                    $log.warn('getFeatureInfo not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server');
                    tolerance = tolerance || 0;
                    var deferred = $q.defer();
                    var point = (pointEvent != null && pointEvent.map != null) ? pointEvent.pixel : pointEvent;
                    var originalPx = new OpenLayers.Pixel(point[0], point[1]);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getCoordinateFromPixel([llPx.x, llPx.y]);
                    var ur = mapInstance.getCoordinateFromPixel([urPx.x, urPx.y]);
                    var bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]);
                    var protocol = new OpenLayers.Protocol.WFS({
                        formatOptions: {
                            outputFormat: 'text/xml'
                        },
                        url: url,
                        version: '1.1.0',
                        srsName: mapInstance.getView().getProjection().getCode(),
                        featureType: featureType,
                        featurePrefix: featurePrefix,
                        geometryName: geometryName,
                        maxFeatures: 100
                    });
                    var filter = new OpenLayers.Filter.Spatial({
                        type: OpenLayers.Filter.Spatial.BBOX,
                        value: bounds
                    });
                    protocol.read({
                        filter: filter,
                        callback: function (result) {
                            if (result.success()) {
                                var geoJSONFormat = new OpenLayers.Format.GeoJSON();
                                var geoJson = geoJSONFormat.write(result.features);
                                var geoObject = angular.fromJson(geoJson);

                                for (var j = 0; j < geoObject.features.length; j++) {
                                    geoObject.features[j].crs = {
                                        "type": "name",
                                        "properties": {
                                            "name": mapInstance.getView().getProjection().getCode()
                                        }
                                    };
                                }
                                deferred.resolve(geoObject);
                            } else {
                                deferred.reject(result.error);
                            }
                        }
                    });
                    return deferred.promise;
                },
                getFeatureInfoFromLayer: function (mapInstance, layerId, pointEvent, tolerance) {
                    if (OpenLayers == null) {
                        throw new Error("NotImplemented");
                    }
                    $log.warn('getFeatureInfoFromLayer not implemented for OpenLayers version 3, falling back to OpenLayers v2 to get GeoJSON features from server');
                    tolerance = tolerance || 0;
                    var deferred = $q.defer();
                    var point = (pointEvent != null && pointEvent.map != null) ? pointEvent.pixel : pointEvent;
                    var originalPx = new OpenLayers.Pixel(point.x, point.y);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getCoordinateFromPixel([llPx.x, llPx.y]);
                    var ur = mapInstance.getCoordinateFromPixel([urPx.x, urPx.y]);
                    var bounds = new OpenLayers.Bounds(ll[0], ll[1], ur[0], ur[1]);
                    var layers = olv3LayerService._getLayersBy(mapInstance, 'id', layerId);
                    var layer;
                    if (layers.length > 0) {
                        layer = layers[0];
                    } else {
                        //Throw error;
                        throw new Error("Invalid layer id");
                    }
                    var typeName, featurePrefix;
                    var param = layer.getSource().getParams()["LAYERS"];
                    var parts = (OpenLayers.Util.isArray(param) ? param[0] : param).split(":");
                    if (parts.length > 1) {
                        featurePrefix = parts[0];
                    }
                    typeName = parts.pop();
                    var protocolOptions = {
                        url: layer.getSource().getUrls()[0],
                        featureType: typeName,
                        featurePrefix: featurePrefix,
                        srsName: layer.projection && layer.projection.getCode() ||
                            layer.map && layer.map.getProjectionObject().getCode(),
                        version: "1.1.0"
                    };
                    var protocol = new OpenLayers.Protocol.WFS(OpenLayers.Util.applyDefaults(
                        null, protocolOptions
                    ));

                    var filter = new OpenLayers.Filter.Spatial({
                        type: OpenLayers.Filter.Spatial.BBOX,
                        value: bounds
                    });
                    protocol.read({
                        filter: filter,
                        callback: function (result) {
                            if (result.success()) {
                                var geoJSONFormat = new OpenLayers.Format.GeoJSON();
                                var geoJson = geoJSONFormat.write(result.features);
                                var geoObject = angular.fromJson(geoJson);

                                for (var j = 0; j < geoObject.features.length; j++) {
                                    geoObject.features[j].crs = {
                                        "type": "name",
                                        "properties": {
                                            "name": mapInstance.projection
                                        }
                                    };
                                }
                                deferred.resolve(geoObject);
                            } else {
                                deferred.reject(result);
                            }
                        }
                    });
                    return deferred.promise;
                },
                createWfsClient: function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                    throw new Error("NotImplemented");
                },
                addWfsClient: function (wfsClient) {
                    service.wfsClientCache = service.wfsClientCache || [];

                    var wfsClientId = GAWTUtils.generateUuid();
                    service.wfsClientCache[wfsClientId] = wfsClient;

                    return {
                        clientId: wfsClientId
                    };
                },
                is3dSupported: function (mapInstance) {
                    //For OpenLayers 3 we are using ol3-cesium to handle syncing of layers.
                    //If not included, return false as the ol3-cesium library is required.
                    return window.olcs != null;
                },
                is3d: function (mapInstance) {
                    return olCesiumInstance != null ? olCesiumInstance.getEnabled() : false;
                },
                switchTo3dView: function (mapInstance) {
                    //Below validation, regardless of value of getCode() or code_ returns true to BOTH. Needs more investigation.
                    //if(mapInstance.getView().getProjection().getCode() !== 'ESPG:4326' &&
                    //    mapInstance.getView().getProjection().getCode() !== 'ESPG:3857') {
                    //    throw new Error("Map projection not supported. Use EPSG:3857 or EPSG:4326 as the datum-projection to use 3D.");
                    //}
                    if (olCesiumInstance) {
                        olCesiumInstance.setEnabled(true);
                    } else {
                        olCesiumInstance = new olcs.OLCesium({map: mapInstance, target: mapInstance.getTarget()}); // map is the ol.Map instance
                        var scene = olCesiumInstance.getCesiumScene();
                        var cesiumOptions = appConfig().cesiumOptions;
                        if (cesiumOptions != null && cesiumOptions.includeCustomTerrainProvider) {
                            var terrainProvider = new Cesium.CesiumTerrainProvider({
                                url: cesiumOptions.customTerrainProviderUrl
                            });
                            scene.terrainProvider = terrainProvider;
                        }

                        olCesiumInstance.setEnabled(true);
                    }

                    service.syncMapControlsWithOl3Cesium(mapInstance, mapInstance.getTarget());

                },
                switchTo2dView: function (mapInstance) {
                    if (olCesiumInstance) {
                        olCesiumInstance.setEnabled(false);
                        service.syncMapControlsWithOl3(mapInstance, mapInstance.getTarget());
                    }
                },
                syncMapControlsWithOl3Cesium: function (mapInstance, targetId) {
                    var controls = mapInstance.getControls();
                    var mapElement = $('#' + targetId)[0];
                    controls.forEach(function (control) {
                        if (control instanceof ol.control.MousePosition && mapElement) {
                            var scene = olCesiumInstance.getCesiumScene();
                            var ellipsoid = scene.globe.ellipsoid;

                            // Mouse over the globe to see the cartographic position
                            var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                            handler.setInputAction(function (movement) {

                                var cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                                if (cartesian) {
                                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                                    //Update default ol v3 control element for mouse position.
                                    $('.ol-mouse-position')[0].innerText = control.getCoordinateFormat()([longitudeString, latitudeString]);
                                }
                            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                            cesiumMousePositionHandler = handler;
                        }

                        if (control instanceof ol.control.ScaleLine) {
                            //Force update scaleline so measurements don't get out of sync.
                            mapInstance.render();
                        }
                    });
                    for (var i = 0; i < mapClickCallbacks.length; i++) {
                        var cb = mapClickCallbacks[i];
                        ol3CesiumMapService.registerMapClick(olCesiumInstance, cb);
                        mapInstance.un('click', cb);
                    }
                },
                syncMapControlsWithOl3: function (mapInstance, targetId) {
                    for (var i = 0; i < mapClickCallbacks.length; i++) {
                        var cb = mapClickCallbacks[i];
                        ol3CesiumMapService.unRegisterMapClick(olCesiumInstance, cb);
                        mapInstance.on('click', cb);
                    }
                },
                searchWfs: function (mapInstance, clientId, query, attribute) {
                    throw new Error("NotImplemented");
                },
                getMeasureFromEvent: function (mapInstance, e) {
                    if (e.feature == null && e.geometry == null) {
                        throw new Error("Feature cannot be null in Measure event");
                    }
                    if (e.geometry != null && e.geometry instanceof Array && e.geometry.length === 2) {
                        e.feature = new ol.Feature(new ol.geom.Point(e.geometry));
                    }
                    if (e.geometry != null && e.geometry instanceof Array && e.geometry.length > 2) {
                        e.feature = new ol.Feature(new ol.geom.LineString(e.geometry));
                    }
                    var feature = e.feature.clone();
                    var geom = feature.getGeometry().transform(mapInstance.getView().getProjection(), service.displayProjection || 'EPSG:4326');
                    var format = new ol.format.GeoJSON();
                    var geoJson = format.writeFeature(feature);
                    var featureGeoJson = angular.fromJson(geoJson);
                    var distance = service.getGeometryLength(mapInstance, geom);
                    var units = 'm';
                    if (distance > 1000) {
                        units = 'km';
                        distance = (distance / 1000);
                    }
                    return {
                        measurement: distance,
                        units: units,
                        geoJson: featureGeoJson.geometry
                    };
                },
                getGeometryLength: function (mapInstance, geom) {
                    var coordinates = geom.getCoordinates();
                    var length = 0;
                    var wgs84Sphere = new ol.Sphere(6378137);
                    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                        length += wgs84Sphere.haversineDistance(coordinates[i], coordinates[i + 1]);
                    }

                    return length;
                },
                wfsClientCache: {}
            };

            function cleanClientCache(mapInstance, layerService) {
                for (var cache in layerService.postAddLayerCache) {
                    if (layerService.postAddLayerCache.hasOwnProperty(cache)) {
                        var cacheInUse = false;
                        for (var i = 0; i < mapInstance.getLayers().length; i++) {
                            var layer = mapInstance.getLayers()[i];
                            if (cache === layer.id) {
                                cacheInUse = true;
                            }
                        }
                        if (!cacheInUse) {
                            layerService.postAddLayerCache[cache] = null;
                        }
                    }
                }
            }

            return service;
        }]);
})();