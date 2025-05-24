const { updateViewCount } = require('../../models/event');

module.exports = async (req) => {
    const { event_id: eId } = req.params;
    const result = await updateViewCount({ eId });

    return result;
};
