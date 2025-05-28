const jwt = require('jsonwebtoken');
// const config = require('config');

// const {
//     auth: { jwtSecret, accessTokenExpiredTime, refreshTokenExpiredTime }
// } = config;

const jwtSecret = process.env.JWT_SECRET;
const accessTokenExpiredTime = process.env.ACCESS_TOKEN_EXPIRED_TIME;
const refreshTokenExpiredTime = process.env.REFRESH_TOKEN_EXPIRED_TIME;

// 產生 Access token
// data 是要存進 token 裡的 payload（例如使用者 ID）。
// 加上 type: 'accessToken' 做識別。
// 使用 jwtSecret 簽名，加上過期時間 accessTokenExpiredTime。
// jwtSecret 放在 config 中，會用來對整個 payload 進行簽名。
exports.generateAccessToken = (data) =>
    jwt.sign({ ...data, type: 'accessToken' }, jwtSecret, {
        expiresIn: accessTokenExpiredTime
    });

// 產生 refresh token
// refresh token 有比較長的有效期，用來之後換新的 access token。
exports.generateRefreshToken = (data) =>
    jwt.sign({ ...data, type: 'refreshToken' }, jwtSecret, {
        expiresIn: refreshTokenExpiredTime
    });

// 用來 decode JWT, 檢查 token 是不是預期的類型 (access/ refresh)
// 驗證失敗會丟出錯誤
exports.decodeToken = ({ token, type }) => {
    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (decoded.type !== type) {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('TokenExpired');
        }
        throw new Error('InvalidToken');
    }
};
