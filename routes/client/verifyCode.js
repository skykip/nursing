"use strict";
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/verifyCode');

router.post('/', controller.postVerifyCode);

module.exports = router;
