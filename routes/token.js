const express = require('express');
const router = express.Router();

const refreshToken = require('../controllers/refresh-token');

router.post('/token/refresh', refreshToken);

module.exports = router;
