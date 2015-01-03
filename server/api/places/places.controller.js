'use strict';

var _ = require('lodash');
var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var Mapnificent = require('mapnificent');
var randtoken = require('rand-token');
var request = require('request');
var $ = require('jquery-deferred');
var Reviews = require('../../services/reviews.js');
var Blacklist = require('../../services/blacklist.js');

/** INITIALIZATION **/

var sparqler = new TourpediaSparqler();

var mapnificent = new Mapnificent({
  active: true,
  added: '2010-10-03T12:05:26.240272',
  changed: '2014-05-23T12:15:48.620486',
  cityid: 'berlin',
  cityname: 'Berlin',
  description: '',
  lat: 52.525592,
  lng: 13.369545,
  northwest: {
    lat: 52.755362,
    lng: 12.901471,
  },
  options: {
    estimatedMaxCalculateCalls: 2100000
  },
  southeast: {
    lat: 52.295934,
    lng: 13.909891
  },
  version: 3
});
mapnificent.init();

/** HELPERS */

/**
 * Determine radius in meters depending on latitude.
 */
function getLngRadius(lat, mradius) {
  var equatorLength = 40075017;
  var DEG_TO_RAD = Math.PI / 180;
    var hLength = equatorLength * Math.cos(DEG_TO_RAD * lat);

    return (mradius / hLength) * 360;
}

/** EXPORTS **/

// Get list of all places
exports.index = function(req, res) {
  sparqler.getAllOverview( function(result) {
    res.json(result);
  });
};

exports.category = function(req, res) {
  var category = req.params.category
  sparqler.getAllOverviewOfClass(category, function(result) {
    res.json(result);
  });
};

exports.fake = function(req, res) {
  var data = require('../../../data/filtered/reviews.json');
  res.json(data);
};


/**
 * Start places calculation and send a token with wich the result can be retreived.
 * The token is used so a client app can request progress status in the meantime.
 *
 * One may pass `noToken=1` as query parameter to directly wait for the results.
 *
 * @param  {Request} req
 * @param  {Response} res
 * @return {mixed}     token or json data
 */
exports.getPlaces = function(req, res) {
  /*
    req.query must contain:
      - lat --> float
      - lng --> float
      - time --> int

    req.query may contain
      - noToken --> "1"
   */

  var latlng = {
    lat: parseFloat(req.query.lat),
    lng: parseFloat(req.query.lng)
  };
  var time = parseInt(req.query.time);
  var token = randtoken.uid(8);

  /** start mapnificent calculation ... **/
  var position = mapnificent.addPosition(latlng, time, token);
  var deferredPosition = position.getAllStationsByDistanceAndTime();

  /** ... and fetch tourpedia data in parallel **/
  var maxTransportationSpeed = 70 / 3.6; // estimated maximum public transportation speed in m/s
  var maxDistance = getLngRadius(time * maxTransportationSpeed);
  var bbox = sparqler.getBBox(latlng.lat, latlng.lng, maxDistance);
  var deferredPlaces = new $.Deferred();

  // apply filtering
  var deferredPlacesFiltered = deferredPlaces.then(function(places) {
    return _.filter(places, function(place) {
      // filter by blacklist
      var label = place.label;
      if (Blacklist.contains(label)) {
        return false;
      }

      // filter by reviews
      var id = place.s.replace('http://tour-pedia.org/resource/', '');
      console.log('was here places');
      // TODO: getById returns a deferred
      var reviews = Reviews.getById(id);

      if (reviews === null || reviews.length === 0) {
        return false;
      }

      // filter by rating and polarity
      var rating = 0;
      var ratingCount = 0;
      var polarity = 0;
      var polarityCount = 0;

      _.each(reviews, function(review) {
        if (review.rating > 0) {
          rating += review.rating;
          ratingCount++;
        }

        if (review.polarity > 0) {
          polarity += review.polarity;
          polarityCount++;
        }
      });

      rating = rating / ratingCount;
      polarity = polarity / polarityCount;

      if ((rating > 0 && rating < 3) || (polarity > 0 && polarity < 5)) {
        return false;
      }

      // seems ok
      return true;
    });
  });

  // start request
  sparqler.getResourcesInBBox(bbox, function(data) {
    var places = sparqler.sparqlFlatten(data);
    deferredPlaces.resolve(places);
  });

  if (req.query.noToken === "1") {

    $.when(deferredPlacesFiltered, deferredPosition).done(function(places) {
      var intersectedPlaces = position.intersectPointsWithStations(places);
      res.json(intersectedPlaces);
    });

  } else {
    res.status(501);
    res.send('not implemented yet');
  }

};
