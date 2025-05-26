const express = require('express');
const router = express.Router();

const pageRouter = require('./page');
const userRouter = require('./user');
const eventRouter = require('./event');
const chapterRouter = require('./chapter');
const votingEvents = require('./votingEvents');
const googleLoginRouter = require('./google-login');
const tokenRouter = require('./token');
// const loginRouter = require('./login');

router.use(pageRouter);
router.use(userRouter);
router.use(eventRouter);
router.use(chapterRouter);
router.use(votingEvents);
router.use(googleLoginRouter);
router.use(tokenRouter);
// router.use(loginRouter);

module.exports = router;
