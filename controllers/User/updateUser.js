const { updateUser } = require('../../models/user');

module.exports = async (req) => {
    const { user_id: uId } = req.params;

    const { username, lastLogin, avatar } = req.body;

    const updateResult = await updateUser({
        uId,
        username,
        lastLogin,
        avatar
    });
    return updateResult;
};
