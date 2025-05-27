const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const getChapter = require('../controllers/Chapter/getChapter');
const getAllChapterFromEvent = require('../controllers/Chapter/getAllChapterFromEvent');
const getChapterCreatorById = require('../controllers/Chapter/getChapterCreatorById');
const createChapter = require('../controllers/Chapter/createChapter');
const updateChapter = require('../controllers/Chapter/updateChapter');
const deleteChapter = require('../controllers/Chapter/deleteChapter');

// const handleResult = (res, result) => {
//     if (result.status && result.status !== 200) {
//         res.status(result.status).json(result);
//     } else {
//         res.status(200).json(result);
//     }
// };

// 檢查執行動作的 user 有沒有權限
const checkUser = async (req, res) => {
    const { chapter_id: cId } = req.params;
    const { id: userId } = req.currentUser;

    const chapterCreator = await getChapterCreatorById({
        cId
    });

    if (chapterCreator) {
        if (chapterCreator !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return false;
        }
        return true;
    } else {
        res.status(403).json({
            error: 'Chapter not found'
        });
        return false;
    }
};

// 獲得某章節資訊
router.get('/chapter/:chapter_id', async (req, res, next) => {
    try {
        // const result = await getChapter(req);
        // handleResult(res, result);
        res.locals.result = await getChapter(req);
        next();
    } catch (error) {
        // console.error(error);
        // res.status(500).json({
        //     error: 'Internal Server Error'
        // });
        next(error);
    }
});

// 獲得某 event 的所有章節
router.get('/allChapter/:event_id', async (req, res, next) => {
    try {
        // const result = await getAllChapterFromEvent(req);
        // handleResult(res, result);
        res.locals.result = await getAllChapterFromEvent(req);
        next();
    } catch (error) {
        // console.error(error);
        // res.status(500).json({
        //     error: 'Internal Server Error'
        // });
        next(error);
    }
});

// 建立新的章節
router.post('/chapter', async (req, res) => {
    try {
        // const result = await createChapter(req);
        // handleResult(res, result);
        res.locals.result = await createChapter(req);
        next();
    } catch (error) {
        // console.error(error);
        // res.status(500).json({
        //     error: 'Internal Server Error'
        // });
        next(error);
    }
});

// 更新章節
router.put('/chapter/:chapter_id', checkUser, async (req, res, next) => {
    try {
        res.locals.result = await updateChapter(req);
        next();
    } catch (error) {
        next(error);
    }
    // const hasPermission = await checkUser(req, res);
    // if (!hasPermission) {
    //     return;
    // }
    // const result = await updateChapter(req);
    // handleResult(res, result);
});

// router.put('/chapter/:chapter_id', auth, async (req, res) => {
//     try {
//         const hasPermission = await checkUser(req, res);
//         if (!hasPermission) {
//             return;
//         }
//         const result = await updateChapter(req);
//         handleResult(res, result);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error: 'Internal Server Error'
//         });
//     }
// });

// 刪除章節
router.delete(
    '/chapter/:chapter_id',
    auth,
    checkUser,
    async (req, res, next) => {
        try {
            res.locals.result = await deleteChapter(req);
            next();
            // const hasPermission = await checkUser(req, res);
            // if (!hasPermission) {
            //     return;
            // }
            // const result = await deleteChapter(req);
            // handleResult(res, result);
        } catch (error) {
            next(error);
            // console.error(error);
            // res.status(500).json({
            //     error: 'Internal Server Error'
            // });
        }
    }
);
module.exports = router;
