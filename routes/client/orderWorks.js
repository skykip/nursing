"use strict";
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/orderWorks');


//获取workId下的待接单信息
router.get('/', controller.getOrderWorks);

router.get('/:orderWorkId', controller.getOrderWorksId);

//护工接单
router.put('/:orderWorkId/accept', controller.acceptOrderWork);

//护工拒单
router.put('/:orderWorkId/reject', controller.rejectOrderWork);

module.exports = router;
