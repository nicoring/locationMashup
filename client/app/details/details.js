'use strict';

angular.module('locationMashupApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('map.details', {
        url: '^/details/:id',
        templateUrl: 'app/details/details.html',
        controller: 'DetailsCtrl'
      });
  });
