const datastore = require('../db/database');

const CHAPTER_TABLE = 'chapter';
const PAGE_TABLE = 'page';
const InEVENT_TABLE = 'userInEvent';
const USER_TABLE = 'user';
const EVENT_TABLE = 'event';
const VOTE_TABLE = 'userVotePage';

// Get
exports.getChapterCreatorById = async ({ cId }) => {
    try {
        return await datastore.transaction(async (trx) => {
            const chapter = await trx
                .from(CHAPTER_TABLE)
                .select('*')
                .where('cId', cId)
                .first();

            if (!chapter) {
                return null;
            }

            const event = await trx
                .from(EVENT_TABLE)
                .select('creatorId')
                .where('eId', chapter.eId)
                .first();

            return event ? event.creatorId : null;
        });
    } catch (error) {
        throw new Error('Failed to get chapter creator', error);
    }
};

exports.getChapter = async ({ cId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const chapter = await trx(CHAPTER_TABLE)
                .select('*')
                .where('cId', cId);

            if (chapter.length === 0) {
                return {
                    status: 404,
                    error: 'Chapter not found'
                };
            }

            // 如果 chapter 已經完成，找出獲勝的page，加入回傳資料
            if (chapter[0].chapterStatus === 3) {
                let page = await trx(PAGE_TABLE).select('*').where({
                    cId: cId,
                    isWinner: true
                });

                if (page.length === 0) {
                    return {
                        status: 404,
                        error: 'Winning page not found'
                    };
                }

                page = page[0];
                chapter[0].finishedpage = page;

                // 加入建立此頁面的使用者資料
                const userInfo = await trx(USER_TABLE)
                    .select('*')
                    .where('uId', page.uId);

                if (userInfo.length === 0) {
                    return {
                        status: 404,
                        error: 'User not found'
                    };
                }
                page.pageCreator = userInfo[0];
                delete page.uId;
            }
            return chapter[0];
        } catch (error) {
            console.error(error);
            return {
                status: 400,
                error: error.message
            };
        }
    });
};

exports.getAllChapterFromEvent = async ({ eId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const chapters = await trx(CHAPTER_TABLE)
                .select('*')
                .where('eId', eId)
                .orderBy('pageNumber');

            if (chapters.length > 0) {
                for (const chapter of chapters) {
                    if (chapter.chapterStatus === 3) {
                        let page = await trx(PAGE_TABLE).select('*').where({
                            cId: chapter.cId,
                            isWinner: true
                        });

                        if (page.length === 0) {
                            return {
                                status: 404,
                                error: `Winning page not found for chapter num ${chapter.pageNumber} (cId ${chapter.cId})`
                            };
                        }

                        page = page[0];
                        chapter.finishedpage = page;

                        const userInfo = await trx(USER_TABLE)
                            .select('*')
                            .where('uId', page.uId);

                        if (userInfo.length === 0) {
                            return {
                                status: 404,
                                error: `User not found for page ${page.pId}`
                            };
                        }

                        page.pageCreator = userInfo[0];
                        delete page.uId;
                    }
                }
            }
            return chapters;
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
exports.createChapter = async ({
    eId,
    chapterTitle,
    chapterIntro,
    createTime,
    submitTime,
    voteTime,
    pageNumber,
    chapterStatus
}) => {
    let chapter = await datastore
        .insert({
            eId: eId,
            chapterTitle: chapterTitle,
            chapterIntro: chapterIntro,
            createTime: createTime,
            submitTime: submitTime,
            voteTime: voteTime,
            pageNumber: pageNumber,
            chapterStatus: chapterStatus
        })
        .into(CHAPTER_TABLE)
        .then((result) => ({
            data: result[0]
        }))
        .catch((err) => ({
            status: 400,
            error: err
        }));

    return chapter;
};

// Update
exports.updateChapter = ({
    cId,
    chapterTitle,
    chapterIntro,
    createTime,
    submitTime,
    voteTime,
    pageNumber,
    chapterStatus
}) => {
    let chapter = datastore
        .from(CHAPTER_TABLE)
        .where('cId', cId)
        .update({
            chapterTitle,
            chapterIntro,
            createTime,
            submitTime,
            voteTime,
            pageNumber,
            chapterStatus
        })
        .then((result) => ({
            data: result
        }))
        .catch((err) => ({
            status: 400,
            error: err
        }));
    return chapter;
};

// Delete
exports.deleteChapter = async ({ cId }) => {
    try {
        const result = await datastore.transaction(async (trx) => {
            // 和 cId 有關的 page
            const linkedPages = await trx(PAGE_TABLE).where('cId', cId);

            const arrayOfLinkedPageIds = linkedPages.map((page) => page.pId);

            await trx(VOTE_TABLE).whereIn('pId', arrayOfLinkedPageIds).del();

            // 刪除 page
            await trx(PAGE_TABLE).where('cId', cId).del();

            // 刪除章節
            const chapDelete = await trx(CHAPTER_TABLE).where('cId', cId).del();

            // 查找章節所屬的事件
            const event = await trx(CHAPTER_TABLE)
                .select('eId')
                .where('cId', cId)
                .first();

            if (event) {
                const eId = event.eId;

                // 更新事件參與者的頁面計數
                await trx(InEVENT_TABLE)
                    .where('eId', eId)
                    .andWhereNot('isCreator', true)
                    .decrement('pageCount', 1);

                // 刪除參與者中不是創建者且頁面計數為 0 的項目
                await trx(InEVENT_TABLE)
                    .where('eId', eId)
                    .andWhereNot('isCreator', true)
                    .andWhere('pageCount', 0)
                    .del();
            }
            return chapDelete;
        });

        return {
            data: result
        };
    } catch (error) {
        console.error(error);
        return {
            status: 400,
            response: error.message
        };
    }
};
