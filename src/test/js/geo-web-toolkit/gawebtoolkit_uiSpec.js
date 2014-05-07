//JSLint Initialisers
var describe = describe || {};
var beforeEach = beforeEach || {};
var module = module || {};
var inject = inject || {};
var it = it || {};
var expect = expect || {};
var runs = runs || {};
var angular = angular || {};
var afterEach = afterEach || {};
/*var spyOn = spyOn || {};
 var waitsFor = waitsFor || {};*/
//JSLint Initialisers
describe(
      'gawebtoolkit ui component tests',
      function() {
         'use strict';
         var $compile, $scope, element;

         beforeEach(inject(function(_$compile_, _$rootScope_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $scope = _$rootScope_;
            element = angular
                  .element('<div><ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326">' + '<ga-map-layer layer-name="Australian Landsat Mosaic"'
                        + 'layer-url="http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer"'
                        + 'wrap-date-line="true"'
                        + 'zoom-to-max="true"'
                        + 'map-bg-color="#194584"'
                        + 'layer-type="WMS"'
                        + 'is-base-layer="true"'
                        + '></ga-map-layer></ga-map><div id="gamap"></div></div>');
            $compile(element)(_$rootScope_);
         }));
      });

describe('gawebtoolkit wfs search unit tests', function() {
   'use strict';
   var $compile, $scope, element, mapElement, inputElement, buttonElement;

   // Load the myApp module, which contains the directive
   beforeEach(module('testApp'));

   // Store references to $rootScope and $compile
   // so they are available to all tests in this describe block
   beforeEach(inject(function(_$compile_, _$rootScope_) {
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $compile = _$compile_;
      $scope = _$rootScope_;
      mapElement = angular.element('<ga-map map-element-id="gamap" datum-projection="EPSG:102100" display-projection="EPSG:4326"></ga-map>');

      element = angular
            .element('<ga-search-wfs url="/gis/services/topography/Australian_Topography/MapServer/WFSServer?"' + 'feature-type="Populated_Places_6"'
                  + 'feature-prefix="topography_Australian_Topography"'
                  + 'version="1.1.0"'
                  + 'geometry-name="Shape"'
                  + 'datum-projection="EPSG:4326"'
                  + 'map-controller="mapController"'
                  + 'search-end-points="searchConfig.endPoints"'
                  + 'on-results-selected="onSearchResultsSelected(item)"'
                  + 'on-perform-search="onSearchResults(data)">'
                  + '</ga-search-wfs>');

      $scope.$on('mapControllerReady', function(event, args) {
         $scope.mapController = args;
      });

      $scope.endPoints = [ {
         "id" : "placeNameSearch",
         "url" : "/gis/services/topography/Australian_Topography/MapServer/WFSServer?",
         "featureType" : "Populated_Places_6",
         "featurePrefix" : "topography_Australian_Topography",
         "version" : "1.1.0",
         "geometryName" : "Shape",
         "featureAttributes" : "NAME",
         "visibility" : 0,
         "datumProjection" : "EPSG:4326",
         "isLonLatOrderValid" : false,
         "inputFormat" : "geoJSON"
      } ];

      $compile(mapElement)(_$rootScope_);
      var elm = $compile(element)(_$rootScope_);

      var search = elm.find('input');
      search.val('Canberra');

      var button = elm.find('input[type="button"]');
      button.click();

      //TODO Mock http request
      
      $scope.$digest();
   }));

   it('Validate scope elements on the directive', function() {
      expect(element.isolateScope().url === "/gis/services/topography/Australian_Topography/MapServer/WFSServer?").toBe(true);
      expect(element.isolateScope().featureType === "Populated_Places_6").toBe(true);
      expect(element.isolateScope().featurePrefix === "topography_Australian_Topography").toBe(true);
      expect(element.isolateScope().version === "1.1.0").toBe(true);
      expect(element.isolateScope().geometryName === "Shape").toBe(true);
      expect(element.isolateScope().datumProjection === "EPSG:4326").toBe(true);
   });

   it('Search end points array should have atleast 1 entry', function() {
      expect($scope.endPoints.length > 0).toBe(true);
   });

   it('Validate first endpoint in the array', function() {
      expect($scope.endPoints[0].url === "/gis/services/topography/Australian_Topography/MapServer/WFSServer?").toBe(true);
      expect($scope.endPoints[0].featureType === "Populated_Places_6").toBe(true);
      expect($scope.endPoints[0].featurePrefix === "topography_Australian_Topography").toBe(true);
      expect($scope.endPoints[0].version === "1.1.0").toBe(true);
      expect($scope.endPoints[0].geometryName === "Shape").toBe(true);
      expect($scope.endPoints[0].datumProjection === "EPSG:4326").toBe(true);
   });
});