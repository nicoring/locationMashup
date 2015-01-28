'use strict';

angular.module('locationMashupApp')
  .controller('DetailsCtrl', function ($scope, $stateParams, $http, $state, $location, Details) {

    var id = $stateParams.id,
        interestingPlaces = [];

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
        minZoom: 9,
        styles: $scope.map.options.styles
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
        $scope.userLocation = {
          lat: geoposition.coords.latitude,
          lng: geoposition.coords.longitude
        };
        $scope.$digest();
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

    // $scope.supportsGeoLoctation = function() {
    //   if (navigator.geolocation) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // };

    // $scope.gotGeoLocation = function() {
    //   console.log(userLocation);
    //   return userLocation !== undefined;
    // };

    $scope.hasLabel = false;

    $scope.isInDetails = function(key) {
      return key in $scope.details;
    };

    $scope.navigateToPlace = function() {
      var place = $scope.userLocation;
      var url = 'https://www.google.com/maps/dir/' + place.lat + ',' + place.lng + '/' + $scope.mainMarker.coords.latitude + ',' + $scope.mainMarker.coords.longitude + '/data=!3m1!4b1!4m2!4m1!3e3';
      window.open(url, '_blank');
    };

    /** dispatch all ajax requests **/

    Details.collectDetails(id).then(function(place) {

      // TODO: refactor html template to use $scope.details directly
      $scope.details = place;
      $scope.hasLabel = $scope.details.hasLabel;
      $scope.detailsMap.cetner = $scope.details.position;
      $scope.locationInfo = $scope.details.districtInfo; // when refactoring rename locationInfo to districtInfo!!

      // marker position in wikivoyage map should not update
      // thus make a deep copy
      $scope.mainMarker.coords = _.cloneDeep($scope.details.position);

      // prepare marker models
      $scope.detailsMarkers = _.map($scope.details.interestingPlaces, function (el, i) {
        return {
          id: i,
          resource: el.s,
          latitude: el.lat,
          longitude: el.long,
          title: el.label,
        };
      });

    });

    Details.getReviews(id).then(function(reviews) {
      $scope.reviews = reviews;
    });

    Details.getImageUrl(id).then(function(url) {
      $scope.imgUrl = url;
    });

  });
