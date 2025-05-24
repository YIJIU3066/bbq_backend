const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
    getUserByGmail,
    updateUser,
    createUser
} = require('../controllers/user');

/*//登入session測試
router.get('/testHomePage', (req, res) => {
    res.send('歡迎登入:' + req.session.userData.username);
    //console.log(req.originalUrl);
});
*/
//登入頁面
router.get('/login', (req, res) => {
    const loginPageHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
        </head>
        <body>
            <h1>Login Page</h1>
            <form action="/auth/google" method="GET">
                <input type="hidden" name="redirectURL" value="/login">
                <button type="submit">Login with Google</button>
            </form>
            <form action="/updateUser" method="POST" id="updateUserForm">
                <input type="hidden" name="uId" value="5">
                <input type="hidden" name="username" value="TEST">
                <input type="hidden" name="lastLogin" value="不更動">
                <input type="hidden" name="avatar" value=null>
                <button type="submit">Update</button>
            </form>

            <div id="response"></div>

            <script>
                document.getElementById('updateUserForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const form = event.target;

                    const formData = new FormData(form);
                    const data = {};
                    formData.forEach((value, key) => {
                        data[key] = value;
                    });

                    fetch('/updateUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        document.getElementById('response').innerText = 'User updated successfully!';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        document.getElementById('response').innerText = 'Failed to update user.';
                    });
                });
            </script>
        </body>
        </html>
    `;
    res.send(loginPageHtml);
});

// Initiates the Google OAuth 2.0 authentication flow
router.get(
    '/auth/google',
    (req, res, next) => {
        const redirectTo = req.query.redirectURL;
        console.log(redirectTo);
        if (redirectTo) {
            req.session.returnTo = redirectTo;
        } else {
            req.session.returnTo = '/';
        }
        next();
    },
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Callback URL for handling the OAuth 2.0 response
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            const user = await getUserByGmail(req);

            if (user.length > 0) {
                let result = Object.values(JSON.parse(JSON.stringify(user)));

                const updateData = {
                    uId: result[0].uId,
                    username: result[0].username,
                    lastLogin: new Date(),
                    avatar: null
                };

                req.body = updateData;

                let user_update = await updateUser(req)
                    .then((result) => {
                        if (result.status === 200) {
                            console.log(
                                'User updated successfully:',
                                result.response
                            );
                        } else {
                            console.error(
                                'Update user failed:',
                                result.response
                            );
                        }
                    })
                    .catch((err) => {
                        console.error('Error updating user:', err);
                    });

                result = Object.values(JSON.parse(JSON.stringify(user)));

                // Store result in session
                req.session.userData = result[0];
            } else {
                const userData = {
                    username: req.user.displayName,
                    gmail: req.user.emails[0].value
                };

                req.body = userData;
                let user = await createUser(req);
                user = await getUserByGmail(req);
                let result = Object.values(JSON.parse(JSON.stringify(user)));

                // Store result in session
                req.session.userData = result[0];
            }
            res.setHeader('Set-Cookie', 'isLoggedIn=true');

            const returnTo = req.session.returnTo || '/';
            delete req.session.returnTo; // Clear the returnTo value in session
            console.log(req.session.userData);
            res.cookie('uId', req.session.userData.uId);
            res.cookie('username', req.session.userData.username);

            res.redirect(returnTo);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
);

router.get('/userdata', (req, res) => {
    try {
        const userData = req.session.userData;
        if (!userData) {
            return null;
        }

        res.json(userData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');

        res.redirect('/');
    });
});
module.exports = router;
