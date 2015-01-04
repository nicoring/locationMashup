'use strict';

var _ = require('lodash');
var reviews = require('../../services/reviews.js');

/**
 * Clean all reviews in cache and db
 */
exports.clean = function(req, res) {
  reviews.cleanReviews();
  res.json([]);
};

exports.update = function(req, res) {
  reviews.updateReviewEntries();
  res.json([]);
};

exports.startUpdates = function(req, res) {
  res.json([]);
};

exports.stopUpdates = function(req, res) {
  res.json([]);
};

exports.warmUp = function(req, res) {
  reviews.warmUpCache();
  res.json([]);
};
