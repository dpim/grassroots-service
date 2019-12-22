const queries = require('./../db/queries');

module.exports = {
    getGenericTopics: (res, pool) => {
        pool.query(
            queries.getGenericTopics,
            (err, result) => {
            if (err) {
                res.sendStatus(400);
                return;
            } else {
                res.send(result);
            }
        });
    },
    getTopics: (trimmedCoord, getTopicsHelper, res, getCached) => {
        const args = { 'coordStr': trimmedCoord };
        getCached(trimmedCoord, getTopicsHelper, args, res);
    },
    getTopicParents: (res, dbRequest) => {
        dbRequest(queries.getTopicParents, [], res);
    },
    getTopicsforParent: (parent, res, dbRequest) => {
        dbRequest(queries.getTopicsForParent, [parent], res);
    },
    insertThreadIntoTopic: (timeNow, currentUserId, threadTitle, threadBody, topicId, res, dbRequest) => {
        dbRequest(queries.insertThreadToTopic,
            [currentUserId, topicId, threadBody, threadTitle, timeNow, timeNow, timeNow], res);
    },
}
