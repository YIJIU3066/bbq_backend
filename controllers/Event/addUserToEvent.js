const { addUserToEvent } = require('../../models/event');

module.exports = async (req) => {
    const { event_key: eventKey, user_id: uId } = req.body;

    const result = addUserToEvent({ eventKey, uId });

    return result;
};
