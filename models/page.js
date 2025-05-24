const datastore = require('../db/database');

const PAGE_TABLE = 'page';
const InEVENT_TABLE = 'userInEvent';
const CHAPTER_TABLE = 'chapter';
const USER_TABLE = 'user';

// Get
exports.getPageCreatorById = async ({ pId }) => {
    try {
        const page = await datastore
            .from(PAGE_TABLE)
            .select('uId')
            .where('pId', pId)
            .first();
        return page ? page.uId : null;
    } catch (error) {
        throw new Error(
            'Failed to get page creator',
            error
        );
    }
};

exports.getPage = async ({ pId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            let page = await trx
                .select('*')
                .from(PAGE_TABLE)
                .where('pId', pId)
                .first();

            if (!page) {
                return {
                    status: 404,
                    error: 'Page not found'
                };
            }

            // 加入頁面建立者資料
            const creatorInfo = await trx(USER_TABLE)
                .select('*')
                .where('uId', page.uId)
                .first();

            if (!creatorInfo) {
                return {
                    status: 404,
                    error: `User with uId ${page.uId} not found`
                };
            }

            delete page.uId;

            page.user = creatorInfo;

            return page;
        } catch (err) {
            console.error(err);
            return {
                status: 500,
                error: err.message
            };
        }
    });
};

exports.getAllPageFromChapter = async ({ cId }) => {
    return await datastore.transaction(async (trx) => {
        try {
            const pages = await trx(PAGE_TABLE)
                .select('*')
                .where('cId', cId);

            if (pages.length > 0) {
                for (const page of pages) {
                    const userInfo = await trx(USER_TABLE)
                        .select('*')
                        .where('uId', page.uId)
                        .first();

                    if (!userInfo) {
                        return {
                            status: 404,
                            error: `User with uId ${page.uId} not found`
                        };
                    }

                    page.pageCreator = userInfo;
                    delete page.uId;
                }
            } else {
                return {
                    status: 404,
                    error: 'No pages found for this chapter'
                };
            }

            return pages;
        } catch (err) {
            console.error(err);
            return {
                status: 500,
                error: err.message
            };
        }
    });
};

// Create
exports.postPage = async ({
    uId,
    cId,
    textContent,
    imageContent,
    pageCreateTime
}) => {
    return await datastore.transaction(async (trx) => {
        try {
            const pageInsertResult = await trx(
                PAGE_TABLE
            ).insert({
                uId: uId,
                cId: cId,
                textContent: textContent,
                imageContent: imageContent,
                voteCount: 0,
                isWinner: false,
                pageCreateTime: pageCreateTime
            });

            // 在 chapter 中找對應的 eId
            const event = await trx(CHAPTER_TABLE)
                .select('eId')
                .where('cId', cId);

            if (event.length > 0) {
                const eId = event[0].eId;

                const exists = await trx(InEVENT_TABLE)
                    .select('*')
                    .where({
                        eId: eId,
                        uId: uId
                    });

                if (exists.length <= 0) {
                    await trx(InEVENT_TABLE).insert({
                        eId: eId,
                        uId: uId,
                        isCreator: false,
                        pageCount: 1
                    });
                } else {
                    const record = exists[0];
                    await trx(InEVENT_TABLE)
                        .where('id', record.id)
                        .update({
                            pageCount: record.pageCount + 1
                        });
                }
            }
            return { data: pageInsertResult[0] };
        } catch (error) {
            return {
                status: 400,
                response: `Transaction failed: ${error.message}`
            };
        }
    });
};

// Update
exports.updatePage = ({
    pId,
    textContent,
    imageContent,
    voteCount,
    isWinner
}) => {
    try {
        const page = datastore
            .from(PAGE_TABLE)
            .where('pId', pId)
            .update({
                textContent,
                imageContent,
                voteCount,
                isWinner
            })
            .then((result) => ({
                data: result
            }))
            .catch((err) => ({
                status: 400,
                error: err
            }));
        return page;
    } catch (error) {
        return {
            status: 400,
            response: `Transaction failed: ${error.message}`
        };
    }
};

// Delete
exports.deletePage = async ({ pId }) => {
    try {
        const result = await datastore.transaction(
            async (trx) => {
                // 獲得頁面資訊
                const pageInfo = await trx(PAGE_TABLE)
                    .select('*')
                    .where('pId', pId);

                // 獲得頁面屬於的章節資訊
                const chapterInfo = await trx(CHAPTER_TABLE)
                    .select('*')
                    .where('cId', pageInfo[0].cId);

                const eId = chapterInfo[0].eId;

                const linkedPages = await trx(
                    PAGE_TABLE
                ).where('cId', cId);

                const arrayOfLinkedPageIds =
                    linkedPages.map((page) => page.pId);

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

                // 刪除 Vote
                await trx(VOTE_TABLE)
                    .whereIn('pId', arrayOfLinkedPageIds)
                    .del();

                // 刪除頁面
                const pageDelete = await trx(PAGE_TABLE)
                    .where('pId', pId)
                    .del();

                return pageDelete;
            }
        );
        return {
            data: result
        };
    } catch (err) {
        console.error(err);
        return { status: 400, error: err };
    }
};
