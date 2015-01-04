'use strict';

var express = require('express');
var controller = require('./cache.controller');

var router = express.Router();

router.get('/clean', controller.clean);
router.get('/update/start', controller.startUpdates);
router.get('/update/stop', controller.stopUpdates);
router.get('/update', controller.update);
router.get('/warmUp', controller.warmUp);

module.exports = router;
