"use strict";
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/roles');

router.get('/', controller.getRoles);
router.get('/:roleId', controller.getRolesId);
router.post('/', controller.postRoles);
router.patch('/:roleId', controller.patchRolesId);
router.delete('/:roleId', controller.deleteRolesId);

module.exports = router;
