'use strict';

var express = require('express');
var controller = require('./placeDetails.controller');

var router = express.Router();

router.get('/:id', controller.index);
router.get('/reviews/:id', controller.reviews);
router.get('/image/:id', controller.image)

module.exports = router;
