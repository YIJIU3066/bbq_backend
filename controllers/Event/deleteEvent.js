const { deleteEvent } = require('../../models/event');

module.exports = async (req) => {
    const { event_id: eId } = req.params;
    const deleteResult = await deleteEvent({ eId });
    return deleteResult;
};
