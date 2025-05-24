const express = require('express');
const router = express.Router();
const {
    getGoogleLoginUrl,
    googleLoginHandler
} = require('../controllers/google-login');

router.get('/auth/google/login', getGoogleLoginUrl);

router.get('/auth/google/callback', googleLoginHandler);

module.exports = router;
