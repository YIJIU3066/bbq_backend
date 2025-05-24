const { getPrivateVotingEvents } = require('../../models/votingevent');

module.exports = async (req) => {
    const { event_key: e_key } = req.params;
    const votingEvent = await getPrivateVotingEvents({ e_key });

    return votingEvent;
};