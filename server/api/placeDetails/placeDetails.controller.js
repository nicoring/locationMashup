'use strict';

var _ = require('lodash');

var WikivoyageSparqler = require('../../libs/sparqler/wikivoyage_sparqler');
var sparqler = new WikivoyageSparqler();


// Get list of placeDetails
exports.index = function(req, res) {
  res.json([]);
};

exports.activity = function(req, res) {
  var category = req.params.type;

  sparqler.getAllOfCategory(category, function(result) {
    res.json(result);
  });
}