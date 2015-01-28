'use strict';

var typeMapping = {
  'http://dbpedia.org/ontology/Restaurant': 'Restaurant',
  'http://protege.cim3.net/file/pub/ontologies/travel/travel.owl#Sightseeing': 'Sightseeing',
  'http://wafi.iit.cnr.it/angelica/Hontology.owl#PointsOfInterest': 'PointsOfInterest',
  'http://purl.org/acco/ns#Accommodation': 'Accommodation',
  'http://wafi.iit.cnr.it/angelica/Hontology.owl#Accommodation': 'Accommodation',
  'http://purl.org/goodrelations/v1#ProductOrService': 'ProductOrService'
};

var tourpediaToWikivoyageMapping = {
  'Restaurant': ['DrinkActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'Sightseeing': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'PointsOfInterest': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'Activity'],
  'Accommodation': ['DrinkActivity', 'EatActivity', 'DoActivity', 'SeeActivity', 'BuyActivity', 'SleepActivity', 'Activity'],
  'ProductOrService': ['DrinkActivity', 'EatActivity', 'Activity']
};

function getHashTag(string) {
  return string.split('#')[1];
}

function selectRandomPlacesByType(places, type) {

  // get type of selected place and get matching wikivoyage Activities based on the mapping above
  var categories = tourpediaToWikivoyageMapping[ typeMapping[type] ],
      elementType;

  return _(places)
    .filter(function (el) {
      elementType = getHashTag(el.type);
      return _.find(categories, function (category) {
        return elementType === category;
      });
    })
    .shuffle()
    .slice(0, 6)
    .value();
}

function getDistrictOfPlaces(places) {

  var placeCounts = {},
      mostProbablyDistrict = '',
      bestCount = -1,
      location;

  _.forEach(places, function (place) {
    location = place.location;
    if (placeCounts[location] !== null) {
      placeCounts[location] += 1;
    } else {
      placeCounts[location] = 1;
    }
  });

  _.forEach(placeCounts, function (count, location) {
    if (count > bestCount) {
      bestCount = count;
      mostProbablyDistrict = location;
    }
  });

  return mostProbablyDistrict;

}

function DetailsService($http) {
  this.$http = $http;
}

DetailsService.prototype.collectDetails = function(placeId) {

  var self = this;
  return this.getPlaceDetails(placeId).then(function(place) {

    return self.getInterestingPlaces(place).then(function(interesting) {
      place.interestingPlaces = interesting.interestingPlaces;
      return self.getDistrictInfo(interesting.allWikivoyagePlaces).then(function(info) {
        place.districtInfo = info;
        return place;
      });
    });

  });

};

DetailsService.prototype.getPlaceDetails = function(placeId) {

  return this.$http.get('/api/placeDetails/' + placeId).then(
    // success callback
    function(response) {

      var place = response.data;

      // just store one label
      if ('label' in place) {
        place.hasLabel = true;
      } else if ('rdfsLabel' in place) {
        place.label = place.rdfsLabel;
        place.hasLabel = true;
      } else if ('fn' in place) {
        place.label = place.fn;
        place.hasLabel = true;
      } else {
        place.hasLabel = false;
      }

      // format place position to match GoogleMaps API
      place.position = {
        latitude: place.lat,
        longitude: place.lng
      };

      return place;

    },

    // error callback
    function() {
      console.error('details loading failed');
    }
  );

};

DetailsService.prototype.getInterestingPlaces = function(place) {

  var url = '/api/placeDetails/places?lat=' + place.lat + '&lng=' + place.lng;
  return this.$http.get(url).then(
    // success callback
    function (response) {

      var wikivoyagePlaces = response.data;
      return {
        interestingPlaces: selectRandomPlacesByType(wikivoyagePlaces.result, place.type),
        allWikivoyagePlaces: wikivoyagePlaces.result,
      };

    },

    // error callback
    function (error) {
      console.log('places loading failed', error);
    }
  );

};

DetailsService.prototype.getDistrictInfo = function(places) {

  var locationURI = '',
      url;

  if (places.length > 0) {
    // estimate district by evaluating all surrounding places
    locationURI = getDistrictOfPlaces(places);
  } else {
    locationURI = 'http:localhost/wikivoyage/Berlin';
  }

  url = '/api/placeDetails/locationInfo?location=' + encodeURI(locationURI);
  return this.$http.get(url).then(
    // success callback
    function(response) {

      var districtInfo = response.data;
      if (districtInfo.length > 0) {
        return districtInfo[0];
      } else {
        return  '';
      }

    },

    // error callback
    function (error) {
      console.log('locationInfo loading failed', error);
    }
  );

};

DetailsService.prototype.getReviews = function (placeId) {

  return this.$http.get('/api/placeDetails/reviews/' + placeId).then(
    // success callback
    function(response) {

      var reviews = response.data;
      return _.filter(reviews, function (review) {
        return (review.language === 'en' || review.language === 'de') && review.wordsCount < 50;
      });

    },

    // error callback
    function(error) {
      console.error('reviews loading failed', error);
    }
  );

};

DetailsService.prototype.getImageUrl = function (placeId) {

  return this.$http.get('/api/placeDetails/image/' + placeId).then(
    // success callback
    function(response) {
      return response.data.url;
    },

    // error callback
    function(error) {
      console.error('image loading failed', error);
    }
  );

};

angular.module('locationMashupApp')
  .service('Details', ['$http', DetailsService]);
