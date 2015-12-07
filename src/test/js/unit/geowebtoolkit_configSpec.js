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
var spyOn = spyOn || {};
var jasmine = jasmine || {};
/* var waitsFor = waitsFor || {};*/
//JSLint Initialisers
describe(
    'geowebtoolkit config component tests',
    function () {
        'use strict';
        var $compile, $scope, element, $httpBackend, preConfigListener, listener;

        beforeEach(module('testApp'));

        beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $scope = _$rootScope_;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend
                .when('GET', '/resources/js/amsis.json')
                .respond(
                {
                    "applicationTitle": "AMSIS",
                    "applicationId": "amsis",
                    "applicationBlurb": "AMSIS is a web based interactive mapping and decision support system that improves access to integrated government and non-government information in the Australian Marine Jurisdiction. AMSIS contains many layers of information displayed in themes of Maritime Boundaries, Petroleum, Fisheries, Regulatory, Environment, Native Title and Offshore Minerals. The data has been sourced from Geoscience Australia, other Australian government agencies and some industry sources. AMSIS also contains the offshore mineral locations data that was used to create the Offshore Minerals Map. Information in this application should not be relied upon as the sole source of information for commercial and operational decisions. AMSIS should not be used for navigational purposes.",
                    "headerConfig": {
                        "title": "AMSIS -Dev",
                        "backgroundImageUrl": "resources/img/header_bg.png"
                    },
                    "leftDialogConfig": {
                        "title": "About",
                        "autoOpen": "true",
                        "position": "left top"
                    },
                    "leftDialogBody": "AMSIS is a web based interactive mapping and decision support system that improves access to integrated government and non-government information in the Australian Marine Jurisdiction.",
                    "rightDialogConfig": {
                        "title": "Layers",
                        "autoOpen": "open",
                        "position": "right top"
                    },
                    "rightDialogBody": "Body of text for the right hand",
                    "datumProjection": "EPSG:102100",
                    "displayProjection": "EPSG:4326",
                    "configuredGroups": [
                        {
                            "baseMaps": [
                                {
                                    "mapType": "XYZTileCache",
                                    "visibility": true,
                                    "name": "World Image",
                                    "url": "http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer",
                                    "mapBGColor": "194584",
                                    "opacity": 1.0,
                                    "wrapDateLine": true,
                                    "attribution": "World <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a> and <a target='_blank' href='http://www.naturalearthdata.com/'>Natural Earth</a>"
                                }
                            ],
                            "layerMaps": [
                                {
                                    "groupName": "Group 1",
                                    "sectionName": "Section 1",
                                    "mapType": "WMS",
                                    "visibility": false,
                                    "name": "Australian Landsat Mosaic",
                                    "url": "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                                    "layers": "Australian Landsat",
                                    "opacity": 1.0,
                                    "tileType": "large"
                                },
                                {
                                    "groupName": "Group 2",
                                    "sectionName": "",
                                    "mapType": "WMS",
                                    "visibility": false,
                                    "name": "Australian Seabed Features",
                                    "url": "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                                    "layers": "Geomorphic_Features"
                                },
                                {
                                    "groupName": "Group 2",
                                    "sectionName": "",
                                    "mapType": "WMS",
                                    "visibility": true,
                                    "name": "Topographic",
                                    "url": "http://www.ga.gov.au/gis/services/topography/Australian_Topography_NoAntiAliasing/MapServer/WMSServer",
                                    "layers": "Framework Boundaries,Framework Boundaries SS,Roads SS,Roads MS,Roads,State Names on Boundaries,State Names Anno MS,State Names Anno SS,Populated Places,Populated Places MS,Populated Places SS,Cities",
                                    "tileType": "large",
                                    "attribution": "Geoscience Australia Topography <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a>"
                                }
                            ]
                        }
                    ]
                });
            $httpBackend.when('GET', 'resources/partial/configmap.html').respond(
                    '<div ng-controller="testConfigController">' +
                    '<div ui-jq="dialog" ui-options="geoConfig.rightDialogConfig">' +
                    '<div ng-repeat="layer in layers">' +
                    '{{layer.groupName}}' +
                    '<div ng-repeat="layer in layers">' +
                    '<input type="checkbox" ng-checked="layer.visibility"' +
                    'ng-click="layerClicked(layer.id)"> {{layer.name}}</input>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

            listener = jasmine.createSpy('listener');
            $scope.$on('configDataLoaded', function (event, args) {
                $scope.finalTestConfig = args;
                listener(args);
            });

            preConfigListener = jasmine.createSpy('preConfigListener');
            $scope.preConfigTest = function (config) {
                $scope.testConfig = config;
                preConfigListener(config);
                config.foo = "Testing preconfig modification";
                return config;
            };
            element = angular
                .element('<geo-map-config geo-config-path="/resources/js/amsis" static-config="true" template-path="resources/partial/configmap.html" ' +
                    '</geo-map-config>');

            $compile(element)($scope);

        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('Should load config and fire "configDataLoaded" event', function () {
            $httpBackend.expectGET('/resources/js/amsis.json');
            $httpBackend.flush();
            expect(listener).toHaveBeenCalled();
            expect(listener).toHaveBeenCalledWith($scope.finalTestConfig);
        });
    });
describe('geowebtoolkit config component tests - pre and post config hooks',
    function () {
        'use strict';
        var $compile, $scope, element, $httpBackend, preConfigListener, listener, postConfigListener;

        beforeEach(module('testApp'));

        beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $scope = _$rootScope_;
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend
                .when('GET', '/resources/js/amsis.json')
                .respond(
                {
                    "applicationTitle": "AMSIS",
                    "applicationId": "amsis",
                    "applicationBlurb": "AMSIS is a web based interactive mapping and decision support system that improves access to integrated government and non-government information in the Australian Marine Jurisdiction. AMSIS contains many layers of information displayed in themes of Maritime Boundaries, Petroleum, Fisheries, Regulatory, Environment, Native Title and Offshore Minerals. The data has been sourced from Geoscience Australia, other Australian government agencies and some industry sources. AMSIS also contains the offshore mineral locations data that was used to create the Offshore Minerals Map. Information in this application should not be relied upon as the sole source of information for commercial and operational decisions. AMSIS should not be used for navigational purposes.",
                    "headerConfig": {
                        "title": "AMSIS -Dev",
                        "backgroundImageUrl": "resources/img/header_bg.png"
                    },
                    "leftDialogConfig": {
                        "title": "About",
                        "autoOpen": "true",
                        "position": "left top"
                    },
                    "leftDialogBody": "AMSIS is a web based interactive mapping and decision support system that improves access to integrated government and non-government information in the Australian Marine Jurisdiction.",
                    "rightDialogConfig": {
                        "title": "Layers",
                        "autoOpen": "open",
                        "position": "right top"
                    },
                    "rightDialogBody": "Body of text for the right hand",
                    "datumProjection": "EPSG:102100",
                    "displayProjection": "EPSG:4326",
                    "configuredGroups": [
                        {
                            "baseMaps": [
                                {
                                    "mapType": "XYZTileCache",
                                    "visibility": true,
                                    "name": "World Image",
                                    "url": "http://www.ga.gov.au/gisimg/rest/services/topography/World_Bathymetry_Image_WM/MapServer",
                                    "mapBGColor": "194584",
                                    "opacity": 1.0,
                                    "wrapDateLine": true,
                                    "attribution": "World <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a> and <a target='_blank' href='http://www.naturalearthdata.com/'>Natural Earth</a>"
                                }
                            ],
                            "layerMaps": [
                                {
                                    "groupName": "Group 1",
                                    "sectionName": "Section 1",
                                    "mapType": "WMS",
                                    "visibility": false,
                                    "name": "Australian Landsat Mosaic",
                                    "url": "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/WMSServer",
                                    "layers": "Australian Landsat",
                                    "opacity": 1.0,
                                    "tileType": "large"
                                },
                                {
                                    "groupName": "Group 2",
                                    "sectionName": "",
                                    "mapType": "WMS",
                                    "visibility": false,
                                    "name": "Australian Seabed Features",
                                    "url": "http://www.ga.gov.au/gis/services/marine_coastal/Australian_Seabed_Features/MapServer/WMSServer",
                                    "layers": "Geomorphic_Features"
                                },
                                {
                                    "groupName": "Group 2",
                                    "sectionName": "",
                                    "mapType": "WMS",
                                    "visibility": true,
                                    "name": "Topographic",
                                    "url": "http://www.ga.gov.au/gis/services/topography/Australian_Topography_NoAntiAliasing/MapServer/WMSServer",
                                    "layers": "Framework Boundaries,Framework Boundaries SS,Roads SS,Roads MS,Roads,State Names on Boundaries,State Names Anno MS,State Names Anno SS,Populated Places,Populated Places MS,Populated Places SS,Cities",
                                    "tileType": "large",
                                    "attribution": "Geoscience Australia Topography <a target='_blank' href='http://creativecommons.org/licenses/by/3.0/au/deed.en'>CC-By-Au</a>"
                                }
                            ]
                        }
                    ]
                });
            $httpBackend.when('GET', 'resources/partial/configmap.html').respond(
                    '<div ng-controller="testConfigController">' +
                    '<div ui-jq="dialog" ui-options="geoConfig.rightDialogConfig">' +
                    '<div ng-repeat="layer in layers">' +
                    '{{layer.groupName}}' +
                    '<div ng-repeat="layer in layers">' +
                    '<input type="checkbox" ng-checked="layer.visibility"' +
                    'ng-click="layerClicked(layer.id)"> {{layer.name}}</input>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

            listener = jasmine.createSpy('listener');
            $scope.orderOfOps = [];

            $scope.$on('configDataLoaded', function (event, args) {
                $scope.finalTestConfig = args;
                listener(args);
                $scope.orderOfOps.push("emit config fired");
            });

            preConfigListener = jasmine.createSpy('preConfigListener');
            postConfigListener = jasmine.createSpy('postConfigListener');

            $scope.preConfigTest = function (config) {
                $scope.testConfig = config;
                preConfigListener(config);
                $scope.orderOfOps.push("pre config fired");
                config.foo = "Testing preconfig modification";
                return config;
            };

            $scope.postConfigTest = function (config) {
                postConfigListener(config);
                $scope.orderOfOps.push("post config fired");
            };
            element = angular
                .element('<geo-map-config geo-config-path="/resources/js/amsis.json" template-path="resources/partial/configmap.html" ' +
                    'pre-config="preConfigTest(config)" post-config="postConfigTest(config)">' +
                    '</geo-map-config>');

            $compile(element)($scope);

        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });


        it('Should fire pre-config method', function () {
            $httpBackend.expectGET('/resources/js/amsis.json');
            $httpBackend.flush();
            expect(preConfigListener).toHaveBeenCalled();
            expect(preConfigListener).toHaveBeenCalledWith($scope.testConfig);
        });

        it('Should pass modified config back from pre-config', function () {
            $httpBackend.expectGET('/resources/js/amsis.json');
            $httpBackend.flush();
            expect(preConfigListener).toHaveBeenCalled();
            expect(preConfigListener).toHaveBeenCalledWith($scope.testConfig);
            expect($scope.testConfig.foo === 'Testing preconfig modification').toBe(true);
        });

        it('Should fire post-config method', function () {
            $httpBackend.expectGET('/resources/js/amsis.json');
            $httpBackend.flush();
            expect(preConfigListener).toHaveBeenCalled();
            expect(preConfigListener).toHaveBeenCalledWith($scope.testConfig);
        });

        it('Should fire config events in the correct order', function () {
            $httpBackend.expectGET('/resources/js/amsis.json');
            $httpBackend.flush();
            expect($scope.orderOfOps[0]).toBe('pre config fired');
            expect($scope.orderOfOps[1]).toBe('emit config fired');
            expect($scope.orderOfOps[2]).toBe('post config fired');
        });

    });