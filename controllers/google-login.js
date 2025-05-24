const axios = require('axios');
const querystring = require('querystring');
const config = require('config');
const moment = require('moment-timezone');

const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/jwt-token');

const { saveProfilePicture } = require('../utils/avatar');

const User = require('../models/user');

const {
    auth: {
        google: { redirectUrl, clientId, secret }
    }
} = config;

const getGoogleLoginUrl = async (req, res) => {
    const {
        client_url: clientUrl = 'https://www.google.com.tw/'
        // client_url: clientUrl
    } = req.query;
    const decodedUrl = querystring.unescape(clientUrl);

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        secret,
        redirectUrl
    );

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
        scope: scopes,
        state: decodedUrl
    });

    res.redirect(url);
};

const googleLoginHandler = async (req, res) => {
    const {
        code,
        state: clientUrl = 'https://www.google.com.tw/'
        // state: clientUrl
    } = req.query;
    const decodedUrl = querystring.unescape(clientUrl);

    try {
        const response = await axios.post(
            'https://www.googleapis.com/oauth2/v4/token',
            {
                code,
                client_id: clientId,
                client_secret: secret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUrl
            }
        );

        const { id_token: idToken } = response.data;

        const client = new OAuth2Client(clientId);

        const ticket = await client.verifyIdToken({
            idToken,
            audience: clientId
        });

        const data = ticket.getPayload();
        const id = ticket.getUserId();
        // console.log(data);
        let { email, name, picture } = data || {};

        const url = new URL(decodedUrl);

        if (!id) {
            url.searchParams.set(
                'error',
                'permission not granted, because no id value'
            );
            res.redirect(url.toString());
            return;
        }

        if (!email) {
            email = null;
            url.searchParams.set(
                'error',
                'permission not granted, because no email value'
            );
            res.redirect(url.toString());
            return;
        }

        if (!name) name = null;

        let theUser = await User.findOne({
            field: 'gmail',
            value: email
        });

        let userId = theUser?.uId;

        const currTime = moment()
            .tz('Asia/Taipei')
            .format('YYYY-MM-DD HH:mm:ss');

        if (!theUser) {
            const createdUser = await User.createUser({
                username: name,
                gmail: email,
                lastLogin: currTime
            });

            userId = createdUser[0];

            theUser = {
                uId: userId,
                username: name,
                gmail: email,
                lastLogin: currTime
            };

            // 存頭像
            await saveProfilePicture(theUser.uId, picture);
        } else {
            await User.updateUser({
                uId: theUser.uId,
                lastLogin: currTime
            });
        }

        const accessToken = generateAccessToken({ userId });
        const refreshToken = generateRefreshToken({
            userId
        });

        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);

        const type = 'google';

        url.searchParams.set('user_id', userId);
        url.searchParams.set('access_token', accessToken);
        url.searchParams.set('refresh_token', refreshToken);
        url.searchParams.set('name', name);
        url.searchParams.set('login_type', type);

        console.log(
            `User id ${userId}, email ${email} has login success`
        );

        res.redirect(url.toString());
    } catch (error) {
        console.error('Google login error:', error.message);
        res.status = 500;
        res.body = {
            error: 'Internal Server Error'
        };
    }
};

exports.getGoogleLoginUrl = getGoogleLoginUrl;
exports.googleLoginHandler = googleLoginHandler;
