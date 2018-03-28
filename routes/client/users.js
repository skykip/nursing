var express = require('express');
var router = express.Router();
const controller = require('../../controllers/client/users');

router.get('/:userId', controller.getUserById);
router.post('/', controller.getUserById);
router.patch('/:userId', controller.patchUsersId);
router.patch('/:userId/update', controller.patchUpdateUsersId);

module.exports = router;
