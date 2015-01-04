'use strict'

var mongoose = require('mongoose');
var $ = require('jquery-deferred');
var request = require('request');
var _ = require('lodash');


var reviewSchema = mongoose.Schema({
  id: Number,
  timestamp: Date,
  reviews: Array
});

var ReviewsEntry = mongoose.model('ReviewsEntry', reviewSchema);
var inMemoryCache = {}; // object in memory to boost cache hits

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

function addReviewsToCache(id, reviews) {
  var reviewsEntry = new ReviewsEntry({
    id: id,
    timestamp: Date.now(),
    reviews: reviews
  });

  inMemoryCache[id] = reviewsEntry;
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

function getReviewsFromCache(id) {
  if (id in inMemoryCache) {
    return inMemoryCache[id];
  }

  // nothing found
  return null;
}

function getReviewsFromApi(id) {
  var dfd = new $.Deferred();

  var url = 'http://tour-pedia.org/api/getReviewsByPlaceId?placeId=' + id;
  request({url: url, timeout: 1000}, function(error, response, body) {
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


function updateReviewEntry(id) {
  getReviewsFromApi(id).done( function(reviews){

    console.log('update');
    ReviewsEntry.update({ id: id }, {
      timestamp: Date.now(),
      reviews: reviews
    }, function (err, nrAffected) {
      if (err) {
        console.error(err);
      }
      console.log('updated entry with id', id);
    });

    // load updates into in-memory cache
    inMemoryCache[reviews.id] = reviews.reviews;
  });
}

exports.cleanReviews = function() {
  inMemoryCache = {};
  console.log('cleaned Cache');
  ReviewsEntry.remove(function(err) {
    if (err) {
      console.log('db clean failed:', err);
    } else {
      console.log('cleaned DB');
    }
  });
};

exports.updateReviewEntries = function() {
  console.log('start updating db entries');

  ReviewsEntry.find(function(err, allEntries) {
    _.each(allEntries, function(el) {
      updateReviewEntry(el.id);
    });
  });
};

exports.warmUpCache = function() {
  console.log('warm up');
  var t = Date.now();
  ReviewsEntry.find(function(err, allReviews) {
    _.each(allReviews, function(reviewsEntry) {
      inMemoryCache[reviewsEntry.id] = reviewsEntry.reviews;
    });
    console.log('done warm up in ', Date.now() - t +'ms');
  });
}

exports.getById = function(id, callback) {
  var dfd = new $.Deferred();

  var reviews = getReviewsFromCache(id);
  if (reviews !== null) {
    // console.log('cache hit: in-memory');
    dfd.resolve(reviews);
  } else {
    // console.log('cache-miss: in-memory');
    getReviewsById(id)
      .done(function (reviewsEntry) {
        if (reviewsEntry === null) {
          getReviewsFromApi(id)
            .done(function (reviews) {
              dfd.resolve(reviews);
              addReviewsToDB(id, reviews);
              addReviewsToCache(id, reviews);
            })
            .fail(function() {
              dfd.resolve(null);
            });
        } else {
          // console.log('cache-hit: db');
          dfd.resolve(reviewsEntry.reviews);
          addReviewsToCache(id, reviewsEntry.reviews);
        }
      }).fail( function() {
        dfd.resolve(null);
      });
  }

  return dfd;
}
