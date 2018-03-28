"use strict";
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const controllers = require('../../controllers/admin/admins');

router.get('/', controllers.getAdmins);
router.post('/',  controllers.postAdmins);
router.get('/me', controllers.getAdminsMe);
router.get('/:adminId', controllers.getAdminsId);
router.patch('/:adminId', controllers.patchAdminsId);
router.delete('/:adminId', controllers.deleteAdminsId);
router.put('/:adminId/approve',  controllers.approveAdminsId);
router.put('/:adminId/disapprove', controllers.disapproveAdminsId);

module.exports = router;
