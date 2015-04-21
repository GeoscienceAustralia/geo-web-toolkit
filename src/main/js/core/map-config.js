var angular = angular || {};
var OpenLayers = OpenLayers || {};
var app = angular.module('gawebtoolkit.core.map-config', []);

app.value('ga.config', function () {
    'use strict';
    //TODO These values are all OLV2 specific and these values should come from consuming application
    //to merge with defaults written for a specific implementation (like OLV2) in map services.
    var defaults = {
        standardTileSize: 256,
        largeTileSize: 1024,
        veryLargeTileSize: 2048,
        minMapWidth: 900,
        minMapHeight: 600,
        panIncrement: 30,
        smallPanIncrement: 5,
        transitionEffect: 'resize',
        visibility: true,
        isBaseLayer: false,
        wrapDateLine: true,
        sphericalMercator: true,
        opacity: 1.0,
        layerAttribution: '',
        displayInLayerSwitcher: true,
        projection: 'EPSG:102100',
        displayProjection: 'EPSG:4326',
        numZoomLevels: 15,
        transparent: true,
        format: 'image/png',
        tileSize: function (tileType) {
            var result;
            if (tileType) {
                if (tileType === 'large') {
                    result = new OpenLayers.Size(defaults.largeTileSize, defaults.largeTileSize);
                } else if (tileType === 'vlarge') {
                    result = new OpenLayers.Size(defaults.veryLargeTileSize, defaults.veryLargeTileSize);
                }
            } else {
                result = new OpenLayers.Size(defaults.standardTileSize, defaults.standardTileSize);
            }
            return result;
        },
        layerType: 'WMS'
    };
    return {
        //Backwards compatibility
        defaultOptions: defaults,
        olv2Options: defaults,
        cesiumOptions: {
            includeCustomTerrainProvider: false,
            customTerrainProviderUrl: null
        },
        olv3Options: {
            renderer: 'canvas'
        }
    };
});