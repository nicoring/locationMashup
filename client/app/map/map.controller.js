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
    };

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

    var position = {
      lat: 52.516666,
      lng: 13.383333
    };

    // draggable position marker
    $scope.positionMarker = {
      coords: {
        latitude: position.lat,
        longitude: position.lng
      },
      options: {
        draggable: true,
        clickable: false,
        crossOnDrag: true,
        curser: 'pointer',
        title: 'position'
      },
      events: {
        dragend: function (marker) {
          position.lat = marker.getPosition().lat();
          position.lng = marker.getPosition().lng();
          showMarkersForPosition();
        }
      }
    };

    $scope.getUserLocation = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(geoposition) {
          position.lat = $scope.positionMarker.coords.latitude = geoposition.coords.latitude;
          position.lng = $scope.positionMarker.coords.longitude = geoposition.coords.longitude;

          showMarkersForPosition();
        });
      } else {
        // Todo: toast
        console.log('Geolocation is not supported by this browser.');
      }
    };

    /** time input slider **/

    // time inputslider
    $scope.timeInput = 10;
    var timeToTravel = $scope.timeInput * 60;

    $scope.$watch('timeInput', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        timeToTravel = newVal * 60;
        console.log('timeInput', newVal);
        showMarkersForPosition();
      }
    });

    /** category select **/

    $scope.categories = [
        { value: 'all',   name: 'Show all'},
        { value: 'eat',   name: 'Restaurant' },
        { value: 'acco',  name: 'Accommodation' },
        { value: 'buy',   name: 'ProductOrService' },
        { value: 'do',    name: 'PointsOfInterest' },
        { value: 'see',   name: 'Sightseeing' }
    ];

    $scope.selectedCategory = $scope.categories[0];
    var category = $scope.selectedCategory.value;

    $scope.$watch('selectedCategory', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log('selectedCategory', newVal.value);
        category = newVal.value;
        showMarkersForPosition();
      }
    });

    // var berlinZoo = {lat: 52.5074, lng: 13.3326};

    // holds deferred object, which will be set on a reqest
    // and will be resolved and reset after another request from the same client
    var httpTimeout = null;

    function showMarkersForPosition() {

      var url = 'api/places/' + '?lat=' + position.lat +
                '&lng=' + position.lng +
                '&time='+ timeToTravel +
                '&noToken=1';

      console.log('category', category);

      if (category !== 'all') {
        url += '&category=' + category;
        console.log('category', category);
      }
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
              type: el.type
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
