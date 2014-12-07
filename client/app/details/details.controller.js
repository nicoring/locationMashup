'use strict';

angular.module('locationMashupApp')
  .controller('DetailsCtrl', function ($scope, $routeParams, $http) {

    var id = $routeParams.id;

    $scope.details = {};
    $scope.imgUrl = '';
    $scope.reviews = [];

    $scope.isImageAvailable = false;

    $http.get('/api/placeDetails/' + id)
      .success(function(data) {
        $scope.details = data;
      })
      .error(function() {
        console.log('details loading failed');
      });

    $http.get('/api/placeDetails/reviews/' + id)
      .success(function(data) {
        data = _.filter(data, function (review) {
          return review.language == 'en' && review.wordsCount < 30;
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

  });
