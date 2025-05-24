const {
    getEventCreatorById
} = require('../../models/event');

module.exports = async ({ eId }) => {
    const event = await getEventCreatorById({ eId });
    return event;
};
