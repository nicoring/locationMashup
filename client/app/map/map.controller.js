'use strict';

angular.module('locationMashupApp')
  .controller('MapCtrl', function ($scope, $http, uiGmapGoogleMapApi) {

  	$scope.message = "Hallo Welt!";
    
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

    $scope.markers = [
    	{
    			id: 1,
	    		latitude: 52.516666,
	    		longitude: 13.383333,
	    		title: 'Marker title'
    	}
    ]

    uiGmapGoogleMapApi.then( function (argument) {
    	// body...
    });
  });
