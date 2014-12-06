'use strict';

var _ = require('lodash');

var TourpediaSparqler = require('../../libs/sparqler/tourpedia_sparqler');
var sparqler = new TourpediaSparqler();

// Get list of all places
exports.index = function(req, res) {
  sparqler.getAllOverview( function(result) {
  	res.json(resut);
  });
};

exports.category = function(req, res) {
	var category = req.params.category
  sparqler.getAllOverviewOfClass(category, function(result) {
  	res.json(result);
  });
};