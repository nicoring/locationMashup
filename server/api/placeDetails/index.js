'use strict';

var express = require('express');
var controller = require('./placeDetails.controller');

var router = express.Router();

router.get('/places', controller.places);
router.get('/locationInfo', controller.locationInfo);
router.get('/reviews/:id', controller.reviews);
router.get('/image/:id', controller.image);
router.get('/:id', controller.index);


module.exports = router;
