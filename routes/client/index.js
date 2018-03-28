"use strict";
const express = require('express');
const router = express.Router();

const auth = require('./auth');
const users = require('./users');
const works = require('./works');
const prices = require('./prices');
const verifyCode = require('./verifyCode');
const hospital = require('./hospital');
const area = require('./area');
const orders = require('./orders');
const orderWorks = require('./orderWorks');

router.use('/auth', auth);
router.use('/user', users);
router.use('/work', works);
router.use('/price', prices)
router.use('/verify-code', verifyCode);
router.use('/hospital',hospital);
router.use('/area',area);
router.use('/order',orders);
router.use('/orderwork', orderWorks);


module.exports = router;
