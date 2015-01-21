'use strict';

angular.module('locationMashupApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  //'ngRoute',
  'ui.bootstrap',
  'ui.router',
  'uiGmapgoogle-maps'
])
  .config(['$urlRouterProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', function ($urlRouterProvider, $locationProvider, GoogleMapApiProviders) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    GoogleMapApiProviders.configure({
        // key: 'AIzaSyDkd1CXkqBrHLXzmpdHMnDk2sU9RUEsJ-g',
        libraries: 'geometry, visualization'
    });
  }]);
