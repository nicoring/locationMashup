'use strict';

var _ = require('lodash');
var request = require('request');
var reviews = require('../../services/reviews.js');

var WikivoyageSparqler = require('../../libs/sparqler/wikivoyage_sparqler');
var wikiSparqler = new WikivoyageSparqler();

var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var tourSparqler = new TourpediaSparqler();

var DBPediaSparqler = require('../../libs/sparqler/dbpedia_sparqler');
var dbpSparqler = new DBPediaSparqler();


// Get list of placeDetails
exports.index = function(req, res) {
  var id = req.params.id;
  tourSparqler.getPlaceById(id, function (result) {
    res.json(result);
  });
};


exports.reviews = function(req, res) {
  var id = req.params.id;
  // var url = 'http://tour-pedia.org/api/getReviewsByPlaceId?placeId=' + id;

  // request(url, function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     body = JSON.parse(body);
  //     res.json(body);
  //   } else {
  //     console.log("Review Request failed", error);
  //     res.status(500).send('review request to "http://tour-pedia.org/api/getReviewsByPlaceId" failed');
  //   }
  // });
  reviews.getById(id)
    .done(function(reviews) {
      if (reviews !== null) {
        res.json(reviews);
      } else {
        console.log("Review Request failed");
        res.status(500).send('review request to "http://tour-pedia.org/api/getReviewsByPlaceId" failed');
      }
    });
    // .fail(function() {
    //   console.log("Review Request failed");
    //   res.status(500).send('review request to "http://tour-pedia.org/api/getReviewsByPlaceId" failed');
    // });
};


exports.image = function(req, res) {
  var id = req.params.id;
  var resource = tourSparqler.createUriFromId(id);

  var query = 'select ?url from $graph where { $resource vcard:hasPhoto ?url }';

  var sQuery = tourSparqler.createQuery(query)
    .setParameter('graph', tourSparqler.defaultGraph)
    .setParameter('resource', resource)
    .execute(function(result) {
      result = tourSparqler.sparqlFlatten(result)[0];
      res.json(result);
    });
};


exports.interestingPlaces = function(req, res) {

  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);

  var radius = 0.01;
  var bbox = {};
  var result = {};

  function requestBBox() {
    bbox = wikiSparqler.getBBox(lat, lng, radius);
    wikiSparqler.getResourcesInBBox(bbox, function (res) {
      result = wikiSparqler.sparqlFlatten(res);
      handleResult();
    });
  }

  function handleResult() {
    // console.log(radius);

    // find at least 5 nearest resources
    if (result.length < 5) {
      radius += 0.01;
      requestBBox();
    } else {
      res.json({
        result: result,
        bbox: bbox
      });
    }
  }

  requestBBox(radius);
};

exports.locationInfo = function(req, res) {
  var location = req.query.location;

  wikiSparqler.getLocationDetailsByUri(location, function (result) {
    if (result.dbpediaUri) {
      // dbpSparqler.getWikipediaLink(result.dbpediaUri, function(wikiLink) {
      //   console.log("result", wikiLink);
      //   result.wikiLink = wikiLink;
      //   res.json(result);
      // });
      res.json(result);
    } else {
      res.json(result);
    }
  });
};
