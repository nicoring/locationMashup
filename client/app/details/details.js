'use strict';

angular.module('locationMashupApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/details/:id', {
        templateUrl: 'app/details/details.html',
        controller: 'DetailsCtrl'
      });
  });
