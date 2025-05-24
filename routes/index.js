const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const eventRouter = require('./event');
// const loginRouter = require('./login');
const chapterRouter = require('./chapter');
const pageRouter = require('./page');
const votingEvents = require('./votingEvents');
const googleLoginRouter = require('./google-login');
const tokenRouter = require('./token');

// router.use(loginRouter);
router.use(userRouter);
router.use(eventRouter);
router.use(chapterRouter);
router.use(pageRouter);
router.use(votingEvents);
router.use(googleLoginRouter);
router.use(tokenRouter);

module.exports = router;
