const { putVote } = require('../../models/votingevent');

module.exports = async (req) => {
    const { user_id: uId, page_id: pId } = req.params;
    const put_vote = await putVote({ uId, pId });

    return put_vote;
};