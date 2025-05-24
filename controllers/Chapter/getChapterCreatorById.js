const {
    getChapterCreatorById
} = require('../../models/chapter');

module.exports = async ({ cId }) => {
    const chapter = await getChapterCreatorById({ cId });
    return chapter;
};
