const { getPage } = require('../../models/page');

module.exports = async (req) => {
    const { page_id: pId } = req.params;
    const page = await getPage({ pId });
    return page;
};
