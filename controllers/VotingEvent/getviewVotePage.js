const { getViewVotePage } = require('../../models/votingevent');

module.exports = async (req) => {
    const { event_id: eId, chapter_id: cId } = req.params;
    const viewVotePage = await getViewVotePage({ eId, cId });

    return viewVotePage;
};