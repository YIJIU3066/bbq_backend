const { getUserById } = require('../models/user');

const { decodeToken } = require('../utils/jwt-token');

exports.auth = async (req, res, next) => {
    try {
        const accessToken = req
            .header('authorization')
            .split(' ')[1];

        if (!accessToken) {
            return res
                .status(400)
                .json({ error: 'The token not found.' });
        }

        let decoded;

        try {
            decoded = decodeToken({
                token: accessToken,
                type: 'accessToken'
            });
        } catch (error) {
            if (error.message === 'TokenExpired') {
                return res
                    .status(401)
                    .json({ error: 'TokenExpired' });
            }
            return res
                .status(401)
                .json({ error: 'InvalidToken' });
        }

        const { userId } = decoded;

        const theUser = await getUserById({
            uId: userId
        });

        if (!theUser) {
            return res
                .status(401)
                .json({ error: 'Unauthorized' });
        }

        req.currentUser = {
            id: theUser.uId,
            name: theUser.username || ''
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        res.status(500).json({
            error: `Internal Server Error, ${error}`
        });
    }
};
