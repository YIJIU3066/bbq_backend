const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const { getUserById, updateUser } = require('../controllers/user');

const handleResult = (res, result) => {
    if (result.status && result.status !== 200) {
        res.status(result.status).json(result);
    } else {
        res.status(200).json(result);
    }
};

// 檢查執行動作的 user 有沒有權限
const checkUser = async (req, res) => {
    const requestedUserId = parseInt(req.params.user_id, 10);

    const { id: currentUser_id } = req.currentUser;

    if (requestedUserId !== currentUser_id) {
        res.status(403).json({ error: 'Forbidden' });
        return false;
    }

    return true;
};

// 獲得使用者資訊
router.get('/user/:user_id', auth, async (req, res) => {
    try {
        const hasPermission = await checkUser(req, res);
        if (!hasPermission) {
            return;
        }
        const user = await getUserById(req);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 更新使用者資訊
router.put('/user/:user_id', auth, async (req, res) => {
    try {
        const hasPermission = await checkUser(req, res);
        if (!hasPermission) {
            return;
        }
        const result = await updateUser(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;
