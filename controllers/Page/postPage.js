const { postPage } = require('../../models/page');

module.exports = async (req) => {
    const { cId, textContent, pageCreateTime } = req.body;

    const { id: uId } = req.currentUser;
    const imageContent = req.file ? req.file.buffer : null;

    const postPageResult = await postPage({
        uId,
        cId,
        textContent,
        imageContent,
        pageCreateTime
    });

    return postPageResult;
};
