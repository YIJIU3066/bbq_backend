const express = require('express');
const multer = require('multer');
const router = express.Router();
const { auth } = require('../middleware/auth');

const {
    getEventCreatorById,
    getEvent,
    getAllEvent,
    getAllPublicEvent,
    getMyAllEvent,
    getAllCreatedEvent,
    getAllUploadedEvent,
    createEvent,
    addUserToEvent,
    updateEvent,
    updateViewCount,
    deleteEvent
} = require('../controllers/event');

// const getEvent = require('../controllers/Event/getEvent');
// const getAllEvent = require('../controllers/Event/getAllEvent');
// const getAllPublicEvent = require('../controllers/Event/getAllPublicEvent');
// const getMyAllEvent = require('../controllers/Event/getMyAllEvent');
// const getAllCreatedEvent = require('../controllers/Event/getAllCreatedEvent');
// const getAllUploadedEvent = require('../controllers/Event/getAllUploadedEvent');
// const getEventCreatorById = require('../controllers/Event/getEventCreatorById');

// const createEvent = require('../controllers/Event/createEvent');
// const addUserToEvent = require('../controllers/Event/addUserToEvent');
// const deleteEvent = require('../controllers/Event/deleteEvent');
// const updateEvent = require('../controllers/Event/updateEvent');
// const updateViewCount = require('../controllers/Event/updateViewCount');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 檢查執行動作的 user 有沒有權限
const checkUser = async (req, res) => {
    const { event_id: eId } = req.params;
    const { id: userId } = req.currentUser;

    const eventCreator = await getEventCreatorById({ eId });
    if (eventCreator) {
        if (eventCreator !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return false;
        }
        return true;
    } else {
        res.status(403).json({ error: 'Event not found' });
        return false;
    }
};

const handleResult = (res, result) => {
    if (result.status && result.status !== 200) {
        res.status(result.status).json(result);
    } else {
        res.status(200).json(result);
    }
};

// 獲得某活動資訊
router.get('/event/:event_id', async (req, res) => {
    try {
        const result = await getEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 獲得公開 + 自己建立 + 投稿 + 驗證碼參與的活動們
router.get('/allEvent/:user_id', async (req, res) => {
    try {
        const result = await getAllEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 獲得所有公開活動
router.get('/allPublicEvent', async (req, res) => {
    try {
        const result = await getAllPublicEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 獲得使用者所有建立 + 投稿 + 用驗證碼加入的活動
router.get('/myAllEvents/:user_id', async (req, res) => {
    try {
        const result = await getMyAllEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 獲得是建立者的活動
router.get('/allCreatedEvent/:user_id', async (req, res) => {
    try {
        const result = await getAllCreatedEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 獲得所有有上傳接龍的活動
router.get('/allUploadEvent/:user_id', async (req, res) => {
    try {
        const result = await getAllUploadedEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 建立活動
router.post('/event', auth, upload.single('eventImage'), async (req, res) => {
    try {
        const result = await createEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 新增參與者到活動
router.post('/event/user', async (req, res) => {
    try {
        const result = await addUserToEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 更新活動
router.put(
    '/event/:event_id',
    auth,
    upload.single('eventImage'),
    async (req, res) => {
        try {
            const hasPermission = await checkUser(req, res);
            if (!hasPermission) {
                return;
            }
            const result = await updateEvent(req);
            handleResult(res, result);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
);

// 新增觀看
router.put('/event/viewCount/:event_id', async (req, res) => {
    try {
        const result = await updateViewCount(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// 刪除活動
router.delete('/event/:event_id', auth, async (req, res) => {
    try {
        const hasPermission = await checkUser(req, res);
        if (!hasPermission) {
            return;
        }
        const result = await deleteEvent(req);
        handleResult(res, result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;
