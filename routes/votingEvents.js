const express = require('express');
const router = express.Router();

// const {
//     getPrivateVotingEvents,
//     getPublicVotingEvents,
//     getViewVotePage,
//     putVote
// } = require('../controllers/votingEvent');

const getPublicVotingEvents = require('../controllers/VotingEvent/getPublicVotingEvent');
const getPrivateVotingEvents = require('../controllers/VotingEvent/getPrivateVotingEvent');
const getViewVotePage = require('../controllers/VotingEvent/getviewVotePage');
const putVote = require('../controllers/VotingEvent/putVote');

router.get('/public_voting_event/', async (req, res) => {
    try {
        const public_voting_event = await getPublicVotingEvents(req);
        res.status(200).json({
            public_voting_event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'public_voting_event: Internal Server Error'
        });
    }
});

router.get('/private_voting_event/:event_key', async (req, res) => {
    try {
        const private_voting_event = await getPrivateVotingEvents(req);

        if (!private_voting_event) {
            return res.status(400).json({
                error: 'private_voting_event: Bad Request - Event Key not found'
            });
        }

        res.status(200).json({
            private_voting_event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'private_voting_event: Internal Server Error'
        });
    }
});

router.get('/viewVotePage/:event_id/:chapter_id', async (req, res) => {
    try {
        const view_voting_event = await getViewVotePage(req);
        res.json({
            view_voting_event
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'view_voting_event: Internal Server Error'
        });
    }
});

// 投票
router.put('/vote/:user_id/:page_id', async (req, res) => {
    try {
        const vote = await putVote(req);
        res.json({
            vote
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;

//const getPublicvotingEvents = require('../controllers/VotingEvent/searchVotingEvent');

// 獲取特定繪本的可投票章節詳情

// 使用者投票

//module.exports = router;
