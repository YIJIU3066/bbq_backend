const { getAllPublicEvent } = require('../../models/event');

module.exports = async (req) => {
    const { eventStatus } = req.query;
    const events = await getAllPublicEvent({
        eventStatus
    });
    return events;
};
