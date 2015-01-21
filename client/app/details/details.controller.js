'use strict';

var typeMapping = {
  'http://dbpedia.org/ontology/Restaurant': 'Restaurant',
  'http://protege.cim3.net/file/pub/ontologies/travel/travel.owl#Sightseeing': 'Sightseeing',
  'http://wafi.iit.cnr.it/angelica/Hontology.owl#PointsOfInterest': 'PointsOfInterest',
  'http://purl.org/acco/ns#Accommodation': 'Accommodation',
  'http://wafi.iit.cnr.it/angelica/Hontology.owl#Accommodation': 'Accommodation',
  'http://purl.org/goodrelations/v1#ProductOrService': 'ProductOrService'
};

var tourpediaToWikivoyageMapping = {
  'Restaurant': ['DrinkActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'Sightseeing': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'PointsOfInterest': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'Accommodation': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'SleepActivity', 'Activity'],
  'ProductOrService': ['DrinkActivity', 'EatActivity', 'Activity']
};

function getHashTag(string) {
  return string.split('#')[1];
}

function selectRandomPlacesByType(places, type) {

  // get type of selected place and get matching wikivoyage Activities based on the mapping above
  var categories = tourpediaToWikivoyageMapping[ typeMapping[type] ],
      elementType;

  return _(places)
    .filter(function (el) {
      elementType = getHashTag(el.type);
      return _.find(categories, function (category) {
        return elementType === category;
      });
    })
    .shuffle()
    .slice(0, 6)
    .value();
}

function getDistrictOfPlaces(places) {

  var placeCounts = {},
      mostProbablyDistrict = '',
      bestCount = -1,
      location;

  _.forEach(places, function (place) {
    location = place.location;
    if (placeCounts[location] !== null) {
      placeCounts[location] += 1;
    } else {
      placeCounts[location] = 1;
    }
  });

  _.forEach(placeCounts, function (count, location) {
    if (count > bestCount) {
      bestCount = count;
      mostProbablyDistrict = location;
    }
  });

  return mostProbablyDistrict;

}

angular.module('locationMashupApp')
  .controller('DetailsCtrl', function ($scope, $stateParams, $http, $state, $location) {

    var id = $stateParams.id,
        interestingPlaces = [],
        userLocation;


    // lodash range in scope
    $scope.range = _.range;

    /** expose to template **/

    $scope.details = {};
    $scope.imgUrl = '';
    $scope.reviews = [];
    $scope.selectedInterestingPlace = {};
    $scope.locationInfo = {};


    $scope.hasReviews = function () {
      return $scope.reviews.length > 0;
    };

    $scope.hasLocationInfo = function() {
      return _.keys($scope.locationInfo).length > 0;
    };

    /** map options **/

    $scope.detailsMap = {
      center: $scope.map.center,
      zoom: 14,
      options: {
        minZoom: 9
      }
    };

    /** marker options **/

    $scope.mainMarker = {
      coords: {},
      label: ''
    };

    $scope.detailsMarkers = [];

    /** request geo location **/

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(geoposition) {
        userLocation = {
          lat: geoposition.coords.latitude,
          lng: geoposition.coords.longitude
        };
      });
    }

    $scope.areReviewsAvailable = function () {
      return $scope.reviews.length > 0;
    };

    $scope.isImageAvailable = function() {
      return $scope.imgUrl !== '';
    };

    $scope.isLocationInfoAvailable = function() {
      return _.keys($scope.locationInfo).length > 0;
    };

    $scope.goBack = function() {
      $location.path('/');
    };

    $scope.markerClicked = function (marker) {
      var model = marker.model;
      $scope.selectedInterestingPlace = interestingPlaces[model.id];
    };

    $scope.supportsGeoLoctation = function() {
      if (navigator.geolocation) {
        return true;
      } else {
        return false;
      }
    };

    $scope.hasLabel = false;

    $scope.isInDetails = function(key) {
      return key in $scope.details;
    };

    $scope.navigateToPlace = function() {
      var place = userLocation;
      var url = 'https://www.google.com/maps/dir/' + place.lat + ',' + place.lng + '/' + $scope.mainMarker.coords.latitude + ',' + $scope.mainMarker.coords.longitude + '/';
      window.open(url, '_blank');
    };

    /** dispatch all ajax requests **/

    getDetails(id);
    getReviews(id);
    getImageUrl(id);


    function getDetails(placeId) {

      $http.get('/api/placeDetails/' + placeId)
        .success(function(place) {

          // just store one label
          if ('label' in place) {
            $scope.hasLabel = true;
          } else if ('rdfsLabel' in place) {
            place.label = place.rdfsLabel;
            $scope.hasLabel = true;
          } else if ('fn' in place) {
            place.label = place.fn;
            $scope.hasLabel = true;
          }

          $scope.details = place;

          var position = {
            latitude: place.lat,
            longitude: place.lng
          };

          // marker position in wikivoyage map should not update
          // thus make a deep copy
          $scope.mainMarker.coords = _.cloneDeep(position);

          // set the center of the map
          $scope.detailsMap.center = position;

          // after loading the place details, get interesting places around
          getInterestingPlaces(place.lat, place.lng, place.type);
        })
        .error(function() {
          console.error('details loading failed');
        });

    }

    function getReviews(placeId) {

      $http.get('/api/placeDetails/reviews/' + placeId)
        .success(function(reviews) {
          reviews = _.filter(reviews, function (review) {
            return (review.language === 'en' || review.language === 'de') && review.wordsCount < 50;
          });

          $scope.reviews = reviews;
        })
        .error(function(error) {
          console.error('reviews loading failed', error);
        });

    }

    function getImageUrl(placeId) {

      $http.get('/api/placeDetails/image/' + placeId)
        .success(function(data) {
          $scope.imgUrl = data.url;
        })
        .error(function(error) {
          console.error('image loading failed', error);
        });

    }

    function getInterestingPlaces(lat, lng, type) {

      var url = '/api/placeDetails/places?lat=' + lat + '&lng=' + lng;
      $http.get(url)
        .success(function (wikivoyagePlaces) {

          interestingPlaces = selectRandomPlacesByType(wikivoyagePlaces.result, type);
          $scope.detailsMarkers = _.map(interestingPlaces, function (el, i) {
            return {
              id: i,
              resource: el.s,
              latitude: el.lat,
              longitude: el.long,
              title: el.label,
            };
          });

          getLocationInfo(wikivoyagePlaces.result);
        })
        .error(function (error) {
          console.log('places loading failed', error);
        });
    }

    function getLocationInfo(places) {

      var locationURI = '',
          url;

      if (places.length > 0) {
        locationURI = getDistrictOfPlaces(places);
      } else {
        locationURI = 'http:localhost/wikivoyage/Berlin';
      }

      url = '/api/placeDetails/locationInfo?location=' + encodeURI(locationURI);
      $http.get(url)
        .success(function (data) {
          if (data.length > 0) {
            $scope.locationInfo = data[0];
          }
        })
        .error(function (error) {
          console.log('locationInfo loading failed', error);
        });

    }

  });
