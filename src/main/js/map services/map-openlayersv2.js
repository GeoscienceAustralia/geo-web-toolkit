var angular = angular || {};
var OpenLayers = OpenLayers || {};
var console = console || {};
var $ = $ || {};

var app = angular.module('gawebtoolkit.mapservices.map.openlayersv2',
	[
		'gawebtoolkit.mapservices.layer.openlayersv2',
		'gawebtoolkit.mapservices.controls.openlayersv2'
	]);

app.service('olv2MapService', [
	'olv2LayerService',
	'olv2MapControls',
	'GAWTUtils',
	'GeoLayer',
	'$q',
	function (olv2LayerService, olv2MapControls, GAWTUtils,GeoLayer, $q) {
		'use strict';
		//This service provides functionality to answer questions about OLV2 layers, provided all the state
		//This service contains no state, and a mapInstance must be provided.
		//It is simply a place for logic to answer simple questions around the OLV2 data structures

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

				if (args.displayProjection == null) {
					args.displayProjection = mapConfig.defaultOptions.displayProjection;
				}

				service.displayProjection = args.displayProjection;
				if (args.datumProjection == null) {
					args.datumProjection = mapConfig.defaultOptions.projection;
				}
				config.projection = args.datumProjection;
				config.numZoomLevels = mapConfig.defaultOptions.numZoomLevels;
				config.displayProjection = args.displayProjection;

				if (config.controls === undefined || config.controls === null) {
					//TODO move defaults into angular config constant
					config.controls = [ new OpenLayers.Control.Navigation() ];
				}

				return new OpenLayers.Map(args.mapElementId, config);
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
				mapInstance.zoomToMaxExtent();
			},
			currentZoomLevel: function (mapInstance) {
				return mapInstance.getZoom();
			},
			addLayer: function (mapInstance, layer) {
				if (layer.then != null && typeof layer.then === 'function') {
					layer.then(function (resultLayer) {
						mapInstance.addLayer(resultLayer);
						service.postLayerAddAction(mapInstance, layer);
						return new GeoLayer(
							layer.id,
							layer.name,
                            layer.geoLayerType,
							layer.visibility,
							layer.opacity
						);
					});
				} else {
					if (layer.geoLayerType.indexOf('Google') !== -1) {
						mapInstance.zoomDuration = 0;
					}
					mapInstance.addLayer(layer);
					service.postLayerAddAction(mapInstance, layer);
					return new GeoLayer(
						layer.id,
						layer.name,
                        layer.geoLayerType,
						layer.visibility,
						layer.opacity
					);
				}
			},
			postLayerAddAction: function (mapInstance, layer) {
				if (olv2LayerService.postAddLayerCache[layer.id]) {
					if (olv2LayerService.postAddLayerCache[layer.id].FeaturePopup) {
						var control = mapInstance.getControlsBy('id', 'featurePopups');

						if (control.length === 0) {
							control = new OpenLayers.Control.FeaturePopups({
								id: 'featurePopups'
							});
							control.addLayer(layer, olv2LayerService.postAddLayerCache[layer.id].FeaturePopup);
							mapInstance.addControl(control);
						} else {
							control[0].addLayerToControl(layer);
						}
					}
				}
			},
			registerMapMouseMove: function (mapInstance, callback) {
				mapInstance.events.register("mousemove", mapInstance, callback);
			},
			registerMapClick: function (mapInstance, callback) {
				mapInstance.events.register("click", mapInstance, callback);
			},
			unRegisterMapClick: function (mapInstance, callback) {
				mapInstance.events.unregister("click", mapInstance, callback);
			},
			registerMapMouseMoveEnd: function (mapInstance, callback) {
				mapInstance.events.register('moveend', mapInstance, callback);
			},
			registerMapEvent: function (mapInstance, eventName, callback) {
				mapInstance.events.register(eventName, mapInstance, callback);
			},
			unRegisterMapEvent: function (mapInstance, eventName, callback) {
				mapInstance.events.unregister(eventName, mapInstance, callback);
			},
			getCurrentMapExtent: function (mapInstance) {
				var currentExtent = mapInstance.getExtent();
				if (currentExtent == null) {
					return null;
				}
				currentExtent = currentExtent.transform(mapInstance.projection, service.displayProjection);
				var result = [];
				var topLeft = [ currentExtent.left, currentExtent.top ];
				var topRight = [ currentExtent.right, currentExtent.top ];
				var bottomLeft = [ currentExtent.left, currentExtent.bottom ];
				var bottomRight = [ currentExtent.right, currentExtent.bottom ];
				result.push(topLeft);
				result.push(topRight);
				result.push(bottomLeft);
				result.push(bottomRight);

				return result;
			},
			isControlActive: function (mapInstance, controlId) {
				var control;
				for (var i = 0; mapInstance.controls.length; i++) {
					var existingControl = mapInstance.controls[i];
					if (existingControl.id === controlId) {
						control = existingControl;
						break;
					}
				}
				return control.active === true;
			},
			addControl: function (mapInstance, controlName, controlOptions, elementId, controlId) {
				controlName = controlName.toLowerCase();
				var resultControl = {};
				var div;
				if (elementId) {
					div = $('#' + elementId)[0];
				}
				//Sensible default for mouse position
				if (controlName === 'mouseposition') {
					if (controlOptions == null) {
						controlOptions = {
							//displayProjection: service.displayProjection
						};
					}
				}
				var con = olv2MapControls.createControl(controlName, controlOptions, div);
				con.id = controlId || con.id;
				mapInstance.addControl(con);
				resultControl.id = con.id;
				return resultControl;
				//TODO log error, invalid control name provided
				//or return false for layer above to give more useful error.
			},
			getControls: function (mapInstance) {
				var controls = [];
				var olv2Controls = mapInstance.controls;
				for (var i = 0; i < olv2Controls.length; i++) {
					var control = olv2Controls[i];
					controls.push({
						id: control.metadata.id || control.id,
						name: control.metadata.type
					});
				}
				return controls;
			},
			getControlById: function (mapInstance, controlId) {
				var result;
				var olv2Controls = mapInstance.controls;

				for (var i = 0; i < olv2Controls.length; i++) {
					var control = olv2Controls[i];
					if (control.id === controlId) {
						result = control;
						break;
					}
				}
				return result;
			},
			activateControl: function (mapInstance, controlId) {
				var control = service.getControlById(mapInstance, controlId);
				control.activate();
			},
			deactivateControl: function (mapInstance, controlId) {
				var control = service.getControlById(mapInstance, controlId);
				control.deactivate();
			},
			registerControlEvent: function (mapInstance, controlId, eventName, callback) {
				var control = service.getControlById(mapInstance, controlId);
				control.events.register(eventName, undefined, callback);
			},
			unRegisterControlEvent: function (mapInstance, controlId, eventName, callback) {
				var control = service.getControlById(mapInstance, controlId);
				control.events.unregister(eventName, undefined, callback);
			},
			/**
			 * Gets the current list of layers in the map instance and returns as Layer type
			 * @param {Object} mapInstance - the map instance that ga-map directive holds, implementation specific
			 * @returns {Layer[]}
			 * */
			getLayers: function (mapInstance) {
				var layers = [];
				angular.forEach(mapInstance.layers, function (layer) {
					layers.push(new GeoLayer(
                        layer.id,
                        layer.name,
                        layer.geoLayerType,
                        layer.visibility,
                        layer.opacity
                    ));
				});
				return layers;
			},
			getLayersByName: function (mapInstance, layerName) {
				if (typeof layerName !== 'string' && typeof layerName !== 'number') {
					throw new TypeError('Expected number');
				}
				var layers = mapInstance.getLayersBy('name', layerName);
				var results = [];
				for (var i = 0; i < layers.length; i++) {
					var currentLayer = layers[i];
					results.push(new GeoLayer(
                        currentLayer.id,
                        currentLayer.name,
                        currentLayer.geoLayerType,
                        currentLayer.visibility,
                        currentLayer.opacity
                    ));
				}
				return results;
			},
			/**
			 * Updated the layer visibility on the map instance via the provided layerId
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param layerId {string} - unique ID of the layer to set the new visibility
			 * @param visibility {Boolean} - true or false indicating if the layer is to be visible or not
			 * */
			setLayerVisibility: function (mapInstance, layerId, visibility) {
				if (typeof visibility === 'object') {
					throw new TypeError('Expected boolean');
				}
				var currentLayer = mapInstance.getLayersBy('id', layerId)[0];
				currentLayer.setVisibility(visibility);
			},
			/**
			 * Methods that takes a geoJson coordinates array and returns OpenLayers boundingbox
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
			 * @return {Object} - OpenLayers bounding box
			 * */
			createBoundingBox: function (mapInstance, geoJsonCoordinateArray) {
				var bounds = new OpenLayers.Bounds();
				for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
					bounds.extend(new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]));
				}
				//TODO return a geoJson equivalent?
				return bounds.toBBOX();
			},
			/**
			 * Method that takes a geoJson coordinates array and returns OpenLayers.Bounds
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param geoJsonCoordinateArray {geoJsonCoordinates} - array of geoJson coordinates
			 * @param projection {string} - projection that the provided coordinates are in
			 * @returns {Object} - OpenLayers.Bounds object
			 * */
			createBounds: function (mapInstance, geoJsonCoordinateArray, projection) {
				var bounds = new OpenLayers.Bounds();
				for (var i = 0; i < geoJsonCoordinateArray.length; i++) {
					var lonLat = new OpenLayers.LonLat(geoJsonCoordinateArray[i][0], geoJsonCoordinateArray[i][1]);
					lonLat = lonLat.transform(projection, mapInstance.projection);
					bounds.extend(lonLat);
				}
				//TODO return a geoJson equivalent
				return bounds;
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
				mapInstance.zoomToExtent(extent, true);
			},
			//TODO sensible errors when unsupported layerId is used.
			zoomToLayer: function (mapInstance, layerId) {
				var layer = mapInstance.getLayersBy('id', layerId)[0];
				//Only valid for some layers
				var extent = layer.getExtent();
				//var transformedExtent = extent.transform(new OpenLayers.Projection(mapInstance.getProjection()), layer.projection);
				mapInstance.zoomToExtent(extent);
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
				mapInstance.zoomTo(zoomLevel);
			},
			/**
			 * Changes base layer to specified layer ID
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive
			 * @param layerId {string} - ID of the layer that is to be the new base layer
			 * */
			setBaseLayer: function (mapInstance, layerId) {
				var numOfLayers = mapInstance.layers.length;
				for (var i = 0; i < numOfLayers; i++) {
					var layer = mapInstance.layers[i];
					if (layer.id === layerId) {
						mapInstance.setBaseLayer(layer, false);
						break;
					}
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
				var extent = new OpenLayers.LonLat(lon, lat);
				if (projection == null) {
					mapInstance.setCenter(extent);
				} else {
					var transformedExtent = extent.transform(new OpenLayers.Projection(projection), new OpenLayers.Projection(mapInstance.getProjection()));
					mapInstance.setCenter(transformedExtent);
				}
			},
			setInitialPositionAndZoom: function (mapInstance, args) {
				// If a permalink has been provided use th zoom level and current position provided,
				// other wise use the defaults provided by the config
				if (service.getParameterByName('zoom') !== '' && args.centerPosition != null) {
					mapInstance.setCenter(new OpenLayers.LonLat(service.getParameterByName('lon'), service.getParameterByName('lat')), service
						.getParameterByName('zoom'));
				} else if (args.initialExtent != null) {
					var bounds = service.createBounds(mapInstance, args.initialExtent, service.displayProjection);
					service.zoomToExtent(mapInstance, bounds);
				} else if (args.centerPosition) {
					var position = JSON.parse(args.centerPosition);
					mapInstance.setCenter(new OpenLayers.LonLat(position.lon, position.lat), args.zoomLevel);

				} else {
					//No options passed, zoom to max
					mapInstance.zoomToMaxExtent();
				}
			},
			isBaseLayer: function (mapInstance, layerId) {
				var result = false;
				var currentLayer;
				var numOfLayers = mapInstance.layers.length;

				//Find current layer
				for (var i = 0; i < numOfLayers; i++) {
					if (mapInstance.layers[i].id === layerId) {
						currentLayer = mapInstance.layers[i];
						break;
					}
				}
				if (currentLayer) {
					//To get around a bug in OpenLayers where ArcGISCacheLayer.isBaseLayer returning incorrect value
					//due to prototypal inheritance from XYZTileCache, we need to check if the layer we are dealing
					//with is an ArcGISCache layer. Work around is to check if 'ArcGISCache' is in the name of the
					//layerId. Check base layer options instead.
					//TODO this might be due to OpenLayers failing silently rather than a bug, needs checking/reviewing
					if (currentLayer.id.indexOf('ArcGISCache') !== -1) {
						result = currentLayer.options.isBaseLayer;
					} else {
						result = currentLayer.isBaseLayer;
					}
				} else {
					result = false;
				}
				return result;
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
				var layer = mapInstance.getLayersBy('id', layerId)[0];
				layer.setOpacity(opacity);
			},
			/**
			 * Updates all layers as the map contains size has been changed.
			 * @param mapInstance {Object} - mapInstance provided by ga-map directive.
			 * */
			mapResized: function (mapInstance) {
				mapInstance.updateSize();
				for (var i = 0; i < mapInstance.layers.length; i++) {
					mapInstance.layers[i].redraw(true);
				}
			},
			setMapMarker: function (mapInstance, coords, markerGroupName, iconUrl) {
				var markerLayer = mapInstance.getLayersBy('name', markerGroupName);

				var opx = mapInstance.getLonLatFromPixel(coords);

				var size = new OpenLayers.Size(21, 25);
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
			getLonLatFromPixel: function (mapInstance, x, y) {
				//TODO return gaMaps data structure, eg obj = { lat: Number,lon: Number }
				//If olv2 returns this structure then, should a new object get created instead
				//of reference to olv2 obj?
				if (x == null) {
					throw new ReferenceError("'x' value cannot be null or undefined");
				}
				if (y == null) {
					throw new ReferenceError("'y' value cannot be null or undefined");
				}
				var result = mapInstance.getLonLatFromPixel({
					x: x,
					y: y
				});
				if (service.displayProjection && service.displayProjection !== mapInstance.projection) {
					result = result.transform(mapInstance.projection, service.displayProjection);
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
				var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([ endPoint, startPoint ]).transform(new OpenLayers.Projection(
					projection), mapInstance.getProjection()));

				// Style the feature
				var featureStyle = OpenLayers.Util.applyDefaults(featureStyle, OpenLayers.Feature.Vector.style['default']);
				featureStyle.strokeWidth = 4;
				feature.style = featureStyle;

				vector.addFeatures([ feature ]);
				mapInstance.addLayer(vector);
			},
			getFeatureInfo: function (mapInstance, callback, url, featureType, featurePrefix, geometryName, point) {
				var originalPx = new OpenLayers.Pixel(point.x, point.y);
				var llPx = originalPx.add(-mapInstance.zoom, mapInstance.zoom);
				var urPx = originalPx.add(mapInstance.zoom, -mapInstance.zoom);
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
							callback(geoObject);
						}
					}
				});
			},
			getFeatureInfoFromLayer: function (mapInstance, callback, layerId, point) {
				var originalPx = new OpenLayers.Pixel(point.x, point.y);
				var llPx = originalPx.add(-mapInstance.zoom, mapInstance.zoom);
				var urPx = originalPx.add(mapInstance.zoom, -mapInstance.zoom);
				var ll = mapInstance.getLonLatFromPixel(llPx);
				var ur = mapInstance.getLonLatFromPixel(urPx);
				var bounds = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
				var layers = mapInstance.getLayersBy('id', layerId);
				var layer;
				if (layers.length > 0) {
					layer = layers[0];
				} else {
					//Throw error;

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
		return service;
	} ]);