'use strict';

var express = require('express');
var controller = require('./placeDetails.controller');

var router = express.Router();

router.get('/', controller.index);
// router.get('/details', controller.details);
// router.get('/reviews', controller.reviews);
// router.get('/image', comtroller.image)

// test
router.get('/activity/:type', controller.activity);

module.exports = router;