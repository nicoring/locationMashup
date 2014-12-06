'use strict';

angular.module('locationMashupApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });
