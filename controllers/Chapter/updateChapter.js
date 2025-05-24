const { updateChapter } = require('../../models/chapter');

module.exports = async (req) => {
    const { chapter_id: cId } = req.params;
    const {
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime,
        pageNumber,
        chapterStatus
    } = req.body;

    const updatedResult = await updateChapter({
        cId,
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime,
        pageNumber,
        chapterStatus
    });

    return updatedResult;
};
