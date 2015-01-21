'use strict';

angular.module('locationMashupApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $http, $location, $state, uiGmapIsReady, uiGmapGoogleMapApi) {

    var id = $routeParams.id;

    $scope.data = {};

    $scope.details = {};
    $scope.imgUrl = '';
    $scope.reviews = [];
    $scope.selectedInterestingPlace = {};
    $scope.locationInfo = {};

    var interestingPlaces = [];

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

    var mapLoaded = new $.Deferred();
    var sdkLoaded = new $.Deferred();
    var placesLoaded = new $.Deferred();
    var mapControl, mapApi;

    $.when(mapLoaded, sdkLoaded, boundsLoaded).done(function () {
      var south, north, west, east;
      south = north = $scope.map.center.latitude;
      west = east = $scope.map.center.longitude;

      console.log(interestingPlaces);

      _.forEach(interestingPlaces, function (place) {
        if (place.lat > north)
          north = place.lat;
        else if (place.lat < south)
          south = place.lat;

        if (place.long > east)
          east = place.long;
        else if (place.long < west)
          west = place.long;
      });


      // var southwest = new mapApi.LatLng(bounds.south, bounds.west);
      // var northeast = new mapApi.LatLng(bounds.north, bounds.east);

      var southwest = new mapApi.LatLng(south, west);
      var northeast = new mapApi.LatLng(north, east);

      var box = new mapApi.LatLngBounds(southwest, northeast);
      console.log(box);
      mapControl.fitBounds(box);
    });

    uiGmapIsReady.promise(1).then(function (instances) {
      mapControl = instances[0].map;
      console.log(mapControl);
      mapLoaded.resolve();
    });

    uiGmapGoogleMapApi.then(function (mapapi) {
      mapApi = mapapi;
      sdkLoaded.resolve();
    });


    // markers on the map
    $scope.mainMarker = {
      coords: {},
      label: ''
    };
    $scope.markers = [];

    $scope.markerClicked = function (marker) {
      var model = marker.model;
      $scope.selectedInterestingPlace = interestingPlaces[model.id];
    };

    $scope.showRouteToBtn = function() {
      if (navigator.geolocation) {
        return true;
      } else {
        return false;
      }
    };

    var userLocation;
    navigator.geolocation.getCurrentPosition(function(geoposition) {
      userLocation = {
        lat: geoposition.coords.latitude,
        lng: geoposition.coords.longitude
      };
    });

    $scope.navigateToPlace = function() {
      var place = userLocation;
      // var url = 'https://www.google.com/maps/dir/' + place.lat + ',' + place.lng + '/' + placePosition.latitude + ',' + placePosition.longitude + '/';
      // url = $state.href(url);
      // window.open(url,'_blank');
    };

    var placePosition;
    $http.get('/api/placeDetails/' + id)
      .success(function(data) {
        $scope.data = data;
        $scope.details = data; // ability to leave out some entries

        placePosition = {
          latitude: data.lat,
          longitude: data.lng
        };

        $scope.mainMarker.coords = _.cloneDeep(placePosition);
        // set the center of the map
        $scope.map.center = placePosition;

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

    var typeMapping = {
      'http://dbpedia.org/ontology/Restaurant': 'Restaurant',
      'http://protege.cim3.net/file/pub/ontologies/travel/travel.owl#Sightseeing': 'Sightseeing',
      'http://wafi.iit.cnr.it/angelica/Hontology.owl#PointsOfInterest': 'PointsOfInterest',
      'http://purl.org/acco/ns#Accommodation': 'Accommodation',
      'http://wafi.iit.cnr.it/angelica/Hontology.owl#Accommodation': 'Accommodation',
      'http://purl.org/goodrelations/v1#ProductOrService': 'ProductOrService'
    }

    var mapping = {
      'Restaurant': ['DrinkActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
      'Sightseeing': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
      'PointsOfInterest': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
      'Accommodation': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'SleepActivity', 'Activity'],
      'ProductOrService': ['DrinkActivity', 'EatActivity', 'Activity']
    };

    function getInterestingPlaces(lat, lng, type) {

      // get type of selected place and get matching wikivoyage Activities based on the mapping above
      type = typeMapping[type];
      var categories = mapping[type];

      var url = '/api/placeDetails/places?lat=' + lat + '&lng=' + lng;
      $http.get(url)
        .success(function (res) {

          var data = res.result;

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
          placesLoaded.resolve();
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
        locationURI = 'http:localhost/wikivoyage/Berlin';
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
        });
    }


    function getLocationOfPlaces(places) {

      var placeCounts = {};
      _.forEach(places, function (place) {
        var location = place.location;
        if (placeCounts[location] !== null) {
          placeCounts[location] += 1;
        } else {
          placeCounts[location] = 1;
        }
      });

      var mostProbablyLocation = '';
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
