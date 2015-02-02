'use strict';

angular.module('locationMashupApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.bootstrap',
  'ui.router',
  'uiGmapgoogle-maps',
  'ui.slider',
  'angularSpinner'
])
  .config(['$urlRouterProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', 'usSpinnerConfigProvider', function ($urlRouterProvider, $locationProvider, GoogleMapApiProviders, usSpinnerConfigProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);

    GoogleMapApiProviders.configure({
        // key: 'AIzaSyDkd1CXkqBrHLXzmpdHMnDk2sU9RUEsJ-g',
        libraries: 'geometry, visualization'
    });

    /** globally configure all loading spinners the same **/
    // http://fgnass.github.io/spin.js/#?lines=17&length=1&width=3&radius=17&corners=1.0&rotate=22&trail=58&speed=0.6&direction=1
    usSpinnerConfigProvider.setDefaults({
      lines: 17, // The number of lines to draw
      length: 1, // The length of each line
      width: 3, // The line thickness
      radius: 17, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 22, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 0.6, // Rounds per second
      trail: 58, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    });

  }]);
