'use strict';

angular.module('locationMashupApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('map', {
        url: '/',
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });
