'use strict';

var express = require('express');
var controller = require('./places.controller');

var router = express.Router();

// router.get('/tourpedia', controller.getPlaces);
router.get('/fake', controller.fake);
// router.get('/:category', controller.getPlacesOfCategory);
router.get('/', controller.getPlaces);

module.exports = router;
