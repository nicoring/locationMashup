'use strict';

angular.module('locationMashupApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'uiGmapgoogle-maps'
])
  .config(['$routeProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', function ($routeProvider, $locationProvider, GoogleMapApiProviders) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);

    GoogleMapApiProviders.configure({
        // key: 'AIzaSyDkd1CXkqBrHLXzmpdHMnDk2sU9RUEsJ-g',
        libraries: 'geometry, visualization'
    });
  }]);
