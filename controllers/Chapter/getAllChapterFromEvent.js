const {
    getAllChapterFromEvent
} = require('../../models/chapter');

module.exports = async (req) => {
    const { event_id: eId } = req.params;
    const allChapter = await getAllChapterFromEvent({
        eId
    });
    return allChapter;
};
