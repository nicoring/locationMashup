'use strict';

var _ = require('lodash');
var request = require('request');

var WikivoyageSparqler = require('../../libs/sparqler/wikivoyage_sparqler');
var wikiSparqler = new WikivoyageSparqler();

var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var tourSparqler = new TourpediaSparqler();

// Get list of placeDetails
exports.index = function(req, res) {
  var id = req.params.id;
  var resource = tourSparqler.createUriFromId(id);

  var query = 'select * where { $resource ?p ?o }';

  var sQuery = tourSparqler.createQuery(query)
    .setParameter('resource', resource)
    .execute(function(result) {
      result = tourSparqler.sparqlFlatten(result);
      res.json(result);
    });
};

exports.reviews = function(req, res) {
  var id = req.params.id;
  var url = 'http://tour-pedia.org/api/getReviewsByPlaceId?placeId=' + id;

  request(url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      body = JSON.parse(body);
      res.json(body);
    } else {
      console.log("Review Request failed", error);
      res.status(500).send('review request to "http://tour-pedia.org/api/getReviewsByPlaceId" failed');
    }
  });
};

exports.image = function(req, res) {
  var id = req.params.id;
  res.json([]);
};
