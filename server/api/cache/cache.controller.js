'use strict';

var _ = require('lodash');
var reviews = require('../../services/reviews.js');
var schedule = require('node-schedule');

/**
 * Cleans all reviews in cache and db
 */
exports.clean = function(req, res) {
  reviews.cleanReviews();
  res.json([]);
};


/**
 * Loads reviews from mongoDB into inMemory Cache
 */
exports.warmUp = function(req, res) {
  reviews.warmUpCache();
  res.json([]);
};


function updateReviewEntries() {
  reviews.updateReviewEntries();
}

var rule = new schedule.RecurrenceRule();
rule.hour = 3;
var job;

/**
 * Updates all entries in mongoDB and inMemoryCache once
 */
exports.update = function(req, res) {
  updateReviewEntries();
  res.json([]);
};

/**
 * Starts updating task, is scheduled every day at 3am
 */
exports.startUpdates = function(req, res) {
  job = schedule.scheduleJob(rule, updateReviewEntries);
  res.json([]);
};


/**
 * Cancels scheduled updating task
 */
exports.stopUpdates = function(req, res) {
  job.cancel();
  res.json([]);
};
