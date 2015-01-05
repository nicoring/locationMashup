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


// warm up review cache
Reviews.warmUpCache();

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

  var running = true;

  req.on('close', function() {
    console.log('connection closed');
    // computeProcess.kill('SIGHUP');
    running = false;
  });

  var latlng = {
    lat: parseFloat(req.query.lat),
    lng: parseFloat(req.query.lng)
  };
  var time = parseInt(req.query.time);
  var token = randtoken.uid(8);

  /** start mapnificent calculation ... **/
  var position = mapnificent.addPosition(latlng, time, token);
  var deferredPosition = position.getAllStationsByDistanceAndTime();

  /** ... and setup tourpedia data **/
  var deferredPlaces = new $.Deferred();

  // setup filter
  var deferredPlacesFiltered = deferredPlaces.then(function(places) {
    var dfdFiltered = new $.Deferred();
    var filteredPlaces = [];

    var resolvePlace = function(keep, placeIndex) {
      if (keep) {
        filteredPlaces.push(places[placeIndex]);
      }

      if (parseInt(placeIndex) === places.length - 1) {
        dfdFiltered.resolve(filteredPlaces);
      }
    }

    var filterPlace = function(placeIndex) {
      var place = places[placeIndex];

      // filter by blacklist
      var label = place.label;
      if (Blacklist.contains(label)) {
        resolvePlace(false, placeIndex);
        return;
      }

      // filter by reviews
      var id = place.s.replace('http://tour-pedia.org/resource/', '');
      Reviews.getById(id).done(function(reviews) {
        // connection error
        // we don't know anything
        // so keep the place
        if (reviews === null) {
          resolvePlace(true, placeIndex);
          return;
        }

        if (reviews.length === 0) {
          resolvePlace(false, placeIndex);
          return;
        }

        // filter by rating and polarity
        var reviewCount = 0;
        var rating = 0;
        var ratingCount = 0;
        var polarity = 0;
        var polarityCount = 0;

        _.each(reviews, function(review) {
          if (!review) {
            return false;
          }

          if (review.rating > 0) {
            rating += review.rating;
            ratingCount++;
          }

          if (review.polarity > 0) {
            polarity += review.polarity;
            polarityCount++;
          }

          reviewCount++;
        });

        // validate reviews
        if (reviewCount !== reviews.length) {
          resolvePlace(false, placeIndex);
          return;
        }

        rating = rating / ratingCount;
        polarity = polarity / polarityCount;

        if ((rating > 0 && rating < 3) || (polarity > 0 && polarity < 5)) {
          resolvePlace(false, placeIndex);
          return;
        }

        // seems ok
        resolvePlace(true, placeIndex);
      });
    }

    // apply filter for each place
    for (var placeIndex in places) {
      filterPlace(placeIndex);
    }

    return dfdFiltered;
  });


  if (req.query.noToken === "1" && running) {

    // wait for mapnificent to finish
    time = Date.now();
    $.when(deferredPosition).done(function() {
      if (!running) {
        return;
      }

      console.log('done mapnificent!');
      console.log('took ', Date.now() - time +'ms');

      // start request with approximate bbox from mapnificent
      time = Date.now();
      sparqler.getResourcesInBBox(position.stationsAABB, function(data) {
        if (!running) {
          return;
        }

        var places = sparqler.sparqlFlatten(data);
        console.log('done fetching places!', places.length + ' places.');
        console.log('took ', Date.now() - time +'ms');

        time = Date.now();
        deferredPlaces.resolve(places);
      });

      // wait for sparql to finish
      $.when(deferredPlacesFiltered).done(function(places) {
        if (!running) {
          return;
        }

        console.log('done filtering places!', places.length +' places remain.');
        console.log('took ', Date.now() - time +'ms');

        // intersect tourpedia places with mapnificent's station map
        time = Date.now();
        var intersectedPlaces = position.intersectPointsWithStations(places);
        console.log('done intersecting places!', intersectedPlaces.length +' places remain.');
        console.log('took ', Date.now() - time +'ms');

        if (!running) {
          return;
        }

        res.json(intersectedPlaces);
      });
    });

  } else {
    res.status(501);
    res.send('not implemented yet');
  }

};
