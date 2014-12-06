'use strict';

angular.module('locationMashupApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/details/:resource', {
        templateUrl: 'app/details/details.html',
        controller: 'DetailsCtrl'
      });
  });
