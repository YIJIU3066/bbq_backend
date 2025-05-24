const datastore = require('../db/database');

const EVENT_TABLE = 'event';
const InEVENT_TABLE = 'userInEvent';
const USER_TABLE = 'user';
const CHAPTER_TABLE = 'chapter';
const PAGE_TABLE = 'page';
const VOTE_TABLE = 'userVotePage';
// Get
exports.getEventCreatorById = async ({ eId }) => {
    try {
        const event = await datastore
            .from(EVENT_TABLE)
            .select('creatorId')
            .where('eId', eId)
            .first();
        return event ? event.creatorId : null;
    } catch (error) {
        throw new Error(
            'Failed to get event creator',
            error
        );
    }
};

exports.getEvent = async ({ eId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const event = await trx(EVENT_TABLE)
                .select('*')
                .where('eId', eId)
                .first();

            if (!event) {
                return {
                    status: 404,
                    error: `Event with id ${eId} not found`
                };
            }

            // 加入創建者資料
            const creatorInfo = await trx(USER_TABLE)
                .select('*')
                .where('uId', event.creatorId);

            if (!creatorInfo) {
                return {
                    status: 404,
                    error: `Creator with id ${event.creatorId} not found`
                };
            }

            delete event.creatorId;
            event.creator = creatorInfo[0];

            // 加入參與者資料
            event.users = [];
            const users = await trx(InEVENT_TABLE)
                .select('*')
                .where('eId', eId)
                .andWhere('isCreator', false);

            if (users.length > 0) {
                const userIds = users.map(
                    (user) => user.uId
                );

                const userInfoList = await trx(USER_TABLE)
                    .select('*')
                    .whereIn('uId', userIds);

                event.users = userInfoList;
            }

            return event;
        } catch (error) {
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 取得該使用者所有活動，包含公開活動 + 自己建立 + 投稿 + 驗證碼參與的活動
exports.getAllEvent = async ({ userId, eventStatus }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const lastChapter = trx(CHAPTER_TABLE)
                .select(
                    'eId',
                    trx.raw(
                        'MAX(pageNumber) as maxPageNumber'
                    )
                )
                .groupBy('eId')
                .as('lc');

            let events;
            if (eventStatus !== undefined) {
                // 有設定 eventStatus
                events = await trx
                    .select(`${EVENT_TABLE}.*`)
                    .from(EVENT_TABLE)
                    .join(
                        InEVENT_TABLE,
                        `${InEVENT_TABLE}.eId`,
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .join(
                        lastChapter,
                        'lc.eId',
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .join(CHAPTER_TABLE, function () {
                        this.on(
                            'lc.eId',
                            '=',
                            `${CHAPTER_TABLE}.eId`
                        ).andOn(
                            'lc.maxPageNumber',
                            '=',
                            `${CHAPTER_TABLE}.pageNumber`
                        );
                    })
                    .where({
                        [`${InEVENT_TABLE}.uId`]: userId,
                        [`${CHAPTER_TABLE}.chapterStatus`]:
                            eventStatus
                    })
                    // 公開活動
                    .union(
                        trx
                            .select('*')
                            .from(EVENT_TABLE)
                            .whereNull('eventKey')
                            .andWhere(function () {
                                this.whereIn(
                                    'eId',
                                    trx(CHAPTER_TABLE)
                                        .select('eId')
                                        .where(
                                            'chapterStatus',
                                            eventStatus
                                        )
                                        .groupBy('eId')
                                );
                            })
                    );
            } else {
                // 沒有設定 eventStatus
                events = await trx
                    .select(`${EVENT_TABLE}.*`)
                    .from(EVENT_TABLE)
                    .join(
                        InEVENT_TABLE,
                        `${InEVENT_TABLE}.eId`,
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .where(`${InEVENT_TABLE}.uId`, userId)
                    .union(
                        trx
                            .select('*')
                            .from(EVENT_TABLE)
                            .whereNull('eventKey')
                    );
            }

            if (events.length > 0) {
                // 加上使用者資料
                for (const event of events) {
                    const creatorInfo = await trx(
                        USER_TABLE
                    )
                        .select('*')
                        .where('uId', event.creatorId)
                        .first();
                    if (!creatorInfo) {
                        return {
                            status: 404,
                            error: `Creator with id ${event.creatorId} not found`
                        };
                    }

                    // 獲取最後一章的時間
                    const lastChapterInfo = await trx(
                        CHAPTER_TABLE
                    )
                        .select(
                            'createTime',
                            'submitTime',
                            'voteTime'
                        )
                        .where('eId', event.eId)
                        .andWhere(
                            'pageNumber',
                            function () {
                                this.select('maxPageNumber')
                                    .from(lastChapter)
                                    .where(
                                        'eId',
                                        event.eId
                                    );
                            }
                        )
                        .first();

                    delete event.creatorId;
                    event.creator = creatorInfo;
                    event.time = lastChapterInfo;
                }
            }

            return events;
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 取得所有公開活動
exports.getAllPublicEvent = async ({ eventStatus }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const lastChapter = trx(CHAPTER_TABLE)
                .select(
                    'eId',
                    trx.raw(
                        'MAX(pageNumber) as maxPageNumber'
                    )
                )
                .groupBy('eId')
                .as('lc');

            let events;
            if (eventStatus !== undefined) {
                // 有設定 eventStatus
                events = await trx
                    .select('*')
                    .from(EVENT_TABLE)
                    .whereNull('eventKey')
                    .andWhere(function () {
                        this.whereIn(
                            'eId',
                            trx(CHAPTER_TABLE)
                                .select('eId')
                                .where(
                                    'chapterStatus',
                                    eventStatus
                                )
                                .groupBy('eId')
                        );
                    });
            } else {
                console.log('here');
                // 沒有設定 eventStatus
                events = await trx
                    .select('*')
                    .from(EVENT_TABLE)
                    .whereNull('eventKey');
                console.log(events);
            }

            if (events.length > 0) {
                // 加上使用者資料
                for (const event of events) {
                    const creatorInfo = await trx(
                        USER_TABLE
                    )
                        .select('*')
                        .where('uId', event.creatorId)
                        .first();
                    if (!creatorInfo) {
                        return {
                            status: 404,
                            error: `Creator with id ${event.creatorId} not found`
                        };
                    }

                    // 獲取最後一章的時間
                    const lastChapterInfo = await trx(
                        CHAPTER_TABLE
                    )
                        .select(
                            'createTime',
                            'submitTime',
                            'voteTime'
                        )
                        .where('eId', event.eId)
                        .andWhere(
                            'pageNumber',
                            function () {
                                this.select('maxPageNumber')
                                    .from(lastChapter)
                                    .where(
                                        'eId',
                                        event.eId
                                    );
                            }
                        )
                        .first();

                    delete event.creatorId;
                    event.creator = creatorInfo;
                    event.time = lastChapterInfo;
                }
            }

            return events;
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 回傳使用者建立 + 投稿 + 驗證碼加入的活動
exports.getMyAllEvent = async ({ userId, eventStatus }) => {
    return await datastore.transaction(async (trx) => {
        try {
            // 最後一章
            const lastChapter = trx(CHAPTER_TABLE)
                .select(
                    'eId',
                    trx.raw(
                        'MAX(pageNumber) as maxPageNumber'
                    )
                )
                .groupBy('eId')
                .as('lc');

            let events;
            if (eventStatus !== undefined) {
                // 有設定 eventStatus
                events = await trx
                    .select(`${EVENT_TABLE}.*`)
                    .from(EVENT_TABLE)
                    .join(
                        InEVENT_TABLE,
                        `${InEVENT_TABLE}.eId`,
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .join(
                        lastChapter,
                        'lc.eId',
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .join(CHAPTER_TABLE, function () {
                        this.on(
                            'lc.eId',
                            '=',
                            `${CHAPTER_TABLE}.eId`
                        ).andOn(
                            'lc.maxPageNumber',
                            '=',
                            `${CHAPTER_TABLE}.pageNumber`
                        );
                    })
                    .where({
                        [`${InEVENT_TABLE}.uId`]: userId,
                        [`${CHAPTER_TABLE}.chapterStatus`]:
                            eventStatus
                    });
            } else {
                // 沒有設定 event status
                events = await trx
                    .select(`${EVENT_TABLE}.*`)
                    .from(EVENT_TABLE)
                    .join(
                        InEVENT_TABLE,
                        `${InEVENT_TABLE}.eId`,
                        '=',
                        `${EVENT_TABLE}.eId`
                    )
                    .where(`${InEVENT_TABLE}.uId`, userId);
            }

            if (events.length > 0) {
                // 加上使用者資料
                for (const event of events) {
                    const creatorInfo = await trx(
                        USER_TABLE
                    )
                        .select('*')
                        .where('uId', event.creatorId)
                        .first();
                    if (!creatorInfo) {
                        return {
                            status: 404,
                            error: `Creator with id ${event.creatorId} not found`
                        };
                    }

                    // 獲取最後一章的時間
                    const lastChapterInfo = await trx(
                        CHAPTER_TABLE
                    )
                        .select(
                            'createTime',
                            'submitTime',
                            'voteTime'
                        )
                        .where('eId', event.eId)
                        .andWhere(
                            'pageNumber',
                            function () {
                                this.select('maxPageNumber')
                                    .from(lastChapter)
                                    .where(
                                        'eId',
                                        event.eId
                                    );
                            }
                        )
                        .first();

                    delete event.creatorId;
                    event.creator = creatorInfo;
                    event.time = lastChapterInfo;
                }
            }
            return events;
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 取得使用者建立的所有活動
exports.getAllCreatedEvent = async ({ userId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const lastChapter = trx(CHAPTER_TABLE)
                .select(
                    'eId',
                    trx.raw(
                        'MAX(pageNumber) as maxPageNumber'
                    )
                )
                .groupBy('eId')
                .as('lc');

            const events = await trx
                .select(`${EVENT_TABLE}.*`)
                .from(EVENT_TABLE)
                .join(
                    InEVENT_TABLE,
                    `${InEVENT_TABLE}.eId`,
                    '=',
                    `${EVENT_TABLE}.eId`
                )
                .where(`${InEVENT_TABLE}.uId`, userId)
                .andWhere(
                    `${InEVENT_TABLE}.isCreator`,
                    true
                );

            if (events.length > 0) {
                // 加上使用者資料
                for (const event of events) {
                    const creatorInfo = await trx(
                        USER_TABLE
                    )
                        .select('*')
                        .where('uId', event.creatorId)
                        .first();
                    if (!creatorInfo) {
                        return {
                            status: 404,
                            error: `Creator with id ${event.creatorId} not found`
                        };
                    }

                    // 獲取最後一章的時間
                    const lastChapterInfo = await trx(
                        CHAPTER_TABLE
                    )
                        .select(
                            'createTime',
                            'submitTime',
                            'voteTime'
                        )
                        .where('eId', event.eId)
                        .andWhere(
                            'pageNumber',
                            function () {
                                this.select('maxPageNumber')
                                    .from(lastChapter)
                                    .where(
                                        'eId',
                                        event.eId
                                    );
                            }
                        )
                        .first();

                    delete event.creatorId;
                    event.creator = creatorInfo;
                    event.time = lastChapterInfo;
                }
            }
            return events;
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 取得使用者投稿過的活動
exports.getAllUploadedEvent = async ({ userId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const lastChapter = trx(CHAPTER_TABLE)
                .select(
                    'eId',
                    trx.raw(
                        'MAX(pageNumber) as maxPageNumber'
                    )
                )
                .groupBy('eId')
                .as('lc');
            const events = await trx
                .select(
                    `${EVENT_TABLE}.*`,
                    `${InEVENT_TABLE}.pageCount`
                )
                .from(EVENT_TABLE)
                .join(
                    InEVENT_TABLE,
                    `${InEVENT_TABLE}.eId`,
                    '=',
                    `${EVENT_TABLE}.eId`
                )
                .where(`${InEVENT_TABLE}.uId`, userId)
                .andWhere(
                    `${InEVENT_TABLE}.pageCount`,
                    '>',
                    '0'
                );

            if (events.length > 0) {
                // 加上使用者資料
                for (const event of events) {
                    const creatorInfo = await trx(
                        USER_TABLE
                    )
                        .select('*')
                        .where('uId', event.creatorId)
                        .first();
                    if (!creatorInfo) {
                        return {
                            status: 404,
                            error: `Creator with id ${event.creatorId} not found`
                        };
                    }

                    // 獲取最後一章的時間
                    const lastChapterInfo = await trx(
                        CHAPTER_TABLE
                    )
                        .select(
                            'createTime',
                            'submitTime',
                            'voteTime'
                        )
                        .where('eId', event.eId)
                        .andWhere(
                            'pageNumber',
                            function () {
                                this.select('maxPageNumber')
                                    .from(lastChapter)
                                    .where(
                                        'eId',
                                        event.eId
                                    );
                            }
                        )
                        .first();

                    delete event.creatorId;
                    event.creator = creatorInfo;
                    event.time = lastChapterInfo;
                }
            }
            return events;
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// Create
// Create Event and Chapter One
exports.createEvent = async ({
    creatorId,
    eventTitle,
    eventIntro,
    eventKey,
    chapterTitle,
    chapterIntro,
    createTime,
    submitTime,
    voteTime,
    eventImage
}) => {
    return await datastore.transaction(async (trx) => {
        try {
            // 插入 event table
            let event = await trx(EVENT_TABLE).insert({
                creatorId: creatorId,
                eventTitle: eventTitle,
                eventIntro: eventIntro,
                eventKey: eventKey,
                totalChapterNum: 1,
                isPublish: false,
                viewCount: 0,
                eventImage: eventImage
            });

            // 插入 userInEvent table
            await trx(InEVENT_TABLE).insert({
                eId: event[0],
                uId: creatorId,
                isCreator: true,
                pageCount: 0
            });

            // 建立第一章節
            let chapter = await trx(CHAPTER_TABLE).insert({
                eId: event[0],
                chapterTitle: chapterTitle,
                chapterIntro: chapterIntro,
                createTime: createTime,
                submitTime: submitTime,
                voteTime: voteTime,
                pageNumber: 1,
                chapterStatus: 1
            });

            return {
                eventData: event[0],
                chapterData: chapter[0]
            };
        } catch (error) {
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// 新增活動參與者
exports.addUserToEvent = async ({ eventKey, uId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            let event = await trx(EVENT_TABLE)
                .where('eventKey', eventKey)
                .first();
            if (!event) {
                return {
                    status: 400,
                    error: `Can not find event with code ${eventKey}`
                };
            }
            let exist = await trx(InEVENT_TABLE)
                .where({
                    eId: event.eId,
                    uId: uId
                })
                .first();

            if (exist) {
                return {
                    data: event.eId,
                    msg: `User id ${uId} already in event id ${event.eId}`
                };
            } else {
                let result = await trx(
                    InEVENT_TABLE
                ).insert({
                    eId: event.eId,
                    uId: uId,
                    isCreator: false,
                    pageCount: 0
                });
                return { data: event.eId };
            }
        } catch (error) {
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

// Update
exports.updateEvent = ({
    eId,
    eventTitle,
    eventIntro,
    eventKey,
    totalChapterNum,
    isPublish,
    viewCount,
    eventImage
}) => {
    let event = datastore
        .from(EVENT_TABLE)
        .where('eId', eId)
        .update({
            eventTitle,
            eventIntro,
            eventKey,
            totalChapterNum,
            isPublish,
            viewCount,
            eventImage
        })
        .then((result) => ({
            data: result
        }))
        .catch((err) => ({
            error: err
        }));
    return event;
};

// 更新活動觀看數
exports.updateViewCount = async ({ eId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            let event = await trx(EVENT_TABLE)
                .where('eId', eId)
                .first();

            if (!event) {
                throw new Error('Event not found');
            }
            if (event.isPublish === 0) {
                throw new Error('Event is not published');
            }

            const result = await trx(EVENT_TABLE)
                .where('eId', eId)
                .andWhere('isPublish', 1)
                .update({
                    viewCount: event.viewCount + 1
                });

            return { data: result };
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                response: error.message
            };
        }
    });
};

// Delete
exports.deleteEvent = async ({ eId }) => {
    try {
        const result = await datastore.transaction(
            async (trx) => {
                // 獲得對應 chapter 中的資料
                const chapters = await trx(
                    CHAPTER_TABLE
                ).where('eId', eId);

                // 刪除 page 中對應的資料
                for (const chapter of chapters) {
                    await trx(PAGE_TABLE)
                        .where('cId', chapter.cId)
                        .del();
                }

                // 刪除 userInEvent 中對應的資料
                await trx(InEVENT_TABLE)
                    .where('eId', eId)
                    .del();

                // 刪除 userVotePage 的資料
                await trx(VOTE_TABLE)
                    .where('eId', eId)
                    .del();

                // 刪除 chapter 中對應的資料
                await trx(CHAPTER_TABLE)
                    .where('eId', eId)
                    .del();

                // 刪除 EVENT_TABLE 中的資料
                const resultEvent = await trx(EVENT_TABLE)
                    .where('eId', eId)
                    .del();

                return resultEvent;
            }
        );

        return {
            data: result
        };
    } catch (error) {
        console.error(error);
        return {
            status: 400,
            error: error.message
        };
    }
};
