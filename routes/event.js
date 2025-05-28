const express = require('express');
const multer = require('multer');
const router = express.Router();
const { auth } = require('../middleware/auth');

const getEvent = require('../controllers/Event/getEvent');
const getAllEvent = require('../controllers/Event/getAllEvent');
const getAllPublicEvent = require('../controllers/Event/getAllPublicEvent');
const getMyAllEvent = require('../controllers/Event/getMyAllEvent');
const getAllCreatedEvent = require('../controllers/Event/getAllCreatedEvent');
const getAllUploadedEvent = require('../controllers/Event/getAllUploadedEvent');
const getEventCreatorById = require('../controllers/Event/getEventCreatorById');
const createEvent = require('../controllers/Event/createEvent');
const addUserToEvent = require('../controllers/Event/addUserToEvent');
const deleteEvent = require('../controllers/Event/deleteEvent');
const updateEvent = require('../controllers/Event/updateEvent');
const updateViewCount = require('../controllers/Event/updateViewCount');

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// 檢查執行動作的 user 有沒有權限
const checkUser = async (req, res, next) => {
    try {
        const { event_id: eId } = req.params;
        const { id: userId } = req.currentUser;

        const eventCreator = await getEventCreatorById({ eId });

        if (!eventCreator) {
            return next({ status: 404, message: 'Event not found' });
        }
        if (eventCreator !== userId) {
            return next({ status: 403, message: 'Forbidden' });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// 獲得某活動資訊
router.get('/event/:event_id', async (req, res, next) => {
    try {
        res.locals.result = await getEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得公開 + 自己建立 + 投稿 + 驗證碼參與的活動們
router.get('/allEvent/:user_id', async (req, res, next) => {
    try {
        res.locals.result = await getAllEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得所有公開活動
router.get('/allPublicEvent', async (req, res, next) => {
    try {
        res.locals.result = await getAllPublicEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得使用者所有建立 + 投稿 + 用驗證碼加入的活動
router.get('/myAllEvents/:user_id', async (req, res, next) => {
    try {
        res.locals.result = await getMyAllEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得是建立者的活動
router.get('/allCreatedEvent/:user_id', async (req, res, next) => {
    try {
        res.locals.result = await getAllCreatedEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 獲得所有有上傳接龍的活動
router.get('/allUploadEvent/:user_id', async (req, res, next) => {
    try {
        res.locals.result = await getAllUploadedEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 建立活動
router.post(
    '/event',
    auth,
    upload.single('eventImage'),
    async (req, res, next) => {
        try {
            res.locals.result = await createEvent(req);
            next();
        } catch (error) {
            next(error);
        }
    }
);

// 新增參與者到活動
router.post('/event/user', async (req, res, next) => {
    try {
        res.locals.result = await addUserToEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 更新活動
router.put(
    '/event/:event_id',
    auth,
    upload.single('eventImage'),
    checkUser,
    async (req, res, next) => {
        try {
            res.locals.result = await updateEvent(req);
            next();
        } catch (error) {
            next(error);
        }
    }
);

// 新增觀看
router.put('/event/viewCount/:event_id', async (req, res, next) => {
    try {
        res.locals.result = await updateViewCount(req);
        next();
    } catch (error) {
        next(error);
    }
});

// 刪除活動
router.delete('/event/:event_id', auth, checkUser, async (req, res, next) => {
    try {
        res.locals.result = await deleteEvent(req);
        next();
    } catch (error) {
        next(error);
    }
});

// router.use(handleResult);

module.exports = router;
