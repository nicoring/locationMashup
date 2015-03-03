'use strict';

angular.module('locationMashupApp')
  .factory('photo', ['$http', function ($http) {

    var googlePlusRegExp = new RegExp(/https:\/\/plus\.google\.com\/(\d)+\/(\w|\?|=|-)+/);
    var googlePlusReplaceRegExp = new RegExp(/https:\/\/plus\.google\.com\//);
    var googlePlusIdRegExp = new RegExp(/(\d)+(?=\/(\w|\?|=|-)+)/);

    var googleApiKey = 'AIzaSyBdMmiyzeMJYYQlPd5Kk9MyHf-FSqRYagQ';
    var googleApiUrl = 'https://www.googleapis.com/plus/v1/people/';

    var googlePlaceUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    var googlePlacePhotoUrl = 'https://maps.googleapis.com/maps/api/place/photo';

    var foursquareRegExp = new RegExp(/https:\/\/foursquare\.com\/v\/(\w-?)+\/\w+/);
    var foursquareReplaceRegExp = new RegExp(/https:\/\/foursquare\.com\/v\/(\w-?)+\//);

    var foursquareClientId = 'LKCJGECRLDEFVLJQXHQPUPR1ZUQJNBDVAUAPDV14AET01VAM';
    var foursquareClientSecret = 'TIOYKOHWV12SOQNUCNGWHWXC2PQWH1DHSPKIMCFHB52EJAMM';
    var foursquareBaseUrl = 'https://api.foursquare.com/v2/venues/';

    /* HELPERS */

    function foursquareQueryParams() {
      return '?client_id=' + foursquareClientId + '&client_secret=' + foursquareClientSecret + '&v=20140101';
    }

    function getGooglePlusApiUrl(placeId) {
      return googleApiUrl + placeId + '?key=' + googleApiKey;
    }

    /* GOOGLE PLUS METHODS */

    function isGooglePlus(url) {
      return googlePlusRegExp.test(url);
    }

    function getGoolgePlusID(url) {
      var cuttedUrl = url.replace(googlePlusReplaceRegExp, '');
      return cuttedUrl.match(googlePlusIdRegExp)[0];
    }

    function getPhotosFromGooglePlus(url) {
      var id = getGoolgePlusID(url);
      var dfd = new $.Deferred();

      var placeUrl = getGooglePlusApiUrl(id);

      $http.get(placeUrl, {cache: 'true'})
        .success(function(data) {
          if (data.cover && data.cover.coverPhoto.url) {
            dfd.resolve(data.cover.coverPhoto.url);
          } else if (!data.image.isDefault) {
            dfd.resolve(data.image.url);
          } else {
            dfd.reject();
          }

        })
        .error(function() {
          dfd.reject();
        });

      return dfd;
    }


    /* FOURSQUARE METHODS */

    function isFoursquare(url) {
      return foursquareRegExp.test(url);
    }

    function getFoursquareID(url) {
      return url.replace(foursquareReplaceRegExp, '');
    }

    function getPhotosFromFoursquare(url) {
      var id = getFoursquareID(url);
      var dfd = new $.Deferred();

      var url = foursquareBaseUrl + id + '/photos' + foursquareQueryParams();

      $http.get(url, {cache: 'true'})
        .success(function(data) {
          if (data.response.photos.count > 0) {
            var photo = data.response.photos.items[0];
            var photoUrl = photo.prefix + '380x200' + photo.suffix;
            dfd.resolve(photoUrl);
          } else {
            dfd.reject();
          }
        })
        .error(function() {
          dfd.reject();
        });

      return dfd;
    }

    // Public API
    return {
      getPhotoForUrl: function (url) {
        var photoDfd;

        if (isFoursquare(url)) {
          photoDfd = getPhotosFromFoursquare(url);
        } else if (isGooglePlus(url)) {
          photoDfd = getPhotosFromGooglePlus(url);
        } else {
          return (new $.Deferred()).reject();
        }

        return photoDfd;
      }
    };
  }]);
