'use strict';

angular.module('locationMashupApp')
  .directive('ratingStars', function () {
    return {
      template:
      '<span ng-repeat="n in stars" class="glyphicon glyphicon-star"></span>' +
      '<span id="rating" ng-repeat="n in emptyStars" class="glyphicon glyphicon-star-empty"></span>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        function _link() {
          var rating = parseInt(attrs.reviewRating);
          scope.stars = _.range(0, rating);
          scope.emptyStars = _.range(0, 5 - rating);
        }

        attrs.$observe('reviewRating', _link);
        _link();

      }
    };
  });
