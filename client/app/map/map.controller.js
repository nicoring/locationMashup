'use strict';

angular.module('locationMashupApp')
  .controller('MapCtrl', function ($scope, $http, $location, uiGmapGoogleMapApi) {

  	$scope.message = "Berlin Map!";
    $scope.markers = [];

    $scope.isMarkerSelected = false;
    $scope.selected = {};

    $scope.map = {
    	// center of berlin
    	center: {
    		latitude: 52.516666,
    		longitude: 13.383333
    	},
    	zoom: 12,
    	minZoom: 9,
    	options: {
    		minZoom: 9
    	}
    };

    // $scope.markers = [
    // 	{
    // 			id: 1,
	   //  		latitude: 52.516666,
	   //  		longitude: 13.383333,
	   //  		title: 'Marker title'
    // 	}
    // ]

    var reponsePromise = $http.get('/api/places')
      .success(function(data, status, headers, config) {
        console.log(data);
        var newMarkers = _.map(data, function (el) {
          return {
            id: el.s.replace('http://tour-pedia.org/resource/', ''),
            latitude: el.lat,
            longitude: el.lng,
            title: el.label,
          }
        });
        $scope.markers = newMarkers;
        $scope.data = data;
      })
      .error(function(data, status) {
        console.log('places loading failed', data, status);
      });

    $scope.markerClicked = function(marker) {
      var model = marker.model;
      $scope.selected = model;
      $scope.isMarkerSelected = true;
    }

    $scope.closeInfo = function() {
      $scope.selected = {};
      $scope.isMarkerSelected = false;
    }

    $scope.showMore = function() {
      var id = $scope.selected.id;
      console.log('show more for', id);
      $location.path('/details/' + id);
    }

    uiGmapGoogleMapApi.then( function (argument) {
    });
  });
