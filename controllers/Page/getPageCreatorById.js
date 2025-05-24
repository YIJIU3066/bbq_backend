const { getPageCreatorById } = require('../../models/page');

module.exports = async ({ pId }) => {
    const page = await getPageCreatorById({ pId });
    return page;
};
