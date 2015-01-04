'use strict';

angular.module('locationMashupApp')
  .controller('MapCtrl', function ($scope, $http, $location) {

    // whole place data
    $scope.data = [];

    /** map options **/

    $scope.map = {
    	// center of berlin
    	center: {
    		latitude: 52.516666,
    		longitude: 13.383333
    	},
    	zoom: 12,
    	options: {
    		minZoom: 9
    	}
    };


    /** marker options **/

    // all markers
    $scope.markers = [];
     //  [{ id: 1,
     //     latitude: 52.516666,
     //     longitude: 13.383333,
     //     title: 'Marker title' }]

    $scope.clusterOptions = {
      averageCenter: true,
      batchSize: 5000,
      maxZoom: 15
    }

    // from user selected marker
    $scope.isMarkerSelected = false;
    $scope.selectedMarker = {};

    $scope.markerClicked = function(marker) {
      var model = marker.model;
      $scope.selectedMarker = model;
      $scope.isMarkerSelected = true;
    };

    $scope.closeInfo = function() {
      $scope.selectedMarker = {};
      $scope.isMarkerSelected = false;
    };

    $scope.showMore = function() {
      var id = $scope.selectedMarker.id;
      console.log('show more for', id);
      $location.path('/details/' + id);
    };

    // draggable position marker
    $scope.positionMarker = {
      coords: {
        latitude: 52.516666,
        longitude: 13.383333
      },
      options: {
        draggable: true,
        clickable: false,
        crossOnDrag: true,
        curser: 'pointer',
        title: 'position'
      },
      events: {
        dragend: function (marker, eventName, args) {
          var lat = marker.getPosition().lat();
          var lng = marker.getPosition().lng();
          showMarkersForPosition(lat, lng);
        }
      }
    }

    $scope.getUserLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(geoposition) {
          $scope.positionMarker.coords.latitude = geoposition.coords.latitude;
          $scope.positionMarker.coords.longitude = geoposition.coords.longitude;
          showMarkersForPosition(geoposition.coords.latitude, geoposition.coords.longitude);
        });
      } else {
        // Todo: toast
        console.log("Geolocation is not supported by this browser.");
      }
    }

    // time inputslider
    // $scope.timeInput = {

    // }

    // var time = $scope.timeInput.time;
    var berlinZoo = {lat: 52.5074, lng: 13.3326};

    var httpTimeout = null;
    function showMarkersForPosition(lat, lng) {
      console.log(lat, lng);
      var url = 'api/places/tourpedia?lat='+lat+'&lng='+lng+'&time='+ 10*60 +'&noToken=1';
      // var url = '/api/places/fake'

      if (httpTimeout !== null) {
        httpTimeout.resolve();
      }
      httpTimeout = new $.Deferred();

      $http.get(url, { cache: 'true', timeout: httpTimeout.promise()})
        .success(function(data) {
          console.log(data.length);
          var newMarkers = _.map(data, function (el) {
            return {
              id: el.s.replace('http://tour-pedia.org/resource/', ''),
              latitude: el.lat,
              longitude: el.lng,
              title: el.label,
            };
          });

          $scope.markers = newMarkers;
          $scope.data = data;
        })
        .error(function(data, status) {
          console.log('places loading failed', data, status);
        });
    }

    // uiGmapGoogleMapApi.then( function (argument) {
    // });
  });
