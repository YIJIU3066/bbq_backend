const { createEvent } = require('../../models/event');

module.exports = async (req) => {
    const {
        // creatorId,
        eventTitle,
        eventIntro,
        eventKey,
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime
    } = req.body;

    const { id: creatorId } = req.currentUser;

    const eventImage = req.file ? req.file.buffer : null;

    const createResult = await createEvent({
        creatorId,
        eventTitle,
        eventIntro,
        eventKey,
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime,
        eventImage
    });

    return createResult;
};
