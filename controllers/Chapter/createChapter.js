const { createChapter } = require('../../models/chapter');

module.exports = async (req) => {
    const {
        eId,
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime,
        pageNumber,
        chapterStatus
    } = req.body;

    const createChapterResult = await createChapter({
        eId,
        chapterTitle,
        chapterIntro,
        createTime,
        submitTime,
        voteTime,
        pageNumber,
        chapterStatus
    });
    return createChapterResult;
};
