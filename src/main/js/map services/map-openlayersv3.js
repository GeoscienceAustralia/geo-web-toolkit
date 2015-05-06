/* global angular, ol, olcs, $, Cesium */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.openlayersv3',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3'
        ]);

    var olCesiumInstance;
    var cesiumMousePositionHandler;

    app.service('olv3MapService', [
        'olv3LayerService',
        'olv3MapControls',
        'GAWTUtils',
        'GeoLayer',
        'ga.config',
        '$q',
        '$log',
        '$timeout',
        function (olv3LayerService, olv3MapControls, GAWTUtils, GeoLayer,appConfig, $q, $log, $timeout) {
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
                    if(args.datumProjection == null) {
                        $log.warn('Datum projection has not been provided. Defaulting to EPSG:3857');
                        args.datumProjection = 'EPSG:3857';
                    }
                    if(args.displayProjection == null) {
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
                    config.controls = [];
                    service.displayProjection = args.displayProjection;
                    var map = new ol.Map(config);

                    //HACK TODO Move to a post create map register (not created yet)
                    window.setTimeout(function () {
                        if (args.initialExtent) {
                            var extent = [
                                args.initialExtent[0][0],
                                args.initialExtent[0][1],
                                args.initialExtent[1][0],
                                args.initialExtent[1][1]
                            ];

                            var transformedCenter = ol.proj.transformExtent(extent, args.displayProjection, args.datumProjection);
                            map.getView().fitExtent(transformedCenter, map.getSize());
                        }
                    }, 10);

                    return map;
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
                    $(mapInstance.getViewport()).on('mousemove', callback);
                },
                registerMapClick: function (mapInstance, callback) {
                    if (callback != null) {
                        mapInstance.on('click', callback);
                    }
                },
                unRegisterMapClick: function (mapInstance, callback) {
                    if (callback != null) {
                        mapInstance.un('click', callback);
                    }
                },
                //TODO unregister
                registerMapMouseMoveEnd: function (mapInstance, callback) {
                    $(mapInstance.getViewport()).on('mousemove', function (obj, e) {
                        if (service.mousemoveTimeout !== undefined) {
                            window.clearTimeout(service.mousemoveTimeout);
                        }
                        service.mousemoveTimeout = window.setTimeout(function () {
                            callback(obj, e);
                        }, 100);
                    });
                },
                registerMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.on(eventName, callback);
                },
                unRegisterMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.un(eventName, callback);
                },
                getCurrentMapExtent: function (mapInstance) {
                    var ext = mapInstance.getView().calculateExtent(mapInstance.getSize());
                    if (ext == null) {
                        return null;
                    }
                    var result = [];
                    var topLeft = ol.proj.transform([ext[0], ext[3]], mapInstance.getView().getProjection(), service.displayProjection);
                    var topRight = ol.proj.transform([ext[2], ext[3]], mapInstance.getView().getProjection(), service.displayProjection);
                    var bottomLeft = ol.proj.transform([ext[0], ext[1]], mapInstance.getView().getProjection(), service.displayProjection);
                    var bottomRight = ol.proj.transform([ext[2], ext[1]], mapInstance.getView().getProjection(), service.displayProjection);
                    result.push(topLeft);
                    result.push(topRight);
                    result.push(bottomLeft);
                    result.push(bottomRight);
                    return result;
                },
                //return bool
                isControlActive: function (mapInstance, controlId, controlName) {
                    //Handle UI control compatibility.
                    if(controlName === 'measureline') {
                        return service.measureEventDrawInteraction != null;
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
                    //Overview map can't be added after the map creation unless the map has performed a render.
                    //HACK to wait for map before adding this control.
                    if(controlName === 'overviewmap') {
                        $timeout(function () {
                            mapInstance.addControl(con);
                        },1000);
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
                        if(control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if(existingControl == null) {
                        if(eventName === 'measurepartial') {
                            service.initMeasureEventLayer(mapInstance);
                            service.handleMeasurePartial(mapInstance,service.measureEventVectorLayer,service.measureEventDrawInteraction,callback);
                        }
                        if(eventName === 'measure') {
                            service.initMeasureEventLayer(mapInstance);
                            service.handleMeasure(mapInstance,service.measureEventVectorLayer,service.measureEventDrawInteraction,callback);
                        }

                    } else {
                        existingControl.on(eventName,callback);
                    }
                },
                initMeasureEventLayer: function(mapInstance) {
                    var addLayerAndInteraction = false;
                    if(!service.measureEventVectorLayer) {
                        addLayerAndInteraction = true;
                    }
                    service.measureEventSource = service.measureEventSource || new ol.source.Vector();

                    service.measureEventVectorLayer = service.measureEventVectorLayer || new ol.layer.Vector({
                        source: service.measureEventSource,
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
                    });

                    service.measureEventVectorLayer.set('id', GAWTUtils.generateUuid());

                    service.measureEventDrawInteraction = service.measureEventDrawInteraction || new ol.interaction.Draw({
                        source: service.measureEventSource,
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
                    });

                    if(addLayerAndInteraction) {
                        mapInstance.addLayer(service.measureEventVectorLayer);
                        mapInstance.addInteraction(service.measureEventDrawInteraction);
                    }

                },
                handleMeasurePartial: function (mapInstance,vectorLayer,drawInteraction, callback) {
                    drawInteraction.on("drawstart", function (e) {
                        var isDragging = false;
                        var sketchFeature = e.feature;
                        service.measurePointerMoveEvent = function (event) {
                            isDragging = !!event.dragging;
                        };
                        service.measureSingleClickTimeout = null;
                        service.measurePointerUpEvent = function (event) {
                            if(service.measureSingleClickTimeout) {
                                $timeout.cancel(service.measureSingleClickTimeout);
                            }
                            if(!isDragging) {
                                service.measureSingleClickTimeout = $timeout(function () {
                                    if(!service.measureIsDrawEndComplete) {
                                        event.feature = sketchFeature;
                                        callback(event);
                                    } else {
                                        service.measureIsDrawEndComplete = false;
                                    }
                                },10);
                            }
                        };

                        service.measurePointerDownEvent = function (event) {
                            var doubleClickCheck = new Date(new Date() + 250);
                            if(!isDragging && service.measureSingleClickTimeout != null && doubleClickCheck < service.measureSingleClickTimeout) {
                                service.measureIsDoubleClick = true;
                            }
                            service.measureSingleClickTimeout = new Date();
                        };
                        mapInstance.on('pointerup', service.measurePointerUpEvent);
                        mapInstance.on('pointermove', service.measurePointerMoveEvent);
                        mapInstance.on('pointerdown', service.measurePointerDownEvent);
                        callback(e);
                    }, service);
                },
                handleMeasure: function (mapInstance, vectorLayer, drawInteraction,callback) {
                    service.measureIsDrawEndComplete = false;
                    drawInteraction.on("drawend", function (e) {
                        mapInstance.un('pointerup', service.measurePointerUpEvent);
                        mapInstance.un('pointermove', service.measurePointerMoveEvent);
                        mapInstance.un('pointermove', service.measurePointerDownEvent);
                        callback(e);
                        service.measureIsDrawEndComplete = true;
                    },service);
                },
                //return void
                unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
                    //First check if control exists and then for previous OLV2 events, eg measure so we can handle them as ol.interactions
                    var controls = mapInstance.getControls();
                    var existingControl = null;
                    controls.forEach(function (control) {
                        if(control.get('id') === controlId) {
                            existingControl = control;
                        }
                    });

                    if(existingControl == null) {
                        if(eventName === 'measure' && service.measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            mapInstance.removeInteraction(service.measureEventDrawInteraction);
                            mapInstance.removeLayer(service.measureEventVectorLayer);
                            service.measureEventVectorLayer = null;
                            service.measureEventDrawInteraction = null;
                            service.measureEventSource = null;
                            mapInstance.un('pointerup', service.measurePointerUpEvent);
                            mapInstance.un('pointermove', service.measurePointerMoveEvent);
                            mapInstance.un('pointermove', service.measurePointerDownEvent);
                        }
                        if(eventName === 'measurepartial' && service.measureEventDrawInteraction) {
                            //Handle measure with custom implementation as OLV3 does not have a measure control
                            mapInstance.removeInteraction(service.measureEventDrawInteraction);
                            mapInstance.removeLayer(service.measureEventVectorLayer);
                            service.measureEventVectorLayer = null;
                            service.measureEventDrawInteraction = null;
                            service.measureEventSource = null;
                            mapInstance.un('pointerup', service.measurePointerUpEvent);
                            mapInstance.un('pointermove', service.measurePointerMoveEvent);
                            mapInstance.un('pointermove', service.measurePointerDownEvent);
                        }
                    } else {
                        existingControl.un(eventName,callback);
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
                    if (projection) {
                        var view = mapInstance.getView();
                        var topLeft = ol.proj.transform([geoJsonCoordinateArray[0][0], geoJsonCoordinateArray[0][1]], view.getProjection(), projection);
                        var bottomRight = ol.proj.transform([geoJsonCoordinateArray[0][0], geoJsonCoordinateArray[0][1]], view.getProjection(), projection);
                        return [
                            topLeft[0],
                            topLeft[1],
                            bottomRight[0],
                            bottomRight[1]
                        ];
                    }
                    return [
                        geoJsonCoordinateArray[0][0],
                        geoJsonCoordinateArray[0][1],
                        geoJsonCoordinateArray[1][0],
                        geoJsonCoordinateArray[1][1]
                    ];
                },
                /**
                 * Zooms to a specified extent
                 * //TODO What is common data structure for 'extent' object, current takes OpenLayers bounds
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param extent {Object} - OpenLayers.Bounds object
                 * @example
                 * var bounds = mapController.createBounds([[100.0,-20.0],[160.0,-20.0],[100.0,-40.0],[160.0,-40.0]]);
                 * mapController.zoomToExtent(bounds);
                 * */
                zoomToExtent: function (mapInstance, extent) {

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
                    mapInstance.getView().fitExtent(extent, mapInstance.getSize());
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

                    var point = [lon, lat];
                    if (projection == null) {
                        mapInstance.getView().setCenter(point);
                    } else {
                        var transformedExtent = ol.proj.transform(point, projection, mapInstance.getView().getProjection());
                        mapInstance.getView().setCenter(transformedExtent);
                    }
                },
                setInitialPositionAndZoom: function (mapInstance, args) {
                    // If a permalink has been provided use th zoom level and current position provided,
                    // other wise use the defaults provided by the config
                    if (service.getParameterByName('zoom') !== '' && args.centerPosition != null) {

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
                    var latLon = mapInstance.getCoordinateFromPixel([coords.x,coords.y]);
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(latLon)
                    });

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
                            source: source
                        });
                        markerLayer.set('name', markerGroupName);
                        mapInstance.addLayer(markerLayer);
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

                    var result = mapInstance.getCoordinateFromPixel([x, y]);
                    if (projection) {
                        result = ol.proj.transform(result,mapInstance.getView().getProjection() , projection);
                    } else if (service.displayProjection && service.displayProjection !== mapInstance.getView().getProjection()) {
                        result = ol.proj.transform(result,mapInstance.getView().getProjection(), service.displayProjection);
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
                    return mapInstance.getPixelFromCoordinate([lon, lat]);
                },
                getPointFromEvent: function (e) {
                    // Open layers requires the e.xy object, be careful not to use e.x and e.y will return an
                    // incorrect value in regards to your screen pixels
                    return {
                        x: e.pixel[0],
                        y: e.pixel[1]
                    };
                },
                drawPolyLine: function (mapInstance, points, layerName, datum) {
                    service.drawPolyLineLayerSource = service.drawPolyLineLayerSource || new ol.source.Vector();

                    service.drawPolyLineLayer = service.drawPolyLineLayer || new ol.layer.Vector({
                        source: service.drawPolyLineLayerSource,
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
                    });
                    service.drawPolyLineLayer.set('name',layerName);

                    var startPoint = [points[0].lon, points[0].lat];
                    var endPoint = [points[1].lon, points[1].lat];

                    var geom = new ol.geom.LineString([startPoint,endPoint]);
                    var projection = datum || 'EPSG:4326';
                    geom.transform(projection,mapInstance.getView().getProjection());
                    var feature = new ol.Feature({
                        geometry: geom,
                        name: layerName
                    });
                    service.drawPolyLineLayerSource.addFeature(feature);
                    mapInstance.addLayer(service.drawPolyLineLayer);
                },
                removeSelectedFeature: function (mapInstance, layerName) {
                    var layer = mapInstance.getLayersByName(layerName)[0];

                    var select = new ol.interaction.Select();
                    select.on('select', function (e) {
                        var source = layer.getSource();
                        if(source.removeFeature instanceof Function) {
                            if(e.selected instanceof Array) {
                                for (var i = 0; i < e.selected.length; i++) {
                                    var feature = e.selected[i];
                                    source.removeFeature(feature);
                                }
                            } else {
                                source.removeFeature(e.selected);
                            }
                        } else {
                            throw new Error("No valid layer found with name - " + layerName + " - to remove selected features.");
                        }
                    });

                    mapInstance.addInteraction(select);

                    return select;
                },
                removeFeature: function (mapInstance, layerName, feature) {
                    var featureLayer = olv3LayerService.getLayersBy(mapInstance, 'name', layerName);
                    featureLayer.removeFeatures(feature);
                },
                startDrawingOnLayer: function (mapInstance, layerName, args) {
                    var interactionType;
                    //Drawing interaction types are case sensitive and represent GeometryType in OpenLayers 3
                    switch (args.featureType.toLowerCase()) {
                        case 'point':
                            interactionType = 'Point';
                            break;
                        case 'linestring':
                            interactionType = 'LineString';
                            break;
                        case 'polygon':
                            interactionType = 'Polygon';
                            break;
                        case 'circle':
                            interactionType = 'Circle';
                    }
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.GeoJSON();
                    var style = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: args.fillColor || args.color,
                            radius: args.fillRadius || args.radius
                        }),
                        stroke: new ol.style.Stroke({
                            color: args.strokeColor || args.color,
                            width: args.strokeRadius || args.radius,
                            opacity: args.strokeOpacity || args.opacity
                        }),
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: args.circleColor || args.color
                            })
                        })
                    });
                    // Create the layer if it doesn't exist
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style
                        });

                        vector.set('name',args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var draw = new ol.interaction.Draw({
                        source: source,
                        type: /** @type {ol.geom.GeometryType} */ (interactionType)
                    });
                    service.featureDrawingInteraction = draw;
                    mapInstance.addInteraction(draw);
                },
                stopDrawing: function (mapInstance) {
                    if(service.featureDrawingInteraction) {
                        mapInstance.removeInteraction(service.featureDrawingInteraction);
                    }
                },
                drawLabel: function (mapInstance, layerName, args) {
                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.GeoJSON();
                    var alignText = args.align == 'cm' ? 'center' : args.align || args.textAlign;
                    var textStyle = new ol.style.Text({
                        textAlign: alignText,
                        textBaseline: args.baseline,
                        font: args.font,
                        text: args.text,
                        fill: new ol.style.Fill({color: args.fillColor || args.fontColor || args.color}),
                        stroke: new ol.style.Stroke({color: args.outlineColor || args.color, width: args.outlineWidth || args.width}),
                        offsetX: args.offsetX,
                        offsetY: args.offsetY,
                        rotation: args.rotation
                    });

                    var style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: args.circleRadius || args.radius,
                            fill: new ol.style.Fill({
                                color: args.fillColor || args.color || '#000000'
                            }),
                            stroke: new ol.style.Stroke(
                                {
                                    color: args.strokeColor || args.color || '#000000',
                                    width: args.strokeRadius || args.radius
                                })
                        }),
                        text: textStyle
                    });
                    if (vectors.length > 0) {
                        vector = vectors[0];
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style
                        });

                        vector.set('name',layerName || args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var updatedPosition = ol.proj.transform([args.lon, args.lat],args.projection, mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedPosition);
                    var pointFeature = new ol.Feature({
                        geometry: point
                    });
                    vector.getSource().addFeature(pointFeature);
                    // Add the text to the style of the layer
                    vector.setStyle(style);
                    var format = new ol.format.GeoJSON();


                    //Always return geoJson
                    return angular.fromJson(format.writeFeature(pointFeature));
                },
                drawLabelWithPoint: function (mapInstance,layerName, args) {

                    var vectors = olv3LayerService._getLayersBy(mapInstance, 'name', layerName || args.layerName);
                    var vector;
                    var source = new ol.source.GeoJSON();
                    var textStyle = new ol.style.Text({
                        textAlign: args.align,
                        textBaseline: args.baseline,
                        font: (args.fontWeight || args.weight || 'normal') + ' ' + (args.fontSize || args.size || '12px') + ' ' + (args.font || 'sans-serif'),
                        text: args.text,
                        fill: new ol.style.Fill({color: args.fillColor || args.color, width: args.fillWdith || args.width || 1}),
                        stroke: new ol.style.Stroke({color: args.outlineColor || args.color, width: args.outlineWidth || args.width || 1}),
                        offsetX: args.offsetX || 0,
                        offsetY: args.offsetY || (args.labelYOffset * -1) || 15,
                        rotation: args.rotation
                    });
                    var fillColor;
                    var fillColorHex = args.fillColor || args.color || '#000000';
                    var fillOpacity = args.fillOpacity || args.opacity || 0.5;
                    if(fillColorHex.indexOf('#') === 0) {
                        fillColor = GAWTUtils.convertHexAndOpacityToRgbArray(fillColorHex,fillOpacity);
                    } else {
                        fillColor = args.fillColor || args.color;
                    }

                    var strokeColor;
                    var strokeColorHex = args.fillColor || args.color || '#000000';
                    var strokeOpacity = args.strokeOpacity || args.opacity || 1.0;
                    if(strokeColorHex.indexOf('#') === 0) {
                        strokeColor = GAWTUtils.convertHexAndOpacityToRgbArray(strokeColorHex,strokeOpacity);
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
                        if(!(vector.getSource().addFeature instanceof Function)) {
                            throw new Error("Layer name '" + layerName || args.layerName + "' corresponds to a layer with an invalid source. Layer source must support features.");
                        }
                        vector.setStyle(style);
                    } else {
                        vector = new ol.layer.Vector({
                            source: source,
                            style: style
                        });

                        vector.set('name',layerName || args.layerName);
                        mapInstance.addLayer(vector);
                        vector.setStyle(style);
                    }

                    // Create a point to display the text
                    var updatedLoc = ol.proj.transform([args.lon, args.lat], args.projection || service.displayProjection, mapInstance.getView().getProjection());
                    var point = new ol.geom.Point(updatedLoc);

                    var pointFeature = new ol.Feature({
                        geometry: point
                    });


                    vector.getSource().addFeatures([pointFeature]);

                    var features = [pointFeature];
                    var format = new ol.format.GeoJSON();
                    //Always return geoJson
                    return angular.fromJson(format.writeFeatures([pointFeature]));
                },
                getFeatureInfo: function (mapInstance, url, featureType, featurePrefix, geometryName, point, tolerance) {
                    var vectorSource = new ol.source.ServerVector({
                        format: new ol.format.WFS(),
                        loader: function (extent, resolution, projection) {
                            $.ajax({
                                url: url
                            }).done(loadFeatures);
                        },
                        strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
                            maxZoom: mapInstance.geoMaxZoom
                        })),
                        projection: mapInstance.getView().getProjection()
                    });

                    var loadFeatures = function (response) {
                        vectorSource.addFeatures(vectorSource.readFeatures(response));
                    };

                    var vectorLayer = new ol.layer.Vector({
                        source: vectorSource,
                        style: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'rbg(0,0,255,1.0)',
                                width: 5
                            })
                        })
                    });

                    tolerance = tolerance || 0;
                    var deferred = $q.defer();
                    var originalPx = new OpenLayers.Pixel(point.x, point.y);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getLonLatFromPixel(llPx);
                    var ur = mapInstance.getLonLatFromPixel(urPx);
                    var bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
                    var protocol = new OpenLayers.Protocol.WFS({
                        formatOptions: {
                            outputFormat: 'text/xml'
                        },
                        url: url,
                        version: '1.1.0',
                        srsName: mapInstance.projection,
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
                                            "name": mapInstance.projection
                                        }
                                    };
                                }

                                deferred.resolve(geoObject);
                            }
                        }
                    });
                    return deferred.promise;
                },
                getFeatureInfoFromLayer: function (mapInstance, callback, layerId, point, tolerance) {
                    tolerance = tolerance || 0;
                    var originalPx = new OpenLayers.Pixel(point.x, point.y);
                    var llPx = originalPx.add(-tolerance, tolerance);
                    var urPx = originalPx.add(tolerance, -tolerance);
                    var ll = mapInstance.getLonLatFromPixel(llPx);
                    var ur = mapInstance.getLonLatFromPixel(urPx);
                    var bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
                    var layers = mapInstance.getLayersBy('id', layerId);
                    var layer;
                    if (layers.length > 0) {
                        layer = layers[0];
                    } else {
                        //Throw error;
                        throw new Error("Invalid layer id");
                    }
                    var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(layer);
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
                                callback(geoObject);
                            }
                        }
                    });
                },
                createWfsClient: function (url, featureType, featurePrefix, version, geometryName, datumProjection, isLonLatOrderValid) {
                    var protocol = new OpenLayers.Protocol.WFS({
                        url: url,
                        featureType: featureType,
                        featurePrefix: featurePrefix,
                        version: version,
                        geometryName: geometryName,
                        srsName: datumProjection
                    });

                    protocol.isLonLatOrderValid = isLonLatOrderValid;

                    return protocol;
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
                        if(appConfig.cesiumOptions != null && appConfig.cesiumOptions.includeCustomTerrainProvider) {
                            var terrainProvider = new Cesium.CesiumTerrainProvider({
                                url: appConfig.cesiumOptions.customTerrainProviderUrl
                            });
                            scene.terrainProvider = terrainProvider;
                        }

                        $timeout(function () {
                            service.syncMapControlsWithOl3Cesium(mapInstance, mapInstance.getTarget());
                        });

                        olCesiumInstance.setEnabled(true);
                    }

                },
                switchTo2dView: function (mapInstance) {
                    if (olCesiumInstance) {
                        olCesiumInstance.setEnabled(false);
                        service.syncMapControlsWithOl3(mapInstance,mapInstance.getTarget());
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

                        if(control instanceof ol.control.ScaleLine) {
                            //Force update scaleline so measurements don't get out of sync.
                            mapInstance.render();
                        }
                    });
                },
                syncMapControlsWithOl3: function (mapInstance, targetId) {

                },
                searchWfs: function (mapInstance, clientId, query, attribute) {
                    var client = service.wfsClientCache[clientId];
                    var deferred = $q.defer();

                    var callBackFn = function (response) {
                        if (response.priv.status != '200') {
                            deferred.resolve(null);
                            return;
                        }
                        for (var i = 0; i < response.features.length; i++) {
                            if (service.wfsClientCache[clientId].isLonLatOrderValid == false) {
                                var invalidLat = response.features[i].geometry.x;
                                var invalidLon = response.features[i].geometry.y;

                                response.features[i].geometry.x = invalidLon;
                                response.features[i].geometry.y = invalidLat;
                            }
                        }

                        var geoJSONFormat = new OpenLayers.Format.GeoJSON();
                        var geoJson = geoJSONFormat.write(response.features);
                        var geoObject = angular.fromJson(geoJson);

                        for (var j = 0; j < geoObject.features.length; j++) {
                            geoObject.features[j].crs = {
                                "type": "name",
                                "properties": {
                                    "name": client.srsName
                                }
                            };
                        }

                        deferred.resolve(geoObject);
                    };

                    var filter = new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LIKE,
                        property: attribute,
                        matchCase: false,
                        value: query.toUpperCase() + '*'
                    });

                    client.read({
                        filter: filter,
                        callback: callBackFn
                    });

                    return deferred.promise;
                },
                getMeasureFromEvent: function (mapInstance, e) {
                    if(e.feature == null && e.geometry == null) {
                        throw new Error("Feature cannot be null in Measure event");
                    }
                    if(e.geometry != null && e.geometry instanceof Array && e.geometry.length === 2) {
                        e.feature = new ol.Feature(new ol.geom.Point(e.geometry));
                    }
                    if(e.geometry != null && e.geometry instanceof Array && e.geometry.length > 2) {
                        e.feature = new ol.Feature(new ol.geom.LineString(e.geometry));
                    }
                    var feature = e.feature.clone();
                    var geom = feature.getGeometry().transform(mapInstance.getView().getProjection(),service.displayProjection);
                    var format = new ol.format.GeoJSON();
                    var geoJson = format.writeFeature(feature);
                    var featureGeoJson = angular.fromJson(geoJson);
                    var distance = service.getGeometryLength(mapInstance,geom);
                    var units = 'm';
                    if(distance > 1000) {
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