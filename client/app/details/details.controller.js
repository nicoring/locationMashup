'use strict';

angular.module('locationMashupApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $http) {

    var id = $routeParams.id;

    $scope.data = {};

    $scope.details = {};
    $scope.imgUrl = '';
    $scope.reviews = [];
    var interestingPlaces = [];
    $scope.selectedInterestingPlace = {}
    $scope.location = '';

    $scope.isImageAvailable = false;

    $scope.mainMarker = {
      coords: {}
    };
    $scope.markers = [];
    $scope.map = {
      // center is the selected attraction
      center: {
        latitude: 52.516666,
        longitude: 13.383333
      },
      zoom: 14,
      options: {
        minZoom: 9
      }
    };

    $scope.markerClicked = function (marker) {
      var model = marker.model;
      console.log(model)
      $scope.selectedInterestingPlace = interestingPlaces[model.id]

    }


    $http.get('/api/placeDetails/' + id)
      .success(function(data) {
        $scope.data = data;
        $scope.details = data; // ability to leave out some entries


        var position = {
          latitude: data.lat,
          longitude: data.lng
        };

        $scope.mainMarker.coords = _.cloneDeep(position);
        // set the center of the map
        $scope.map.center = position;

        getInterestingPlaces(data.lat, data.lng);
      })
      .error(function() {
        console.log('details loading failed');
      });


    $http.get('/api/placeDetails/reviews/' + id)
      .success(function(data) {
        data = _.filter(data, function (review) {
          return review.language === 'en' && review.wordsCount < 50;
        });

        $scope.reviews = data;
      })
      .error(function(error) {
        console.log('reviews loading failed', error);
      });


    $http.get('/api/placeDetails/image/' + id)
      .success(function(data) {
        $scope.imgUrl = data.url;
        $scope.isImageAvailable = true;
      })
      .error(function() {
        console.log('image loading failed');
      });


    function getInterestingPlaces(lat, lng) {
      var url = '/api/placeDetails/places?lat=' + lat + '&lng=' + lng;
      $http.get(url)
        .success(function (data) {
          var croppedData = _.shuffle(data).slice(0,6);
          $scope.markers = _.map(croppedData, function (el, i) {
            return {
              id: i,
              resource: el.s,
              latitude: el.lat,
              longitude: el.long,
              title: el.label,
            };
          })
          interestingPlaces = croppedData;
          getLocationInfo(data);

        })
        .error(function (error) {
          console.log('places loading failed', error);
        });
    }


    function getLocationOfPlaces(places) {
      var placeCounts = {};
      _.forEach(places, function (place) {
        var location = place.location;
        if (placeCounts[location] != null) {
          placeCounts[location] += 1;
        } else {
          placeCounts[location] = 1;
        }
      });

      var mostProbablyLocation = "";
      var bestCount = -1;

      _.forEach(placeCounts, function (count, location) {
        if (count > bestCount) {
          mostProbablyLocation = location;
        }
      });

      return mostProbablyLocation;
    }

    function getLocationInfo(places) {
      var locationURI = getLocationOfPlaces(places);

      var url = '/api/placeDetails/locationInfo?location=' + locationURI;
      $http.get(url)
        .success(function (data) {
          $scope.locationInfo = data;
          console.log('locationInfo', data);
        })
        .error(function (error) {
          console.log('locationInfo loading failed', error);
        })

    }
});
