const {
    generateAccessToken,
    decodeToken
} = require('../utils/jwt-token');

module.exports = async (req, res) => {
    try {
        const { refreshToken, userId } = req.body;

        const { userId: userIdFromToken } = decodeToken({
            token: refreshToken,
            type: 'refreshToken'
        });

        if (+userIdFromToken !== +userId) {
            return res.status(400).json({
                error: 'Not a valid member.'
            });
        }

        const newAccessToken = generateAccessToken({
            userId
        });

        // const accessToken = generateAccessToken({ userId });

        res.json({
            accessToken: newAccessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};
