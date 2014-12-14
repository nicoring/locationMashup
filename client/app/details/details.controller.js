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
    $scope.locationInfo = {};


    $scope.areReviewsAvailable = function () {
      return $scope.reviews.length > 0;
    }

    $scope.isImageAvailable = function() {
      return $scope.imgUrl !== '';
    }

    $scope.isLocationInfoAvailable = function() {
      return _.keys($scope.locationInfo).length > 0;
    }


    // google map options
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

    // markers on the map
    $scope.mainMarker = {
      coords: {},
      label: ''
    };
    $scope.markers = [];

    $scope.markerClicked = function (marker) {
      var model = marker.model;
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

        // after loading the place details, get interesting places around
        getInterestingPlaces(data.lat, data.lng, data.type);
      })
      .error(function() {
        console.log('details loading failed');
      });


    $http.get('/api/placeDetails/reviews/' + id)
      .success(function(data) {
        data = _.filter(data, function (review) {
          return (review.language === 'en' || review.language === 'de') && review.wordsCount < 50;
        });

        $scope.reviews = data;
      })
      .error(function(error) {
        console.log('reviews loading failed', error);
      });


    $http.get('/api/placeDetails/image/' + id)
      .success(function(data) {
        $scope.imgUrl = data.url;
      })
      .error(function(error) {
        console.log('image loading failed', error);
      });


      var mapping = {
        'Restaurant': ['DrinkActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
        'Sightseeing': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
        'PointsOfInterest': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
        'Accomodation': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'SleepActivity', 'Activity'],
        'ProductOrService': ['DrinkActivity', 'EatActivity', 'Activity']
      };

    function getInterestingPlaces(lat, lng, type) {

      // get type of selected place and get matching wikivoyage Activities based on the mapping above
      type = type.split("#")[1];
      var categories = mapping[type];

      var url = '/api/placeDetails/places?lat=' + lat + '&lng=' + lng;
      $http.get(url)
        .success(function (data) {

          var croppedData = _.filter(data, function (el) {
            var elementType = el.type.split('#')[1];
            return _.find(categories, function (category) {
              return elementType === category;
            });
          });
          croppedData = _.shuffle(croppedData).slice(0,6);

          $scope.markers = _.map(croppedData, function (el, i) {
            return {
              id: i,
              resource: el.s,
              latitude: el.lat,
              longitude: el.long,
              title: el.label,
            };
          });

          interestingPlaces = croppedData;
          getLocationInfo(data);
        })
        .error(function (error) {
          console.log('places loading failed', error);
        });
    }


    function getLocationInfo(places) {
      var locationURI = '';
      if (places.length > 0) {
        locationURI = getLocationOfPlaces(places);
      } else {
        locationURI = 'http:localhost/wikivoyage/Berlin'
      }

      var url = '/api/placeDetails/locationInfo?location=' + encodeURI(locationURI);
      $http.get(url)
        .success(function (data) {
          if (data.length > 0) {
            $scope.locationInfo = data[0];
          }
        })
        .error(function (error) {
          console.log('locationInfo loading failed', error);
        })
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
          bestCount = count;
          mostProbablyLocation = location;
        }
      });

      return mostProbablyLocation;
    }
});
