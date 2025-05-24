const datastore = require('../db/database');

const TABLE_NAME = 'user';

exports.findOne = ({ field, value, fields = '*' }) => {
    if (!field || !value) {
        throw new Error('Field and value must be provided');
    }
    return datastore
        .select(fields)
        .from(TABLE_NAME)
        .where(field, value)
        .first();
};

exports.getUserById = ({ uId, fields = '*' }) =>
    datastore
        .select(fields)
        .from(TABLE_NAME)
        .where('uId', uId)
        .first();

exports.getUserByGmail = ({ gmail, fields = '*' }) =>
    datastore
        .select(fields)
        .from(TABLE_NAME)
        .where('gmail', gmail);

exports.createUser = async ({
    username,
    gmail,
    lastLogin
}) => {
    let user = await datastore
        .insert({
            username: username,
            lastLogin: lastLogin,
            gmail: gmail,
            avatar: null
        })
        .into(TABLE_NAME)
        .then((result) => result)
        .catch((err) => ({
            status: 400,
            response: err
        }));
    return user;
};

// Update
exports.updateUser = ({
    uId,
    username,
    lastLogin,
    avatar
}) => {
    const updatedUser = datastore
        .from(TABLE_NAME)
        .where('uId', uId)
        .update({
            username,
            lastLogin,
            avatar
        })
        .then((result) => ({
            data: result
        }))
        .catch((err) => ({
            error: err
        }));
    return updatedUser;
};
