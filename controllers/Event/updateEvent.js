const { updateEvent } = require('../../models/event');

module.exports = async (req) => {
    const { event_id: eId } = req.params;

    const {
        eventTitle,
        eventIntro,
        eventKey,
        totalChapterNum,
        isPublish,
        viewCount
    } = req.body;

    const eventData = {
        eId,
        eventTitle,
        eventIntro,
        eventKey,
        totalChapterNum,
        isPublish,
        viewCount
    };

    // 如果有 eventImage，才將其添加到 eventData 中
    if (req.file && req.file.buffer) {
        eventData.eventImage = req.file.buffer;
    }

    const event = await updateEvent(eventData);

    return event;
};
