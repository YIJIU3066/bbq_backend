const { updatePage } = require('../../models/page');

module.exports = async (req) => {
    const { page_id: pId } = req.params;
    const { textContent, voteCount, isWinner } = req.body;

    const pageData = {
        pId,
        textContent,
        voteCount,
        isWinner
    };

    if (req.file && req.file.buffer) {
        pageData.imageContent = req.file.buffer;
    }

    // const imageContent = req.file ? req.file.buffer : null;

    const updatedResult = await updatePage(pageData);
    return updatedResult;
};
