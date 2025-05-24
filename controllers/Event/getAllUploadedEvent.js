const {
    getAllUploadedEvent
} = require('../../models/event');

module.exports = async (req) => {
    const { user_id: userId } = req.params;

    const events = await getAllUploadedEvent({ userId });

    return events;
};
