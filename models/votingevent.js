const datastore = require('../db/database');

const TABLE_EVENT = 'event';
const TABLE_CHAPTER = 'chapter';
const TABLE_PAGE = 'page';

// GET
// 獲取公開可投票的事件列表
exports.getPublicVotingEvents = () => {
    return datastore
        .select('event.*', 'chapter.cId', 'chapter.chapterTitle', 'chapter.chapterIntro', 'chapter.createTime', 'chapter.submitTime',
            'chapter.voteTime', 'chapter.pageNumber', 'chapter.chapterStatus')
        .from(TABLE_EVENT)
        .leftJoin(TABLE_CHAPTER, 'event.eId', 'chapter.eId')
        .whereNull('event.eventKey');  // 假设eventKey是在TABLE_EVENT表中
}


// GET
// 獲取私人可投票的事件列表
exports.getPrivateVotingEvents = ({ e_key }) => {
    return datastore
        .select('event.*', 'chapter.cId', 'chapter.chapterTitle', 'chapter.chapterIntro', 'chapter.createTime', 'chapter.submitTime',
            'chapter.voteTime', 'chapter.pageNumber', 'chapter.chapterStatus')
        .from(TABLE_EVENT)
        .leftJoin(TABLE_CHAPTER, 'event.eId', 'chapter.eId')
        .where('event.eventKey', '=', e_key);
}

// GET
// 單一章節可投票頁面
exports.getViewVotePage = ({ eId, cId }) => {
    return datastore
        .select('event.*', 'chapter.cId', 'chapter.chapterTitle', 'chapter.chapterIntro', 'chapter.createTime', 'chapter.submitTime',
            'chapter.voteTime', 'chapter.pageNumber', 'chapter.chapterStatus', 'page.pId', 'page.uId', 'page.cId', 'page.textContent',
            'page.imageContent', 'page.voteCount', 'page.isWinner')
        .from(TABLE_EVENT)
        .leftJoin(TABLE_CHAPTER, 'event.eId', 'chapter.eId')
        .leftJoin(TABLE_PAGE, 'chapter.cId', 'page.cId')
        .where('event.eId', '=', eId)
        .where('chapter.cId', '=', cId)
        .where('chapter.chapterStatus', '=', 2);
}

exports.putVote = async ({ uId, pId }) => {
    try {
        // 检查是否已经投票
        const alreadyVoted = await datastore
            .select('*')
            .from('userVotePage')
            .where({
                'uId': uId,
                'pId': pId
            })
            .first();

        if (alreadyVoted) {
            return {
                status: 403,
                response: {
                    error: "Already voted."
                }
            };
        }

        // 获取 page 所在的 chapter
        const page = await datastore
            .select('*')
            .from('page')
            .where('pId', pId)
            .first();

        if (!page) {
            return {
                status: 404,
                response: {
                    error: "Page not found."
                }
            };
        }

        // 检查 chapter 状态是否允许投票
        const chapter = await datastore
            .select('*')
            .from('chapter')
            .where({
                'cId': page.cId
            })
            .first();

        if (chapter.chapterStatus !== 2) {
            return {
                status: 403,
                response: {
                    error: "Voting not allowed due to chapter status."
                }
            };
        }

        // 执行投票
        await datastore.transaction(async (trx) => {
            await trx('page')
                .where('pId', pId)
                .increment('voteCount', 1);

            await trx('userVotePage')
                .insert({
                    uId: uId,
                    pId: pId
                });
        });

        return {
            status: 200,
            response: {
                message: "Vote successfully registered."
            }
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            response: {
                error: "Internal server error."
            }
        };
    }
};