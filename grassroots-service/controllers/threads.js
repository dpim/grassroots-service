const queries = require('./../db/queries');

module.exports = {
    getHotThreads: (trimmedCoord, currentUserId, getThreadsHelper, res, getCached) => {
        const args = {
            'currentUserId': currentUserId,
            'coordStr': trimmedCoord
        };
        getCached(trimmedCoord, getThreadsHelper, args, res);
    },
    getGenericThreads: (currentUserId, res, dbRequest) => {
        dbRequest(queries.getGenericThreads, [currentUserId], res);
    },
    getThreadsForTopic: (currentUserId, topicId, res, dbRequest) => {
        dbRequest(queries.getThreadsForTopic, [currentUserId, topicId], res);
    },
    getCommentsForThread: (currentUserId, threadId, res, dbRequest) => {
        dbRequest(queries.getCommentsForThread, [currentUserId, threadId], res);
    },
    getUpvotesForThread: (threadId, res, dbRequest) => {
        dbRequest(queries.getUpvotesForThread, [threadId], res);
    },
    addCommentToThread: (timeNow, currentUserId, commentBody, reference, threadId, res, dbRequest) => {
        dbRequest(queries.addCommentToThread,
            [currentUserId, threadId, commentBody, reference, timeNow, timeNow, timeNow], res);
        updateParent(timeNow, threadId);
    },
    upvoteThread: (timeNow, currentUserId, threadId, res, dbRequest) => {
        dbRequest(queries.upvoteThread, 
            [userId, threadId, timeNow, currentUserId, threadId], res);
    },
    downvoteThread: (currentUserId, threadId, res, dbRequest) => {
        dbRequest(queries.downvoteThread, [threadId, currentUserId], res);
    },
}

function updateParent(timeNow, threadId){
    pool.query(
    queries.updateParent, 
    [timeNow, threadId],
    (err, result) => {
        return;
    });
}