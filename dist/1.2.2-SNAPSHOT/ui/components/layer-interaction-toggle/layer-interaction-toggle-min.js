(function(){var a=angular.module("gawebtoolkit.ui.components.layer-interaction-toggle",["gawebtoolkit.ui.directives","ui.utils","gawebtoolkit.utils"]);a.directive("gaLayerInteractionToggle",[function(){return{restrict:"E",replace:"true",templateUrl:"src/main/js/ui/components/layer-interaction-toggle/layer-interaction-toggle.html",transclude:true,scope:{toggleIconSource:"@",controllerEmitEventName:"@",toggleOnCallback:"&",toggleOffCallback:"&",onLayerClickCallback:"&",mapController:"=",layerInteractionId:"="},controller:["$scope",function(c){var b=this;b.activate=function(){c.activate()};b.deactivate=function(){c.deactivate()};b.isToggleActive=function(){return c.isToggleOn};c.$emit(c.controllerEmitEventName,b)}],link:function(c,b){c.isToggleOn=false;c.activate=function(){c.mapController.registerMapClick(d);b.removeClass("gaUiToggleOff");b.addClass("gaUiToggleOn");c.isToggleOn=true;c.toggleOnCallback()};c.deactivate=function(){c.mapController.unRegisterMapClick(d);b.removeClass("gaUiToggleOn");b.addClass("gaUiToggleOff");c.isToggleOn=false;c.toggleOffCallback()};c.toggleClicked=function(){c.isToggleOn=!c.isToggleOn;if(c.isToggleOn){c.activate()}else{c.deactivate()}};var d=function(g){var f=c.mapController.getPointFromEvent(g);c.onLayerClickCallback({point:f,interactionId:c.layerInteractionId})}}}}])})();