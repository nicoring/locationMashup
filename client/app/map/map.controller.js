'use strict';

function getIdOfResource(resource) {
  return resource.replace('http://tour-pedia.org/resource/', '');
}

angular.module('locationMashupApp')
  .controller('MapCtrl', function ($scope, $http, $location, uiGmapGoogleMapApi, Details, photo) {

    /** default start position **/
    var position = {
      latitude: 52.516666,
      longitude: 13.383333
    };

    /** map options **/

    $scope.map = {
      center: position,
      zoom: 12,
      options: {
        minZoom: 9,
        mapTypeControl: false,
        panControl: false,
        streetViewControlOptions: {},
        zoomControlOptions: {},
        styles: [
          {
            'featureType': 'poi',
            'elementType': 'labels',
            'stylers': [
              { 'visibility': 'off' }
            ]
          },
          {
            'featureType': 'administrative.province',
            'stylers': [
              { 'weight': 3.7 }
            ]
          }
        ]
      }
    };

    /** place map controls **/
    uiGmapGoogleMapApi.then(function (mapApi) {
      $scope.map.options.streetViewControlOptions.position = mapApi.ControlPosition.LEFT_CENTER;
      $scope.map.options.zoomControlOptions.position = mapApi.ControlPosition.LEFT_CENTER;
    });

    /** marker options **/

    // all markers
    $scope.markers = [];

    $scope.clusterOptions = {
      averageCenter: true,
      batchSize: 5000,
      maxZoom: 15
    };

    // from user selected marker
    $scope.isMarkerSelected = false;
    $scope.selectedPlace = {};

    // img from foursquare or google places
    $scope.imgUrl = '';
    $scope.hasImage = false;

    $scope.markerClicked = function(marker) {
      var id = marker.model.id;
      var placeDfd = Details.getPlaceDetails(id);
      $scope.hasImage = false;
      $scope.imgUrl = '';

      placeDfd.then( function(placeDetails) {
        placeDetails.id = id;
        $scope.selectedPlace = placeDetails;
        $scope.isMarkerSelected = true;

        photo.getPhotoForUrl(placeDetails.wikiLink).done( function(photoUrl) {
          $scope.imgUrl = photoUrl;
          $scope.hasImage = true;
        });
      });
    };

    $scope.closeInfo = function() {
      $scope.selectedPlace = {};
      $scope.isMarkerSelected = false;
      $scope.hasImage = false;
      $scope.imgUrl = '';
    };

    $scope.showMore = function() {
      $location.path('/details/' + $scope.selectedPlace.id);
    };

    // draggable position marker
    $scope.positionMarker = {
      coords: {
        latitude: position.latitude,
        longitude: position.longitude
      },
      options: {
        draggable: true,
        clickable: false,
        crossOnDrag: true,
        curser: 'pointer',
        zIndex: 99999
      },
      events: {
        dragend: function (marker) {
          position.latitude = marker.getPosition().lat();
          position.longitude = marker.getPosition().lng();
          showMarkersForPosition();
        }
      }
    };

    /** time input slider **/

    // time inputslider
    // $scope.timeInput = 10;

    // $scope.$watch('timeInput', function (newVal, oldVal) {
    //   if (newVal !== oldVal) {
    //     timeToTravel = newVal * 60;
    //     console.log('timeInput', newVal);
    //     showMarkersForPosition();
    //   }
    // });

    $scope.slider = {
      options: {
        stop: showMarkersForPosition
      },
      value: 10
    };

    var timeToTravel = function () {
      return $scope.slider.value * 60;
    };

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

    $scope.$watch('selectedCategory', function (newCategory, oldCategory) {
      if (newCategory !== oldCategory) {
        category = newCategory.value;
        showMarkersForPosition();
      }
    });

    var typeMapping = {
      'http://dbpedia.org/ontology/Restaurant': 'Restaurant',
      'http://protege.cim3.net/file/pub/ontologies/travel/travel.owl#Sightseeing': 'Sightseeing',
      'http://wafi.iit.cnr.it/angelica/Hontology.owl#PointsOfInterest': 'PointsOfInterest',
      'http://purl.org/acco/ns#Accommodation': 'Accommodation',
      'http://wafi.iit.cnr.it/angelica/Hontology.owl#Accommodation': 'Accommodation',
      'http://purl.org/goodrelations/v1#ProductOrService': 'ProductOrService'
    };

    // holds deferred object, which will be set on a reqest
    // and will be resolved and reset after another request from the same client
    var httpTimeout = null;

    function showMarkersForPosition() {

      var url = 'api/places/' + '?lat=' + position.latitude +
                '&lng=' + position.longitude +
                '&time='+ timeToTravel() +
                '&noToken=1';

      // console.log('category', category);
      console.log(timeToTravel());

      if (category !== 'all') {
        url += '&category=' + category;
      }
      // var url = '/api/places/fake'

      if (httpTimeout !== null) {
        httpTimeout.resolve();
      }
      httpTimeout = new $.Deferred();

      $http.get(url, { cache: 'true', timeout: httpTimeout.promise()})
        .success(function(places) {

          $scope.markers = _.map(places, function (el) {
            var type = typeMapping[el.type];
            var url = '/assets/images/' + type + '.png';

            return {
              id: getIdOfResource(el.s),
              latitude: el.lat,
              longitude: el.lng,
              title: el.label,
              iconUrl: url
            };
          });

        })
        .error(function(places, status) {
          console.error('places loading failed', status);
        });
    }

    showMarkersForPosition();
  });
