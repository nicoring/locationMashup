'use strict';

angular.module('locationMashupApp')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('map', {
        url: '/',
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  }]);
