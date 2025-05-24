const { getEvent } = require('../../models/event');

module.exports = async (req) => {
    const { event_id: eId } = req.params;
    const event = await getEvent({ eId });
    return event;
};
