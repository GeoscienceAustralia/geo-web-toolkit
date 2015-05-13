(function(){var a=angular.module("gawebtoolkit.ui.components.deprecated",["gawebtoolkit.ui.directives","ui.utils","gawebtoolkit.utils"]);a.directive("gaDialogToggle",[function(){return{restrict:"E",templateUrl:"src/main/js/ui/components/deprecated/dialog-toggle.html",transclude:true,scope:{gaDialogController:"=",gaToggleClicked:"&"},link:function(b){b.toggleDialog=function(){var c=!b.gaDialogController.isClosed();if(!c){b.gaDialogController.openDialog()}else{b.gaDialogController.closeDialog()}b.gaToggleClicked({dialogController:b.gaDialogController})}}}}]);a.directive("gaStaticDialog",["$timeout","GAWTUtils",function(b,c){return{restrict:"AE",templateUrl:"src/main/js/ui/components/deprecated/static-dialog.html",scope:{controllerEmitEventName:"@",dialogConfig:"=",dialogWindowResize:"&",dialogClosed:"&",dialogOpened:"&"},controller:["$scope",function(e){$(window).bind("resize",function(){if(e.dialogWindowResize!=null){e.dialogConfig=angular.extend(e.dialogConfig,e.dialogWindowResize())}e.dialogConfig.autoOpen=!e.isClosed;$("#"+e.dialogId).dialog(e.dialogConfig)});e.dialogId=c.generateUuid();var d=this;d.openDialog=function(){$("#"+e.dialogId).dialog("open");e.isClosed=false;e.dialogOpened()};d.closeDialog=function(){$("#"+e.dialogId).dialog("close");e.isClosed=true;e.dialogClosed()};d.isClosed=function(){return e.isClosed};e.$emit(e.controllerEmitEventName,d)}],link:function(d){d.$on("$destroy",function(){$("#"+d.dialogId).dialog("destroy").remove()});var e=d.$watch("dialogConfig",function(f){if(f!=null){d.dialogReady=true;$("#"+d.dialogId).bind("dialogclose",function(){d.isClosed=true;b(function(){d.$apply()});d.dialogClosed()});d.isClosed=!f.autoOpen;e()}})},transclude:true}}]);a.directive("gaLayersDialog",["GAWTUtils",function(b){return{restrict:"E",templateUrl:"src/main/js/ui/components/deprecated/layers-dialog.html",scope:{layersData:"=",dialogConfig:"=",mapController:"="},controller:["$scope",function(d){$(window).bind("resize",function(){d.dialogConfig.autoOpen=!d.isClosed;$("#"+d.dialogId).dialog(d.dialogConfig)});d.dialogId=b.generateUuid();d.isClosed=!d.dialogConfig.autoOpen;var c=this;c.openDialog=function(){$("#"+d.dialogId).dialog("open");d.isClosed=false};c.closeDialog=function(){$("#"+d.dialogId).dialog("close");d.isClosed=true};c.isClosed=function(){return d.isClosed};d.$emit("layersDialogReady",c)}],link:function(e,d,c){e.filterBaseLayers=function(f){var g=e.mapController.isBaseLayer(f.id);return !g};e.$on("$destroy",function(){$("#"+e.dialogId).dialog("destroy").remove()});e.$watch(c.uiRefresh,function(){$("#"+e.dialogId).bind("dialogclose",function(){e.isClosed=!e.isClosed})})},transclude:true}}]);a.directive("gaSearchWfs",["$q","$interpolate","$log",function(b,d,c){return{restrict:"EA",templateUrl:"src/main/js/ui/components/deprecated/search-wfs.html",scope:{resultTemplateUrl:"@",mapController:"=",searchEndPoints:"=",onResults:"&",onResultsSelected:"&",onPerformSearch:"&",primaryWfsProperty:"@",searchIconUrl:"@",placeHolder:"@",activateKey:"@"},controller:["$scope",function(e){e.waitingForResponse=false}],link:function(h,g,e){g.bind("keydown",function(m){if(m.keyCode==h.activateKey){h.searchButtonClicked();h.$apply()}});var f=[];var i;h.limitResults=10;h.$watch("searchEndPoints",function(m){if(m){if(h.mapController==null){return}f=[];for(var n=0;n<h.searchEndPoints.length;n++){var o=h.mapController.createWfsClient(h.searchEndPoints[n].url,h.searchEndPoints[n].featureType,h.searchEndPoints[n].featurePrefix,h.searchEndPoints[n].version,h.searchEndPoints[n].geometryName,h.searchEndPoints[n].datumProjection,h.searchEndPoints[n].isLonLatOrderValid);var p=h.mapController.addWfsClient(o);p.endPointId=h.searchEndPoints[n].id;f.push(p);i=h.searchEndPoints[n].featureAttributes}}});if(e.searchEndPoints==null){if(h.mapController!=null){var k=h.mapController.createWfsClient(h.url,h.featureType,h.featurePrefix,h.version,h.geometryName,h.datumProjection);f.push(h.mapController.addWfsClient(k))}}function l(m){return m.replace("'","").replace('"',"").replace("%","").replace("*","")}var j=function(q){q=l(q);h.searchResults=[];var n=b.defer();var p=0;var m=[];h.waitingForResponse=true;for(var o=0;o<f.length;o++){var r=f[o];h.mapController.searchWfs(f[o].clientId,q,i).then(function(t){if(t==null){c.error("Search server is unavailable.");n.resolve([]);return}p++;for(var s=0;s<t.features.length;s++){t.features[s].endPointId=r.endPointId;m.push(t.features[s])}if(p===f.length){n.resolve(m);h.waitingForResponse=false}})}return n.promise};h.getSearchResults=function(m){if(m!=null&&m.length>=3){return j(m).then(function(n){h.onResults({data:n});return n.slice(0,10)})}else{return[]}};h.onSelected=function(m){h.onResultsSelected({item:m})};h.searchButtonClicked=function(){if(typeof h.query==="object"&&h.query.properties!=null){h.query=h.query.properties[h.primaryWfsProperty]}if(h.query!=null){return j(h.query).then(function(m){h.onPerformSearch({data:m});return m})}}},transclude:true}}])})();