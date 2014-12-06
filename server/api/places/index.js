'use strict';

var express = require('express');
var controller = require('./places.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:category', controller.category);

module.exports = router;