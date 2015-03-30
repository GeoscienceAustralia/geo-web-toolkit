/* global angular, ol, $ */

(function () {
    "use strict";

    var app = angular.module('gawebtoolkit.mapservices.map.openlayersv3',
        [
            'gawebtoolkit.mapservices.layer.openlayersv3',
            'gawebtoolkit.mapservices.controls.openlayersv3'
        ]);

    app.service('olv3MapService', [
        'olv3LayerService',
        'olv3MapControls',
        'GAWTUtils',
        'GeoLayer',
        '$q',
        '$log',
        function (olv3LayerService, olv3MapControls, GAWTUtils, GeoLayer, $q, $log) {
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
                    viewOptions.projection = ol.proj.get(args.datumProjection);
                    if(args.centerPosition) {
                        var center = JSON.parse(args.centerPosition);
                        viewOptions.center = ol.proj.transform([center[0],center[1]],args.displayProjection,args.datumProjection);
                    }

                    viewOptions.zoom = parseInt(args.zoomLevel);
                    viewOptions.extent = viewOptions.projection.getExtent();
                    var view = new ol.View(viewOptions);
                    config.target = args.mapElementId;
                    config.view = view;
                    config.controls = [];

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
                        console.log(mapInstance.getControls());
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
                    mapInstance.on('click', callback);
                },
                unRegisterMapClick: function (mapInstance, callback) {
                    mapInstance.un('click', callback);
                },
                //TODO unregister
                registerMapMouseMoveEnd: function (mapInstance, callback) {
                    $(mapInstance.getViewport()).on('mousemove',function(obj,e) {
                        if (service.mousemoveTimeout !== undefined) {
                            window.clearTimeout(service.mousemoveTimeout);
                        }
                        service.mousemoveTimeout = window.setTimeout(function () {
                            callback(obj,e);
                        }, 100);
                    });
                },
                registerMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.on(eventName,callback);
                },
                unRegisterMapEvent: function (mapInstance, eventName, callback) {
                    mapInstance.un(eventName,callback);
                },
                getCurrentMapExtent: function (mapInstance) {
                    //var currentExtent = mapInstance.getExtent();
                    //if (currentExtent == null) {
                    //    return null;
                    //}
                    //currentExtent = currentExtent.transform(mapInstance.projection, service.displayProjection);
                    var result = [];
                    //var topLeft = [currentExtent.left, currentExtent.top];
                    //var topRight = [currentExtent.right, currentExtent.top];
                    //var bottomLeft = [currentExtent.left, currentExtent.bottom];
                    //var bottomRight = [currentExtent.right, currentExtent.bottom];
                    //result.push(topLeft);
                    //result.push(topRight);
                    //result.push(bottomLeft);
                    //result.push(bottomRight);

                    return result;
                },
                //return bool
                isControlActive: function (mapInstance, controlId) {
                    //TODO no active state in olv3
                },
                //return geo-web-toolkit control dto
                addControl: function (mapInstance, controlName, controlOptions, elementId, controlId) {
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
                    var con = olv3MapControls.createControl(controlName, controlOptions, div);
                    con.set('id',controlId || con.get('id') || GAWTUtils.generateUuid());
                    mapInstance.addControl(con);
                    resultControl.id = con.get('id');
                    return resultControl;
                },
                //return olv3 control with .metadata { id: '', name: '' }
                getControls: function (mapInstance) {
                    var controls = [];
                    var olv2Controls = mapInstance.getControls();
                    for (var i = 0; i < olv2Controls.length; i++) {
                        var control = olv2Controls[i];
                        controls.push({
                            id: control.metadata.id || control.id,
                            name: control.metadata.type
                        });
                    }
                    return controls;
                },
                //return olv3 control
                getControlById: function (mapInstance, controlId) {
                    var result;
                    var olv2Controls = mapInstance.getControls();

                    for (var i = 0; i < olv2Controls.length; i++) {
                        var control = olv2Controls[i];
                        if (control.id === controlId) {
                            result = control;
                            break;
                        }
                    }
                    return result;
                },
                //return void
                activateControl: function (mapInstance, controlId) {

                },
                //return void
                deactivateControl: function (mapInstance, controlId) {

                },
                //return void
                registerControlEvent: function (mapInstance, controlId, eventName, callback) {

                },
                //return void
                unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {

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
                        if(propVal && propVal.indexOf(propertyValue) !== -1) {
                            results.push(layer);
                        }
                    });
                    return results;
                },
                //Returns array of geo-web-toolkit layer DTO by name using olv3 getLayerByName?
                getLayersByName: function (mapInstance, layerName) {
                    if (typeof layerName !== 'string' && typeof layerName !== 'number') {
                        throw new TypeError('Expected number');
                    }
                    return olv3LayerService.getLayersBy(mapInstance,'name',layerName);
                },
                /**
                 * Updated the layer visibility on the map instance via the provided layerId
                 * @param mapInstance {Object} - mapInstance provided by ga-map directive
                 * @param layerId {string} - unique ID of the layer to set the new visibility
                 * @param visibility {Boolean} - true or false indicating if the layer is to be visible or not
                 * */
                setLayerVisibility: function (mapInstance, layerId, visibility) {
                    if(typeof visibility !== 'string' && typeof visibility !== 'boolean') {
                        throw new TypeError('Invalid visibility value "' + visibility + '"');
                    }
                    var layer = olv3LayerService.getLayerBy(mapInstance,'id', layerId);
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
                    return [geoJsonCoordinateArray[0][0],geoJsonCoordinateArray[0][1],geoJsonCoordinateArray[1][0],geoJsonCoordinateArray[1][1]];
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
                    var layer = olv3LayerService.getLayerBy(mapInstance,'id', layerId);
                    if (layer == null) {
                        throw new ReferenceError('Layer not found - id: "' + layerId + '".');
                    }
                    //Only valid for some layers
                    var extent = layer.getExtent();
                    if(extent == null) {
                        // If not extent, ignore and do nothing.
                        return;
                    }
                    //var transformedExtent = extent.transform(new OpenLayers.Projection(mapInstance.getProjection()), layer.projection);
                    mapInstance.getView().fitExtent(extent,mapInstance.getSize());
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
                    var layers = mapInstance.getLayers();
                    var layerDrawIndex;
                    var i = 0;
                    var found = false;
                    layers.forEach(function (layer) {
                        if(layer.get('id') === layerId && !found) {
                            layerDrawIndex = i;
                            found = true;
                        }
                        i++;
                    });
                    if(layerDrawIndex) {
                        olv3LayerService.raiseLayerDrawOrder(mapInstance,layerId,layerDrawIndex);
                    }

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

                    var point = [lon,lat];
                    if (projection == null) {
                        mapInstance.getView().setCenter(point);
                    } else {
                        var transformedExtent = ol.proj.transform(point,projection,mapInstance.getView().getProjection());
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
                    var layerDrawIndex;
                    var i = 0;
                    var found = false;
                    layers.forEach(function (layer) {
                        if(layer.get('id') === layerId && !found) {
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
                    var markerLayer = mapInstance.getLayersBy('name', markerGroupName);

                    var opx = mapInstance.getLonLatFromPixel(coords);

                    var size = new OpenLayers.Size(args.width, args.height);
                    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                    var icon = new OpenLayers.Icon(iconUrl, size, offset);
                    var marker = new OpenLayers.Marker(opx, icon.clone());
                    marker.map = mapInstance;

                    // Marker layer exists so get the layer and add the marker
                    if (markerLayer != null && markerLayer.length > 0) {
                        markerLayer[0].addMarker(marker);
                    } else { // Marker layer does not exist so we create the layer then add the marker
                        var markers = new OpenLayers.Layer.Markers(markerGroupName);

                        mapInstance.addLayer(markers);
                        markers.addMarker(marker);
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
                    var result = mapInstance.getCoordinateFromPixel([x,y]);

                    if (projection) {
                        result = result.transform(mapInstance.getView().getProjection(), projection);
                    } else if (service.displayProjection && service.displayProjection !== mapInstance.getView().getProjection()) {
                        result = result.transform(mapInstance.getView().getProjection(), service.displayProjection);
                    }
                    return result;
                },
                getPixelFromLonLat: function (mapInstance, lon, lat) {
                    if (lon == null) {
                        throw new ReferenceError("'lon' value cannot be null or undefined");
                    }
                    if (lat == null) {
                        throw new ReferenceError("'lat' value cannot be null or undefined");
                    }
                    return mapInstance.getPixelFromLonLat(new OpenLayers.LonLat(lon, lat));
                },
                getPointFromEvent: function (e) {
                    // Open layers requires the e.xy object, be careful not to use e.x and e.y will return an
                    // incorrect value in regards to your screen pixels
                    return {
                        x: e.xy.x,
                        y: e.xy.y
                    };
                },
                drawPolyLine: function (mapInstance, points, layerName, datum) {
                    var startPoint = new OpenLayers.Geometry.Point(points[0].lon, points[0].lat);
                    var endPoint = new OpenLayers.Geometry.Point(points[1].lon, points[1].lat);

                    // TODO get datum from config
                    var projection = datum || 'EPSG:4326';

                    var vector = new OpenLayers.Layer.Vector(layerName);
                    var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([endPoint, startPoint]).transform(new OpenLayers.Projection(
                        projection), mapInstance.getProjection()));

                    // Style the feature
                    var featureStyle = OpenLayers.Util.applyDefaults(featureStyle, OpenLayers.Feature.Vector.style['default']);
                    featureStyle.strokeWidth = 4;
                    feature.style = featureStyle;

                    vector.addFeatures([feature]);
                    mapInstance.addLayer(vector);
                },
                removeSelectedFeature: function (mapInstance, layerName) {
                    var vectors = mapInstance.getLayersByName(layerName);

                    // Function is called when a feature is selected
                    function onFeatureSelect(feature) {
                        vectors[0].removeFeatures(feature);
                    }

                    // Create the select control
                    var selectCtrl = new OpenLayers.Control.SelectFeature(vectors[0], {
                        onSelect: onFeatureSelect
                    });

                    mapInstance.addControl(selectCtrl);

                    return selectCtrl;
                },
                removeFeature: function (mapInstance, layerName, feature) {
                    var vectors = mapInstance.getLayersByName(layerName);
                    vectors[0].removeFeatures(feature);
                },
                drawFeature: function (mapInstance, args) {
                    var vectors = mapInstance.getLayersByName(args.layerName);
                    var vector;

                    // Create the layer if it doesn't exist
                    if (vectors.length > 0) {
                        vector = vectors[0];
                    } else {
                        vector = new OpenLayers.Layer.Vector(args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    var control;
                    // Create a new control with the appropriate style
                    if (args.featureType.toLowerCase() === 'point') {
                        control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Point);
                        vector.style = {
                            fillColor: args.color,
                            fillOpacity: args.opacity,
                            pointRadius: args.radius,
                            strokeColor: args.color,
                            strokeOpacity: args.opacity
                        };
                        mapInstance.addControl(control);

                        return control;
                    }
                    if (args.featureType.toLowerCase() === 'line') {
                        control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Path);
                        vector.style = {strokeColor: args.color, strokeOpacity: args.opacity};
                        mapInstance.addControl(control);

                        return control;
                    }
                    if (args.featureType.toLowerCase() === 'box') {
                        control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.RegularPolygon, {
                            handlerOptions: {
                                sides: 4,
                                irregular: true
                            }
                        });
                        vector.style = {
                            fillColor: args.color,
                            fillOpacity: args.opacity,
                            strokeColor: args.color,
                            strokeOpacity: args.opacity
                        };
                        mapInstance.addControl(control);

                        return control;
                    }

                    if (args.featureType.toLowerCase() === 'polygon') {
                        control = new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Polygon);
                        vector.style = {
                            fillColor: args.color,
                            fillOpacity: args.opacity,
                            strokeColor: args.color,
                            strokeOpacity: args.opacity
                        };

                        mapInstance.addControl(control);

                        return control;
                    }

                },
                drawLabel: function (mapInstance, args) {
                    var vectors = mapInstance.getLayersByName(args.layerName);
                    var vector;
                    if (vectors.length > 0) {
                        vector = vectors[0];
                    } else {
                        vector = new OpenLayers.Layer.Vector(args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    // Create a point to display the text
                    var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection());
                    var pointFeature = new OpenLayers.Feature.Vector(point);

                    // Add the text to the style of the layer
                    vector.style = {
                        label: args.text,
                        fontColor: args.fontColor,
                        fontSize: args.fontSize,
                        align: args.align,
                        labelSelect: true
                    };

                    vector.addFeatures([pointFeature]);
                    return pointFeature;
                },
                drawLabelWithPoint: function (mapInstance, args) {
                    var vectors = mapInstance.getLayersByName(args.layerName);
                    var vector;

                    if (vectors.length > 0) {
                        vector = vectors[0];
                    } else {
                        vector = new OpenLayers.Layer.Vector(args.layerName);
                        mapInstance.addLayer(vector);
                    }

                    // Create a point to display the text
                    var point = new OpenLayers.Geometry.Point(args.lon, args.lat).transform(new OpenLayers.Projection(args.projection), mapInstance.getProjection());
                    var pointFeature = new OpenLayers.Feature.Vector(point);

                    // Create a circle to display the point
                    var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(point, args.pointRadius, 40, 0);
                    var circlePoint = new OpenLayers.Geometry.Collection([circle, point]);
                    var circleFeature = new OpenLayers.Feature.Vector(circlePoint);

                    // Add the text to the style of the layer
                    vector.style = {
                        label: args.text,
                        fontColor: args.fontColor,
                        fontSize: args.fontSize,
                        align: args.align,
                        labelYOffset: args.labelYOffset,
                        labelSelect: true,
                        fillColor: args.pointColor,
                        strokeColor: args.pointColor,
                        fillOpacity: args.pointOpacity,
                        strokeOpacity: args.pointOpacity
                    };
                    vector.addFeatures([pointFeature, circleFeature]);

                    var features = [pointFeature, circleFeature];

                    return features;
                },
                getFeatureInfo: function (mapInstance, url, featureType, featurePrefix, geometryName, point, tolerance) {
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
                    var points;
                    var format = new OpenLayers.Format.GeoJSON({
                        externalProjection: service.displayProjection,
                        internalProjection: mapInstance.projection
                    });
                    var geoJsonString = format.write(e.geometry);
                    points = angular.fromJson(geoJsonString);
                    return {
                        measurement: e.measure,
                        units: e.units,
                        geoJson: points
                    };
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