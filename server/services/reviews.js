'use strict'

var mongoose = require('mongoose');
var $ = require('jquery-deferred');
var request = require('request');

var reviewSchema = mongoose.Schema({
  id: Number,
  timestamp: Date,
  reviews: Array
});

var ReviewsEntry = mongoose.model('ReviewsEntry', reviewSchema);


function getReviewsById(id) {
  var dfd = new $.Deferred();
  ReviewsEntry.findOne({id: id}, function(err, reviewsEntry) {
    if (err) {
      console.log('loading from mongoDB failed:', err);
      dfd.reject(err);
    } else {
      dfd.resolve(reviewsEntry);
    }
  });
  return dfd;
}

function addReviewsToDB(id, reviews) {
  var reviewsEntry = new ReviewsEntry({
    id: id,
    timestamp: Date.now(),
    reviews: reviews
  });

  reviewsEntry.save(function(err) {
    if (err) {
      console.error(err);
    }
  });
}

function getReviewsFromApi(id) {
  var dfd = new $.Deferred();

  var url = 'http://tour-pedia.org/api/getReviewsByPlaceId?placeId=' + id;
  request(url, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      body = JSON.parse(body);
      dfd.resolve(body);
    } else {
      console.log("Review Request failed", error);
      dfd.reject();
    }
  });

  return dfd;
}

exports.getById = function(id, callback) {
  var dfd = new $.Deferred();

  getReviewsById(id).done(function (reviewsEntry) {

    if (reviewsEntry === null) {
      getReviewsFromApi(id)
        .done(function (reviews) {
          dfd.resolve(reviews);
          addReviewsToDB(id, reviews);
        })
        .fail(function() {
          dfd.resolve(null);
        });
    } else {
      dfd.resolve(reviewsEntry.reviews);
    }
  }).fail( function() {
    dfd.resolve(null);
  });

  return dfd;
}
