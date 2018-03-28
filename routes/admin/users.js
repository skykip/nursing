"use strict";
const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/admin/users');

//获取limit和offset限制后的用户列表信息
//获取后台所需要的用户信息表单
router.post('/', UserController.getUsers);
//router.get('/customers', UserController.getCustomers);
//获取后台所需要的单个用户信息
router.get('/:userId', UserController.getUsersId);



//router.post('/query', UserController.queryUsers);
router.delete('/:userId', UserController.deleteUsersId);
router.patch('/:userId', UserController.patchUsersId);
router.post('/', UserController.postUsers);

module.exports = router;
