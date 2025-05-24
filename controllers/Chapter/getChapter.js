const { getChapter } = require('../../models/chapter');

module.exports = async (req) => {
    const { chapter_id: cId } = req.params;
    const chapter = await getChapter({ cId });
    return chapter;
};
