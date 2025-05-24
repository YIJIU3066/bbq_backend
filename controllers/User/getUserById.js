const { getUserById } = require('../../models/user');

module.exports = async (req) => {
    const { id: uId, name } = req.currentUser;
    const user = await getUserById({ uId });
    return user;
};
