/* global module, describe, beforeEach, inject */
(function () {
    "use strict";
    describe('geowebtoolkit core services unit tests', function () {
        'use strict';
        var $compile, $rootScope;

        beforeEach(module('testApp'));
        // Load the myApp module, which contains the directive
        beforeEach(module('geowebtoolkit.services'));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));
    });
})();
