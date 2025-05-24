const { getUserByGmail } = require('../../models/user');

module.exports = async (req) => {
    const gmail = req.user.emails[0].value;
    console.log(gmail);
    const user = await getUserByGmail({ gmail });
    return user;
};
