const { deleteChapter } = require('../../models/chapter');

module.exports = async (req) => {
    const { chapter_id: cId } = req.params;
    const deleteResult = await deleteChapter({ cId });
    return deleteResult;
};
