'use strict';

var _ = require('lodash');

var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var sparqler = new TourpediaSparqler();

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
