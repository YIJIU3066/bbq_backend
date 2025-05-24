const { getMyAllEvent } = require('../../models/event');

module.exports = async (req) => {
    const { user_id: userId } = req.params;
    const { eventStatus } = req.query;
    const events = await getMyAllEvent({
        userId,
        eventStatus
    });
    return events;
};
