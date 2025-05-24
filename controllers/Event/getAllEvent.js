const { getAllEvent } = require('../../models/event');

module.exports = async (req) => {
    const { user_id: userId } = req.params;
    const { eventStatus } = req.query;
    console.log(userId);
    const events = await getAllEvent({
        userId,
        eventStatus
    });
    return events;
};
