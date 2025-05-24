const {
    getPublicVotingEvents
} = require('../../models/votingevent');
//const { getPrivateVotingEvents } = require('../../models/votingevent');

module.exports = async () => {
    const event_key = await getPublicVotingEvents({});

    return event_key;
};

// module.getPrivateVotingEvents = async (req) => {
//   const { event_key: e_key } = req.params;

//   const event_key = await getPrivateVotingEvents({ e_key });

//   return event_key;
// };

// 獲取特定繪本的可投票章節詳情
// exports.getVotableChapters = (req, res) => {
//   const { eventId } = req.params;

//   const query = `
//     SELECT chapter.cId, chapter.chapterTitle, chapter.voteTime, page.pId, page.textContext, page.imageContent
//     FROM chapter
//     JOIN page ON chapter.cId = page.cId
//     WHERE chapter.eId = ? AND page.canVote = 1 AND chapter.voteTime > NOW()
//   `;

//   db.query(query, [eventId], (error, results) => {
//     if (error) return res.status(500).json({ error: error.message });
//     res.json({ chapters: results });
//   });
// };

// 檢查用戶是否已對該頁面投過票，如果沒有，則記錄投票並更新投票計數
// exports.voteForPage = (req, res) => {
//   const { userId, pageId } = req.body;

//   // 檢查用戶是否已經對此頁面投過票
//   const checkVoteQuery = `
//       SELECT * FROM userVotePage
//       WHERE uId = ? AND pId = ?
//     `;

//   db.query(checkVoteQuery, [userId, pageId], (checkVoteError, checkVoteResults) => {
//     if (checkVoteError) {
//       return res.status(500).json({ error: 'Database error while checking previous votes.' });
//     }
//     if (checkVoteResults.length > 0) {
//       return res.status(400).json({ error: 'You have already voted for this page.' });
//     }

//     // 如果沒有投過票，進行投票記錄和更新頁面投票計數
//     db.beginTransaction((err) => {
//       if (err) { return res.status(500).json({ error: 'Transaction Error' }); }

//       const insertVoteQuery = `
//           INSERT INTO userVotePage (uId, pId)
//           VALUES (?, ?)
//         `;
//       db.query(insertVoteQuery, [userId, pageId], (insertVoteError) => {
//         if (insertVoteError) {
//           return db.rollback(() => {
//             res.status(500).json({ error: 'Database error while recording your vote.' });
//           });
//         }

//         const updateVoteCountQuery = `
//             UPDATE page
//             SET voteCount = voteCount + 1
//             WHERE pId = ?
//           `;
//         db.query(updateVoteCountQuery, [pageId], (updateVoteCountError) => {
//           if (updateVoteCountError) {
//             return db.rollback(() => {
//               res.status(500).json({ error: 'Database error while updating vote count.' });
//             });
//           }
//           db.commit((commitErr) => {
//             if (commitErr) {
//               return db.rollback(() => {
//                 res.status(500).json({ error: 'Transaction Commit Error' });
//               });
//             }
//             res.json({ message: 'Vote recorded successfully!' });
//           });
//         });
//       });
//     });
//   });
// };

// exports.searchEvents = (req, res) => {
//   const { key } = req.query;  // 从查询参数中获取搜索关键字

//   if (!key) {
//     return res.status(400).json({ error: 'Search key is required' });
//   }

//   // 使用 LIKE 操作符进行模糊匹配
//   const query = `
//       SELECT * FROM event
//       WHERE eventTitle LIKE ? OR eventIntro LIKE ?
//     `;

//   // '%' + key + '%' 构造一个用于SQL LIKE查询的字符串
//   db.query(query, [`%${key}%`, `%${key}%`], (error, results) => {
//     if (error) {
//       return res.status(500).json({ error: 'Database error while searching for events.' });
//     }
//     res.json({ events: results });
//   });
// };
