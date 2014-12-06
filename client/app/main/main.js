'use strict';

angular.module('locationMashupApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });