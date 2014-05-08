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
describe('gawebtoolkit core services unit tests', function() {
   'use strict';
   var $compile, $rootScope;

   beforeEach(module('testApp'));
   // Load the myApp module, which contains the directive
   beforeEach(module('gawebtoolkit.services'));

   // Store references to $rootScope and $compile
   // so they are available to all tests in this describe block
   beforeEach(inject(function(_$compile_, _$rootScope_) {
      // The injector unwraps the underscores (_) from around the parameter names when matching
      $compile = _$compile_;
      $rootScope = _$rootScope_;
   }));
});