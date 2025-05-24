const {
    getAllPageFromChapter
} = require('../../models/page');

module.exports = async (req) => {
    const { chapter_id: cId } = req.params;
    const allPage = await getAllPageFromChapter({ cId });
    return allPage;
};
