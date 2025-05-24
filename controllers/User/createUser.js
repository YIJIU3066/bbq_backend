const { createUser } = require('../../models/user');

module.exports = async (req) => {
    //const username = req.username;
    //const gmail = req.gmail;
    const {
        username,
        gmail } =
        req.body;
    const createResult = await createUser({
        username,
        gmail
    });
    return createResult;
};
