var angular = angular || {};

var app = angular.module('geowebtoolkit.core.feature-directives', [ 'geowebtoolkit.core.map-directives', 'geowebtoolkit.core.map-services',
    'geowebtoolkit.core.layer-services' ]);

/**
 * @ngdoc directive
 * @name geowebtoolkit.core.feature-directives:gaFeatureLayer
 * @description
 * ## Overview ##
 * gaFeatureLayer adds layer to the page but only for WFS type of requests. For the other types <a href="#/api/geowebtoolkit.core.layer-directives:gaMapLayer">gaFeatureLayer</a> should be used. This tag should be placed within the gaMap tag.
 * @param {string|@} layerName - A name allocated to the layer for future reference
 * @param {string|@} url - A string value that defines the URL from which the content of the layer will be loaded
 * @param {function|@} postAddLayer -  Function callback fired after the layer is added
 * @param {string|@} controllerEmitEventName -  An string value that will be allocated to this layer as controller. This controller can be called in JS codes in order to control the layer programatically
 * @param {string|@} onLayerDestroy - Function callback fired on the destruction of a layer
 * @param {string|@} refreshLayer - Observed attribute that triggers a layer refresh
 *  * Following functions are supported by this controller:
 * <ul>
     <li>hide</li>
     <li>show</li>
     <li>setOpacity</li>
     <li>getFeatures</li>
     <li>addFeature</li>
     <li>createFeatureAsync</li>
     <li>createFeature</li>
     <li>removeFeature</li>
     <li>isLayerControllerReady</li>
 </ul>
 *@param {string|@} visibility -  A boolean value ("true" or "false") that toggles the visibility of the layer on/off
 *
 * @requires gaMap
 * @scope
 * @restrict E
 * @example
<example module="simpleMapWithFeatureLayers">
    <file name="index.html">
        <div id="map"></div>
        <div ng-controller="featureExampleController">
            <geo-map map-element-id="map" center-position='[130, -25]' zoom-level="4">
                <geo-google-layer></geo-google-layer>
                <geo-feature-layer layer-name="My local geoJson features">
                    <geo-feature ng-repeat="feature in features" geo-json-feature="feature">
                    </geo-feature>
                </geo-feature-layer>
            </geo-map>
        </div>
    </file>
    <file name="style.css">#map {width: 650px;height:600px;}</file>
    <file name="script.js">
        var jsonValue = [];
        var app = angular.module('simpleMapWithFeatureLayers', ['geowebtoolkit.core']);
        app.controller('featureExampleController', ['$scope', function ($scope) {
        "use strict";
        $.ajax({type: "GET", url: "../docs-sources/geojson.json", async: false, complete: function(data){jsonValue = data.responseJSON;}});
        $scope.features = jsonValue;
        }]);
    </file>
    <file name="geojson.json">
[ { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.117919921875,
            -34.01519775390625
          ],
        "type" : "Point"
      },
    "id" : "F3__83776",
    "properties" : { "Authority" : "New South Wales",
        "Authority_ID" : "NSW",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "0",
        "Lat_seconds" : "54",
        "Latitude" : "-34.0152",
        "Long_degrees" : "151",
        "Long_minutes" : "7",
        "Long_seconds" : "4",
        "Longitude" : "151.11789999999999",
        "Map_100K" : "9129",
        "Name" : "Canberra Road Reserve",
        "NameU" : "CANBERRA ROAD RESERVE",
        "Place_ID" : "129655",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "O",
        "Status_desc" : "Official",
        "Variant_Name" : "Sylvania Oval"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.4390869140625,
            -34.58929443359375
          ],
        "type" : "Point"
      },
    "id" : "F3__167108",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "21",
        "Latitude" : "-34.589329999999997",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "20",
        "Longitude" : "118.43899999999999",
        "Map_100K" : "2528",
        "Name" : "Canberra West",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "212987",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.45330810546875,
            -34.1287841796875
          ],
        "type" : "Point"
      },
    "id" : "F3__167109",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "43",
        "Latitude" : "-34.128779999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4532",
        "Map_100K" : "2329",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212988",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1279296875,
            -33.8302001953125
          ],
        "type" : "Point"
      },
    "id" : "F3__167110",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "48",
        "Latitude" : "-33.830170000000003",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "117.1279",
        "Map_100K" : "2330",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212989",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1279296875,
            -35.2781982421875
          ],
        "type" : "Point"
      },
    "id" : "F3__176554",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "POPL",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "41",
        "Latitude" : "-35.278263000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "149.12784250000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "222433",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 150.15911865234375,
            -24.63409423828125
          ],
        "type" : "Point"
      },
    "id" : "F3__181742",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-24",
        "Lat_minutes" : "38",
        "Lat_seconds" : "2",
        "Latitude" : "-24.634091999999999",
        "Long_degrees" : "150",
        "Long_minutes" : "9",
        "Long_seconds" : "32",
        "Longitude" : "150.159075",
        "Map_100K" : "8948",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "227621",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.62530517578125,
            -38.388427734375
          ],
        "type" : "Point"
      },
    "id" : "F3__184153",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "18",
        "Latitude" : "-38.388455",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "30",
        "Longitude" : "142.62522100000001",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230032",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.6185302734375,
            -38.3870849609375
          ],
        "type" : "Point"
      },
    "id" : "F3__184288",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "13",
        "Latitude" : "-38.387099999999997",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "6",
        "Longitude" : "142.6185495",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230167",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.17633056640625,
            -35.2191162109375
          ],
        "type" : "Point"
      },
    "id" : "F3__192474",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "13",
        "Lat_seconds" : "8",
        "Latitude" : "-35.219115000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "10",
        "Long_seconds" : "34",
        "Longitude" : "149.17633799999999",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238353",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.34429931640625,
            -35.14599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__192508",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "8",
        "Lat_seconds" : "45",
        "Latitude" : "-35.146063499999997",
        "Long_degrees" : "149",
        "Long_minutes" : "20",
        "Long_seconds" : "39",
        "Longitude" : "149.34425400000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238387",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.43670654296875,
            -34.59130859375
          ],
        "type" : "Point"
      },
    "id" : "F3__194089",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "29",
        "Latitude" : "-34.591428999999998",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "12",
        "Longitude" : "118.436684",
        "Map_100K" : "2528",
        "Name" : "CANBERRA WEST",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "239968",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.453125,
            -34.131591796875
          ],
        "type" : "Point"
      },
    "id" : "F3__194873",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "53",
        "Latitude" : "-34.131582999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4530905",
        "Map_100K" : "2329",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240752",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1260986328125,
            -33.8306884765625
          ],
        "type" : "Point"
      },
    "id" : "F3__194924",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "50",
        "Latitude" : "-33.830748999999997",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "33",
        "Longitude" : "117.1259575",
        "Map_100K" : "2330",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240803",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 146.53692626953125,
            -34.7598876953125
          ],
        "type" : "Point"
      },
    "id" : "F3__201108",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "45",
        "Lat_seconds" : "35",
        "Latitude" : "-34.759879499999997",
        "Long_degrees" : "146",
        "Long_minutes" : "32",
        "Long_seconds" : "13",
        "Longitude" : "146.53694849999999",
        "Map_100K" : "8228",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "246987",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.32928466796875,
            -31.22540283203125
          ],
        "type" : "Point"
      },
    "id" : "F3__212605",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-31",
        "Lat_minutes" : "13",
        "Lat_seconds" : "31",
        "Latitude" : "-31.225390999999998",
        "Long_degrees" : "151",
        "Long_minutes" : "19",
        "Long_seconds" : "45",
        "Longitude" : "151.32918749999999",
        "Map_100K" : "9135",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "258484",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.4290771484375,
            -26.77587890625
          ],
        "type" : "Point"
      },
    "id" : "F3__220603",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-26",
        "Lat_minutes" : "46",
        "Lat_seconds" : "33",
        "Latitude" : "-26.775873000000001",
        "Long_degrees" : "148",
        "Long_minutes" : "25",
        "Long_seconds" : "44",
        "Longitude" : "148.42915450000001",
        "Map_100K" : "8544",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "266482",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1846923828125,
            -35.215087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221660",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "12",
        "Lat_seconds" : "54",
        "Latitude" : "-35.215110000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "4",
        "Longitude" : "149.18454",
        "Map_100K" : "8727",
        "Name" : "Canberra Park",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "267539",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.12188720703125,
            -35.29827880859375
          ],
        "type" : "Point"
      },
    "id" : "F3__221661",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298360000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "18",
        "Longitude" : "149.12191999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Nara Peace Park",
        "NameU" : "CANBERRA NARA PEACE PARK",
        "Place_ID" : "267540",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13330078125,
            -35.2891845703125
          ],
        "type" : "Point"
      },
    "id" : "F3__221662",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "X",
        "Classification" : "Administrative",
        "Concise_gaz" : "N",
        "Feature_code" : "DI",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "21",
        "Latitude" : "-35.289250000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13330999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Central",
        "NameU" : "CANBERRA CENTRAL",
        "Place_ID" : "267541",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.77569580078125,
            -35.48760986328125
          ],
        "type" : "Point"
      },
    "id" : "F3__221663",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "29",
        "Lat_seconds" : "15",
        "Latitude" : "-35.48771",
        "Long_degrees" : "148",
        "Long_minutes" : "46",
        "Long_seconds" : "32",
        "Longitude" : "148.77564000000001",
        "Map_100K" : "8627",
        "Name" : "Canberra Alpine Club",
        "NameU" : "CANBERRA ALPINE CLUB",
        "Place_ID" : "267542",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.19390869140625,
            -35.305908203125
          ],
        "type" : "Point"
      },
    "id" : "F3__221664",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "A",
        "Classification" : "Airfields",
        "Concise_gaz" : "N",
        "Feature_code" : "AF",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "18",
        "Lat_seconds" : "21",
        "Latitude" : "-35.305959999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "37",
        "Longitude" : "149.19388000000001",
        "Map_100K" : "8727",
        "Name" : "Canberra Airport",
        "NameU" : "CANBERRA AIRPORT",
        "Place_ID" : "267543",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.134521484375,
            -35.29840087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221665",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "URBN",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298439999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "8",
        "Long_seconds" : "4",
        "Longitude" : "149.13453999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "267544",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 141.15972900390625,
            -37.4951171875
          ],
        "type" : "Point"
      },
    "id" : "F3__251610",
    "properties" : { "Authority" : "Victoria",
        "Authority_ID" : "VIC",
        "CGDN" : "N",
        "Class_code" : "V",
        "Classification" : "Water Bodies",
        "Concise_gaz" : "N",
        "Feature_code" : "SWP",
        "Lat_degrees" : "-37",
        "Lat_minutes" : "29",
        "Lat_seconds" : "42",
        "Latitude" : "-37.495138900000001",
        "Long_degrees" : "141",
        "Long_minutes" : "9",
        "Long_seconds" : "34",
        "Longitude" : "141.15958330000001",
        "Map_100K" : "7123",
        "Name" : "CANBERRA SWAMP",
        "NameU" : "CANBERRA SWAMP",
        "Place_ID" : "297489",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13348388671875,
            -35.2833251953125
          ],
        "type" : "Point"
      },
    "id" : "F3__271252",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCB",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "59",
        "Latitude" : "-35.283332825000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13333129899999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "317131",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 145.13531494140625,
            -38.0736083984375
          ],
        "type" : "Point"
      },
    "id" : "F3__272183",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCU",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "4",
        "Lat_seconds" : "25",
        "Latitude" : "-38.073677351000001",
        "Long_degrees" : "145",
        "Long_minutes" : "8",
        "Long_seconds" : "6",
        "Longitude" : "145.13521848299999",
        "Map_100K" : "7921",
        "Name" : "Canberra Street",
        "NameU" : "CANBERRA STREET",
        "Place_ID" : "318062",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 137.597900390625,
            -35.85589599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__365723",
    "properties" : { "Authority" : "South Australia",
        "Authority_ID" : "SA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "51",
        "Lat_seconds" : "21",
        "Latitude" : "-35.855870000000003",
        "Long_degrees" : "137",
        "Long_minutes" : "35",
        "Long_seconds" : "52",
        "Longitude" : "137.59782999999999",
        "Map_100K" : "6426",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "411602",
        "State" : "South Australia",
        "State_ID" : "SA",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  }
]
    </file>
</example>
 */
app.directive('geoFeatureLayer', [ '$timeout', '$compile', '$q', 'GeoLayerService', '$log', 'GeoUtils',
    function ($timeout, $compile, $q, GeoLayerService, $log, GeoUtils) {
        'use strict';
        return {
            restrict: "E",
            require: "^geoMap",
            scope: {
                url: '@',
                layerName: '@',
                visibility: '@',
                projection: '@',
                controllerEmitEventName: '@',
                refreshLayer: '@',
                style: '@',
                postAddLayer: '&',
                onLayerDestroy: '&'
            },
            controller: ['$scope',function ($scope) {
                $scope.layerControllerIsReady = false;
                $scope.gaFeatures = [];
                $scope.featurePromises = [];
                var self = this;

                self.hide = function () {
                    $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, false);
                    return self; //for chaining.
                };

                self.show = function () {
                    $scope.mapAPI.mapController.setLayerVisibility($scope.layerDto.id, true);
                    return self; //for chaining.
                };

                self.setOpacity = function (opacity) {
                    $scope.mapAPI.mapController.setOpacity($scope.layerDto.id, opacity);
                    return self; //for chaining.
                };

                self.getFeatures = function () {
                    return $scope.mapAPI.mapController.getLayerFeatures($scope.layerDto.id);
                };

                self.addFeature = function (feature) {
                    if ($scope.style) {
                        var directiveStyle;
                        try {
                            directiveStyle = JSON.parse($scope.style);
                        } catch (e) {
                            throw new Error('Failed to parse style');
                        }

                        GeoLayerService.setFeatureStyle(feature,directiveStyle,$scope.mapAPI.mapController.getFrameworkVersion());
                    }

                    if (feature.then !== null && typeof feature.then === 'function') {
                        if ($scope.layerControllerIsReady) {
                            feature.then(function (resultFeature) {
                                //$scope.$emit('featureAdded', featureDto);
                                $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, resultFeature);
                            });
                        } else {
                            $scope.featurePromises.push(feature);
                        }
                        return feature;
                    } else {
                        var deferred = $q.defer();
                        if ($scope.layerControllerIsReady) {
                            var featureDto = $scope.mapAPI.mapController.addFeatureToLayer($scope.layerDto.id, feature);
                            resolveSyncFeature(deferred, featureDto);
                        } else {
                            $scope.featurePromises.push(deferred.promise);
                            resolveSyncFeature(deferred, feature);
                        }
                        return deferred.promise;
                    }
                };
                var resolveSyncFeature = function (deferred, feature) {
                    $timeout(function () {
                        deferred.resolve(feature);
                    });
                };

                self.createFeatureAsync = function (geoJsonFeature, isLonLatOrderValid) {
                    var deferred = $q.defer();
                    $scope.gaFeatures.push({
                        deferred: deferred,
                        feature: geoJsonFeature,
                        isLonLatOrderValid: isLonLatOrderValid
                    });
                    return deferred.promise;
                };

                self.createFeature = function (geoJsonFeature) {
                    return $scope.mapAPI.mapController.createFeature(geoJsonFeature);
                };

                self.removeFeature = function (featureId) {
                    $scope.mapAPI.mapController.removeFeatureFromLayer($scope.layerDto.id, featureId);
                };

                self.isLayerControllerReady = function () {
                    return $scope.layerControllerIsReady;
                };

                self.clearFeatures = function () {
                    GeoLayerService.clearFeatureLayer(
                        $scope.mapAPI.mapController.getMapInstance(),
                        $scope.layerDto.id,
                        $scope.mapAPI.mapController.getFrameworkVersion());
                };

                if ($scope.controllerEmitEventName) {
                    $scope.$emit($scope.controllerEmitEventName, self);
                }

                return self;
            }],
            transclude: false,
            link: function ($scope, element, attrs, mapController) {
                attrs.$observe('refreshLayer', function (newVal, oldVal) {
                    if(newVal !== oldVal) {
                        $log.info('refresh for - ' + $scope.layerName);
                        $scope.initialiseLayer();
                    }
                });

                $scope.mapAPI = {};
                $scope.mapAPI.mapController = mapController;
                var layerOptions, layer;

                var addLayerCallback = function () {
                    $scope.layerReady = true;
                };

                var constructLayer = function () {
                    $scope.constructionInProgress = true;
                    var layerOptions = GeoLayerService.defaultLayerOptions(attrs, mapController.getFrameworkVersion());
                    layerOptions.datumProjection = $scope.projection || mapController.getProjection();
                    layerOptions.postAddLayer = $scope.postAddLayer;
                    $log.info(layerOptions.layerName + ' - constructing...');
                    var layer = GeoLayerService.createFeatureLayer(layerOptions, mapController.getFrameworkVersion());

                    //mapController.waitingForAsyncLayer();
                    //Async layer add
                    mapController.addLayer(layer).then(function (layerDto) {
                        $scope.layerDto = layerDto;
                        //mapController.asyncLayerLoaded();
                        $scope.layerControllerIsReady = true;
                        $q.all($scope.featurePromises).then(function (allFeatures) {
                            for (var i = 0; i < allFeatures.length; i++) {
                                var feature = allFeatures[i];
                                mapController.addFeatureToLayer($scope.layerDto.id, feature);
                            }
                        });
                    });
                };

                attrs.$observe('visibility', function () {
                    if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                        mapController.setLayerVisibility($scope.layerDto.id, $scope.visibility === "true");
                    }
                });
                attrs.$observe('opacity', function () {
                    if ($scope.layerReady && mapController && $scope.layerDto != null && $scope.layerDto.id) {
                        //$log.info('layer - ' + $scope.layerDto.name + ' - opacity changed - ' + $scope.opacity);
                        mapController.setOpacity($scope.layerDto.id, $scope.opacity);
                    }
                });

                $scope.initCount = 0;
                function reconstructLayer() {
                    $log.info('reconstructing layer...');
                    var allLAyers = mapController.getLayers();
                    var layerIndex = null;

                    for (var i = 0; i < allLAyers.length; i++) {
                        if (allLAyers[i].id === $scope.layerDto.id) {
                            layerIndex = i;
                            break;
                        }
                    }
                    if (layerIndex != null) {
                        mapController.removeLayerById($scope.layerDto.id);
                        $scope.layerDto = null;
                        var layerOptions = GeoLayerService.defaultLayerOptions(attrs, mapController.getFrameworkVersion());
                        layerOptions.datumProjection = $scope.projection || mapController.getProjection();
                        layerOptions.postAddLayer = $scope.postAddLayer;
                        var layer = GeoLayerService.createFeatureLayer(layerOptions, mapController.getFrameworkVersion());
                        //Async layer add
                        mapController.addLayer(layer).then(function (layerDto) {
                            $scope.layerDto = layerDto;
                            addLayerCallback();
                            if($scope.layerDto != null) {
                                var delta = layerIndex - mapController.getLayers().length + 1;
                                mapController.raiseLayerDrawOrder($scope.layerDto.id, delta);
                            }
                            $q.all($scope.featurePromises).then(function (allFeatures) {
                                for (var i = 0; i < allFeatures.length; i++) {
                                    var feature = allFeatures[i];
                                    mapController.addFeatureToLayer($scope.layerDto.id, feature);
                                }
                            });
                        });
                    }
                }

                $scope.initialiseLayer = function () {
                    $log.info('initialising layer...');
                    if ($scope.layerDto != null) {
                        reconstructLayer();
                    } else if($scope.layerReady && $scope.constructionInProgress) {
                        $log.info('...');
                    } else {
                        constructLayer();
                    }
                };

                $scope.$on('$destroy', function () {
                    if ($scope.layerDto.id != null) {
                        $scope.onLayerDestroy({map: mapController.getMapInstance()});
                    }
                    $timeout(function () {
                        GeoLayerService.cleanupLayer(mapController.getMapInstance(), $scope.layerDto.id);
                    });

                    //mapController.removeLayerById($scope.layerDto.id);
                });

                attrs.$observe('visibility', function (newVal) {
                    if ($scope.layerDto != null) {
                        mapController.setLayerVisibility($scope.layerDto.id, newVal);
                    }
                });

                if(attrs.refreshLayer == null) {
                    $scope.initialiseLayer();
                }
            }
        };
    } ]);
/**
 * @ngdoc directive
 * @name geowebtoolkit.core.feature-directives:gaFeature
 *
 * @description
 * Wrapper for a native wfs layer<br>
 * <font color="red">NOTE: </font>This element should be placed within gsFeatureLayer directive
 * 
 * @param {string} vidibility - A boolean value in string format ("true" or "false") that toggles the feature layer on/off
 * @param {string} geoJsonFeature - A string value with the format of geoJson. This is one normaly part of the response of a WFS call
 * @param {string} inputFormat - TBA
 * @param {string} inLonLatOrderValid - TBA
 *
 * @requires gaFeatureLayer
 * @scope
 * @restrict E
 * @example
 * <example module="simpleMapWithFeatureLayers">
    <file name="index.html">
        <div ng-controller="featureExampleController">
            <button ng-click="changefeatures()" class="btn">Remove some feature layers</button>
            <div id="map"></div>
            <geo-map map-element-id="map" datum-projection="EPSG:102100" display-projection="EPSG:4326" center-position='[130, -25]' zoom-level="4">
                <geo-map-layer layer-type="GoogleStreet" layer-name="Simple map layer name" is-base-layer="true">
                </geo-map-layer>
                <geo-feature-layer layer-name="My local geoJson features">
                    <geo-feature ng-repeat="feature in features" geo-json-feature="feature">
                    </geo-feature>
                </geo-feature-layer>
            </geo-map>
        </div>
    </file>
    <file name="style.css">
        #map {width: 650px;height:600px;}
        .btn {
            padding: 7px 10px;
            background-color: #e3e3e3;
            border: 1px solid #333;
            margin-bottom: 1px;
            margin-left: 0;
            font-size: 10pt !important;
        }
    </file>
    <file name="script.js">
        var jsonValue = [];
        var app = angular.module('simpleMapWithFeatureLayers', ['geowebtoolkit.core']);
        app.controller('featureExampleController', ['$scope', function ($scope) {
        "use strict";
        $.ajax({type: "GET", url: "../docs-sources/geojson.json", async: false, complete: function(data){jsonValue = data.responseJSON;}});
        $scope.features = jsonValue;
        $scope.changefeatures = function() {
            $scope.features = $scope.features.slice(2);
        };
        }]);
    </file>
    <file name="geojson.json">
[ { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.117919921875,
            -34.01519775390625
          ],
        "type" : "Point"
      },
    "id" : "F3__83776",
    "properties" : { "Authority" : "New South Wales",
        "Authority_ID" : "NSW",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "0",
        "Lat_seconds" : "54",
        "Latitude" : "-34.0152",
        "Long_degrees" : "151",
        "Long_minutes" : "7",
        "Long_seconds" : "4",
        "Longitude" : "151.11789999999999",
        "Map_100K" : "9129",
        "Name" : "Canberra Road Reserve",
        "NameU" : "CANBERRA ROAD RESERVE",
        "Place_ID" : "129655",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "O",
        "Status_desc" : "Official",
        "Variant_Name" : "Sylvania Oval"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.4390869140625,
            -34.58929443359375
          ],
        "type" : "Point"
      },
    "id" : "F3__167108",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "21",
        "Latitude" : "-34.589329999999997",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "20",
        "Longitude" : "118.43899999999999",
        "Map_100K" : "2528",
        "Name" : "Canberra West",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "212987",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.45330810546875,
            -34.1287841796875
          ],
        "type" : "Point"
      },
    "id" : "F3__167109",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "43",
        "Latitude" : "-34.128779999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4532",
        "Map_100K" : "2329",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212988",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1279296875,
            -33.8302001953125
          ],
        "type" : "Point"
      },
    "id" : "F3__167110",
    "properties" : { "Authority" : "Western Australia",
        "Authority_ID" : "WA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "48",
        "Latitude" : "-33.830170000000003",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "117.1279",
        "Map_100K" : "2330",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "212989",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1279296875,
            -35.2781982421875
          ],
        "type" : "Point"
      },
    "id" : "F3__176554",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "POPL",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "41",
        "Latitude" : "-35.278263000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "40",
        "Longitude" : "149.12784250000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "222433",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 150.15911865234375,
            -24.63409423828125
          ],
        "type" : "Point"
      },
    "id" : "F3__181742",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-24",
        "Lat_minutes" : "38",
        "Lat_seconds" : "2",
        "Latitude" : "-24.634091999999999",
        "Long_degrees" : "150",
        "Long_minutes" : "9",
        "Long_seconds" : "32",
        "Longitude" : "150.159075",
        "Map_100K" : "8948",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "227621",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.62530517578125,
            -38.388427734375
          ],
        "type" : "Point"
      },
    "id" : "F3__184153",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "18",
        "Latitude" : "-38.388455",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "30",
        "Longitude" : "142.62522100000001",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230032",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 142.6185302734375,
            -38.3870849609375
          ],
        "type" : "Point"
      },
    "id" : "F3__184288",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "23",
        "Lat_seconds" : "13",
        "Latitude" : "-38.387099999999997",
        "Long_degrees" : "142",
        "Long_minutes" : "37",
        "Long_seconds" : "6",
        "Longitude" : "142.6185495",
        "Map_100K" : "7421",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "230167",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.17633056640625,
            -35.2191162109375
          ],
        "type" : "Point"
      },
    "id" : "F3__192474",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "13",
        "Lat_seconds" : "8",
        "Latitude" : "-35.219115000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "10",
        "Long_seconds" : "34",
        "Longitude" : "149.17633799999999",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238353",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.34429931640625,
            -35.14599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__192508",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "8",
        "Lat_seconds" : "45",
        "Latitude" : "-35.146063499999997",
        "Long_degrees" : "149",
        "Long_minutes" : "20",
        "Long_seconds" : "39",
        "Longitude" : "149.34425400000001",
        "Map_100K" : "8727",
        "Name" : "CANBERRA PARK",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "238387",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 118.43670654296875,
            -34.59130859375
          ],
        "type" : "Point"
      },
    "id" : "F3__194089",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "35",
        "Lat_seconds" : "29",
        "Latitude" : "-34.591428999999998",
        "Long_degrees" : "118",
        "Long_minutes" : "26",
        "Long_seconds" : "12",
        "Longitude" : "118.436684",
        "Map_100K" : "2528",
        "Name" : "CANBERRA WEST",
        "NameU" : "CANBERRA WEST",
        "Place_ID" : "239968",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.453125,
            -34.131591796875
          ],
        "type" : "Point"
      },
    "id" : "F3__194873",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "7",
        "Lat_seconds" : "53",
        "Latitude" : "-34.131582999999999",
        "Long_degrees" : "117",
        "Long_minutes" : "27",
        "Long_seconds" : "11",
        "Longitude" : "117.4530905",
        "Map_100K" : "2329",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240752",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 117.1260986328125,
            -33.8306884765625
          ],
        "type" : "Point"
      },
    "id" : "F3__194924",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-33",
        "Lat_minutes" : "49",
        "Lat_seconds" : "50",
        "Latitude" : "-33.830748999999997",
        "Long_degrees" : "117",
        "Long_minutes" : "7",
        "Long_seconds" : "33",
        "Longitude" : "117.1259575",
        "Map_100K" : "2330",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "240803",
        "State" : "Western Australia",
        "State_ID" : "WA",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 146.53692626953125,
            -34.7598876953125
          ],
        "type" : "Point"
      },
    "id" : "F3__201108",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-34",
        "Lat_minutes" : "45",
        "Lat_seconds" : "35",
        "Latitude" : "-34.759879499999997",
        "Long_degrees" : "146",
        "Long_minutes" : "32",
        "Long_seconds" : "13",
        "Longitude" : "146.53694849999999",
        "Map_100K" : "8228",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "246987",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 151.32928466796875,
            -31.22540283203125
          ],
        "type" : "Point"
      },
    "id" : "F3__212605",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-31",
        "Lat_minutes" : "13",
        "Lat_seconds" : "31",
        "Latitude" : "-31.225390999999998",
        "Long_degrees" : "151",
        "Long_minutes" : "19",
        "Long_seconds" : "45",
        "Longitude" : "151.32918749999999",
        "Map_100K" : "9135",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "258484",
        "State" : "New South Wales",
        "State_ID" : "NSW",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.4290771484375,
            -26.77587890625
          ],
        "type" : "Point"
      },
    "id" : "F3__220603",
    "properties" : { "Authority" : "Geoscience Australia",
        "Authority_ID" : "GA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-26",
        "Lat_minutes" : "46",
        "Lat_seconds" : "33",
        "Latitude" : "-26.775873000000001",
        "Long_degrees" : "148",
        "Long_minutes" : "25",
        "Long_seconds" : "44",
        "Longitude" : "148.42915450000001",
        "Map_100K" : "8544",
        "Name" : "CANBERRA",
        "NameU" : "CANBERRA",
        "Place_ID" : "266482",
        "State" : "Queensland",
        "State_ID" : "QLD",
        "Status" : "M",
        "Status_desc" : "Mapped 250K"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.1846923828125,
            -35.215087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221660",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "12",
        "Lat_seconds" : "54",
        "Latitude" : "-35.215110000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "4",
        "Longitude" : "149.18454",
        "Map_100K" : "8727",
        "Name" : "Canberra Park",
        "NameU" : "CANBERRA PARK",
        "Place_ID" : "267539",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.12188720703125,
            -35.29827880859375
          ],
        "type" : "Point"
      },
    "id" : "F3__221661",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298360000000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "18",
        "Longitude" : "149.12191999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Nara Peace Park",
        "NameU" : "CANBERRA NARA PEACE PARK",
        "Place_ID" : "267540",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13330078125,
            -35.2891845703125
          ],
        "type" : "Point"
      },
    "id" : "F3__221662",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "X",
        "Classification" : "Administrative",
        "Concise_gaz" : "N",
        "Feature_code" : "DI",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "21",
        "Latitude" : "-35.289250000000003",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13330999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra Central",
        "NameU" : "CANBERRA CENTRAL",
        "Place_ID" : "267541",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 148.77569580078125,
            -35.48760986328125
          ],
        "type" : "Point"
      },
    "id" : "F3__221663",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "P",
        "Classification" : "Parks & Reserves",
        "Concise_gaz" : "N",
        "Feature_code" : "RESV",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "29",
        "Lat_seconds" : "15",
        "Latitude" : "-35.48771",
        "Long_degrees" : "148",
        "Long_minutes" : "46",
        "Long_seconds" : "32",
        "Longitude" : "148.77564000000001",
        "Map_100K" : "8627",
        "Name" : "Canberra Alpine Club",
        "NameU" : "CANBERRA ALPINE CLUB",
        "Place_ID" : "267542",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.19390869140625,
            -35.305908203125
          ],
        "type" : "Point"
      },
    "id" : "F3__221664",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "A",
        "Classification" : "Airfields",
        "Concise_gaz" : "N",
        "Feature_code" : "AF",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "18",
        "Lat_seconds" : "21",
        "Latitude" : "-35.305959999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "11",
        "Long_seconds" : "37",
        "Longitude" : "149.19388000000001",
        "Map_100K" : "8727",
        "Name" : "Canberra Airport",
        "NameU" : "CANBERRA AIRPORT",
        "Place_ID" : "267543",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.134521484375,
            -35.29840087890625
          ],
        "type" : "Point"
      },
    "id" : "F3__221665",
    "properties" : { "Authority" : "Australian Capital Territory",
        "Authority_ID" : "ACT",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "URBN",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "17",
        "Lat_seconds" : "54",
        "Latitude" : "-35.298439999999999",
        "Long_degrees" : "149",
        "Long_minutes" : "8",
        "Long_seconds" : "4",
        "Longitude" : "149.13453999999999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "267544",
        "State" : "Australian Capital Territory",
        "State_ID" : "ACT",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 141.15972900390625,
            -37.4951171875
          ],
        "type" : "Point"
      },
    "id" : "F3__251610",
    "properties" : { "Authority" : "Victoria",
        "Authority_ID" : "VIC",
        "CGDN" : "N",
        "Class_code" : "V",
        "Classification" : "Water Bodies",
        "Concise_gaz" : "N",
        "Feature_code" : "SWP",
        "Lat_degrees" : "-37",
        "Lat_minutes" : "29",
        "Lat_seconds" : "42",
        "Latitude" : "-37.495138900000001",
        "Long_degrees" : "141",
        "Long_minutes" : "9",
        "Long_seconds" : "34",
        "Longitude" : "141.15958330000001",
        "Map_100K" : "7123",
        "Name" : "CANBERRA SWAMP",
        "NameU" : "CANBERRA SWAMP",
        "Place_ID" : "297489",
        "State" : "Victoria",
        "State_ID" : "VIC",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 149.13348388671875,
            -35.2833251953125
          ],
        "type" : "Point"
      },
    "id" : "F3__271252",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCB",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "16",
        "Lat_seconds" : "59",
        "Latitude" : "-35.283332825000002",
        "Long_degrees" : "149",
        "Long_minutes" : "7",
        "Long_seconds" : "59",
        "Longitude" : "149.13333129899999",
        "Map_100K" : "8727",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "317131",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "O",
        "Status_desc" : "Official"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 145.13531494140625,
            -38.0736083984375
          ],
        "type" : "Point"
      },
    "id" : "F3__272183",
    "properties" : { "Authority" : "Australian Hydrographic Service",
        "Authority_ID" : "AHO",
        "CGDN" : "N",
        "Class_code" : "R",
        "Classification" : "Towns & Localities",
        "Concise_gaz" : "N",
        "Feature_code" : "LOCU",
        "Lat_degrees" : "-38",
        "Lat_minutes" : "4",
        "Lat_seconds" : "25",
        "Latitude" : "-38.073677351000001",
        "Long_degrees" : "145",
        "Long_minutes" : "8",
        "Long_seconds" : "6",
        "Longitude" : "145.13521848299999",
        "Map_100K" : "7921",
        "Name" : "Canberra Street",
        "NameU" : "CANBERRA STREET",
        "Place_ID" : "318062",
        "State" : "not applicable",
        "State_ID" : "N/A",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  },
  { "crs" : { "properties" : { "name" : "EPSG:4326" },
        "type" : "name"
      },
    "endPointId" : "placeNameSearch",
    "geometry" : { "coordinates" : [ 137.597900390625,
            -35.85589599609375
          ],
        "type" : "Point"
      },
    "id" : "F3__365723",
    "properties" : { "Authority" : "South Australia",
        "Authority_ID" : "SA",
        "CGDN" : "N",
        "Class_code" : "E",
        "Classification" : "Built Structures",
        "Concise_gaz" : "N",
        "Feature_code" : "HMSD",
        "Lat_degrees" : "-35",
        "Lat_minutes" : "51",
        "Lat_seconds" : "21",
        "Latitude" : "-35.855870000000003",
        "Long_degrees" : "137",
        "Long_minutes" : "35",
        "Long_seconds" : "52",
        "Longitude" : "137.59782999999999",
        "Map_100K" : "6426",
        "Name" : "Canberra",
        "NameU" : "CANBERRA",
        "Place_ID" : "411602",
        "State" : "South Australia",
        "State_ID" : "SA",
        "Status" : "U",
        "Status_desc" : "Unofficial"
      },
    "type" : "Feature"
  }
]    </file>
</example>
 */
app.directive('geoFeature', [function () {
    'use strict';
    return {
        restrict: "E",
        require: "^geoFeatureLayer",
        scope: {
            visibility: '@',
            geoJsonFeature: '=',
            inputFormat: '@',
            isLonLatOrderValid: '@'
            //geoJsonFeatureUrl: '@' //TODO
        },
        transclude: false,
        link: function ($scope, element, attrs, featureLayerController) {
            var initialCreate = true;
            var createFeature = function (newVal, oldVal) {
                if (!newVal && oldVal) {
                    //Remove feature that no longer exists
                    featureLayerController.removeFeature($scope.featureDto.id);
                }

                if (newVal && newVal !== oldVal) {
                    //Remove old feature to be replaced
                    if ($scope.featureDto != null && $scope.featureDto.id.length > 0) {
                        featureLayerController.removeFeature($scope.featureDto.id);
                    }
                    initialCreate = false;
                    var feature = featureLayerController.createFeature($scope.geoJsonFeature);
                    featureLayerController.addFeature(feature).then(function (resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }

                if (newVal && initialCreate) {
                    var initialFeature = featureLayerController.createFeature($scope.geoJsonFeature);
                    initialCreate = false;
                    featureLayerController.addFeature(initialFeature).then(function (resultFeature) {
                        $scope.featureDto = resultFeature;
                    });
                }
            };

            $scope.$on('$destroy', function () {
                if ($scope.featureDto != null) {
                    featureLayerController.removeFeature($scope.featureDto.id);
                }
                if ($scope.geoJsonFeatureWatch != null) {
                    $scope.geoJsonFeatureWatch();
                }
            });

            //Data ready on link, create first feature and then listen for changes
            //Start watch in a timeout due to angular firing watch for initial value
//			if ($scope.geoJsonFeature != null) {
//				var feature = featureLayerController.createFeature($scope.geoJsonFeature);
//				featureLayerController.addFeature(feature).then(function (resultFeature) {
//					$scope.featureDto = resultFeature;
//				});
//			}
            $scope.geoJsonFeatureWatch = $scope.$watch('geoJsonFeature', createFeature);
        }
    };
} ]);