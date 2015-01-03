'use strict';

var _ = require('lodash');
var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var Mapnificent = require('mapnificent');
var randtoken = require('rand-token');

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
  var data = require('../../../data/filtered/filtered.json');
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
  var id = randtoken.uid(8);
  var position = mapnificent.addPosition(latlng, time, id);
  var deferredPosition = position.getAllStationsByDistanceAndTime();

  if (req.query.noToken === "1") {
    deferredPosition.done(function() {
      var intersectPlaces = function(data) {
        console.log(data);
        var places = sparqler.sparqlFlatten(data);
        // TODO: places are empty ... maybe i have a wrong virtuoso setup :(
        console.log(places);
        var filteredPlaces = position.intersectPointsWithStations(places);
        res.json(filteredPlaces);
      };

      console.log(position.stationsAABB);
      sparqler.getResourcesInBBox(position.stationsAABB, intersectPlaces);
    });
  } else {
    res.json({ success: false, message: 'not implemented' });
  }

};
