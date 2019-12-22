const queries = require('./../db/queries');

module.exports = {
    getUpvotesForComment: (commentId, res, dbRequest) => {
        dbRequest(queries.getUpvotesForComment, [commentId], res);
    },
    upvoteComment: (timeNow, currentUserId, commentId, res, dbRequest) => {
        dbRequest(queries.upvoteComment, 
            [currentUserId, commentId, timeNow, currentUserId, commentId], res);
    },
    downvoteComment: (commentId, currentUserId, res, dbRequest) => {
        dbRequest(queries.downvoteComment, [commentId, currentUserId], res);
    }
}