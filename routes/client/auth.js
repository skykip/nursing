"use strict";
const moment = require('moment');
const express = require('express');
const router = express.Router();
const errors = require('../../errors/index');

const controller = require('../../controllers/client/auth');

router.post('/', controller.postAuth);

module.exports = router;