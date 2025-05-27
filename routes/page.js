const express = require('express');
const multer = require('multer');
const router = express.Router();
const { auth } = require('../middleware/auth');

const getPage = require('../controllers/Page/getPage');
const getAllPageFromChapter = require('../controllers/Page/getAllPageFromChapter');
const getPageCreatorById = require('../controllers/Page/getPageCreatorById');
const deletePage = require('../controllers/Page/deletePage');
const postPage = require('../controllers/Page/postPage');
const updatePage = require('../controllers/Page/updatePage');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

// 檢查執行動作的 user 有沒有權限
const checkUser = async (req, res) => {
    const { page_id: pId } = req.params;
    const { id: userId } = req.currentUser;

    const pageCreator = await getPageCreatorById({ pId });

    if (!pageCreator) {
        return next({ status: 404, message: 'Page not found' });
    }

    if (pageCreator !== userId) {
        return next({ status: 403, message: 'Forbidden' });
    }
};

// 獲得某個投稿頁面
router.get('/page/:page_id', async (req, res, next) => {
    try {
        res.locals.result = await getPage(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得某章節的所有投稿頁面
router.get('/allPage/:chapter_id', async (req, res, next) => {
    try {
        res.locals.result = await getAllPageFromChapter(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得某使用者所有投稿頁面?(前端看起來沒有這個頁面)

// 建立投稿頁面
router.post(
    '/page',
    auth,
    upload.single('imageContent'),
    async (req, res, next) => {
        try {
            res.locals.result = await postPage(req);
            next();
        } catch (error) {
            next(error);
        }
    }
);

// 編輯投稿頁面
router.put(
    '/page/:page_id',
    auth,
    upload.single('imageContent'),
    checkUser,
    async (req, res, next) => {
        try {
            res.locals.result = await updatePage(req);
            next();
        } catch (error) {
            next(error);
        }
    }
);

// 刪除投稿頁面
router.delete('/page/:page_id', auth, checkUser, async (req, res, next) => {
    try {
        res.locals.result = await deletePage(req);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
