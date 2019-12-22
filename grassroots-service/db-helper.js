const mysql = require('mysql');
const config = require('./config').dbConfig;
const redisUtil = require('./utils/redis').fetchCachedInfo;
const redis = require("redis");
const rdConfig = require('./config').rdConfig;

const queries = require('./db/queries');
const userController = require('./controllers/user');
const topicController = require('./controllers/topics');
const threadController = require('./controllers/threads');
const commentController = require('./controllers/comments');

const redisClient = redis.createClient(6380, 
    rdConfig.name + '.redis.cache.windows.net', 
    { 
        auth_pass: rdConfig.pass, 
        tls: { servername: rdConfig.name + '.redis.cache.windows.net' } 
    }
);
const fetchCachedInfo = redisUtil(redisClient);

const pool = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: config.waitForConnections,
    charset: config.charset
});

module.exports = {
    processUser: (username, email, password, res) => {
        const timeNow = getDateTimeNow();
        userController.createUser(timeNow, username, email, password, res, pool);
    },
    changePassword: (userId, password, res) => {
        const timeNow = getDateTimeNow();
        userController.changePassword(timeNow, userId, password, res, pool);
    },
    findById: (id, cb) => {
       userController.findUserById(id, cb, pool);
    },
    findByUsername: (username, password, cb) => {
        userController.findUserByUsername(username, password, cb, pool);
    },
    checkInUse: (username, email, res) => {
        userController.checkInUse(username, email, res, pool);
    },
    getGenericTopics: (res) => {
       topicController.getGenericTopics(res, pool);
    },
    getTopics: (coordLocation, res) => {
        const trimmedCoord = trim(coordLocation);
        topicController.getTopics(trimmedCoord, getTopicsHelper, res, fetchCachedInfo);
    },
    getParents: (res) => {
        topicController.getTopicParents(res, dbRequest);
    },
    getTopicsForParent: (parent, res) => {
        topicController.getTopicsforParent(parent, res, dbRequest);
    },
    getHotThreads: (coordLocation, currentUserId, res) => {
        const trimmedCoord = trim(coordLocation);
        threadController.getHotThreads(trimmedCoord, currentUserId, getThreadsHelper, res, fetchCachedInfo);
    },
    getGenericThreads: (currentUserId, res) => {
        threadController.getGenericThreads(currentUserId, res, dbRequest);
    },
    getThreadsForTopic: (currentUserId, topicId, res) => {
        threadController.getThreadsForTopic(currentUserId, topicId, res, dbRequest);
    },
    getCommentsForThread: (currentUserId, threadId, res) => {
        threadController.getCommentsForThread(currentUserId, threadId, res, dbRequest);
    },
    getUser: (userId, res) => {
        userController.getUser(userId, res, dbRequest);
    },
    getCommentsForUser: (currentUserId, userId, res) => {
        userController.getCommentsForUser(currentUserId, userId, res, dbRequest);
    },
    getThreadsForUser: (currentUserId, userId, res) => {
        userController.getThreadsForUser(currentUserId, userId, res, dbRequest);
    },
    getUpvotesForComment: (commentId, res) => {
        commentController.getUpvotesForComment(commentId, res, dbRequest);
    },
    getUpvotesForThread: (threadId, res) => {
        threadController.getUpvotesForThread(threadId, res, dbRequest);
    },
    addCommentToThread: (currentUserId, commentBody, reference, threadId, res) => {
        const timeNow = getDateTimeNow();
        threadController.addCommentToThread(timeNow, currentUserId, commentBody, reference, threadId, res, dbRequest);
    },
    insertThreadToTopic: (currentUserId, threadTitle, threadBody, topicId, res) => {
        const timeNow = getDateTimeNow();
        topicController.insertThreadIntoTopic(timeNow, currentUserId, threadTitle, threadBody, topicId, res, dbRequest);
    },
    upvoteComment: (currentUserId, commentId, res) => {
        const timeNow = getDateTimeNow();
        commentController.upvoteComment(timeNow, currentUserId, commentId, res, dbRequest);
    },
    downvoteComment: (commentId, currentUserId, res) => {
        commentController.downvoteComment(commentId, currentUserId, res, dbRequest);
    },
    upvoteThread: (currentUserId, threadId, res) => { 
        const timeNow = getDateTimeNow();
        threadController.upvoteThread(timeNow, currentUserId, threadId, res, dbRequest);
    },
    downvoteThread: (currentUserId, threadId, res) => {
        threadController.downvoteThread(currentUserId, threadId, res, dbRequest);
    },
};

function getDateTimeNow() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function trim(addressStr) {
    const trim = 3;
    const parts = addressStr.split(",");
    const updatedParts = parts.map((x) => {
        const decimal = x.indexOf(".");
        return x.substring(0, Math.min(decimal + trim, x.length));
    });
    return updatedParts.reduce((a, b) => a + "," + b);
}

function dbRequest(query, params, res) {
    pool.query(
    query,
    params,
    (err, result) => {
        if (err) {
            res.status(500).send("internal error");
        } else {
            res.send(result)
        }
    });
}

function getTopicsHelper(info, res) {
    const numberOfDefaultTopics = 2;
    const district = info.location.district ? info.location.district : info.coordStr;
    const trimmedCoord = info.coordStr;
    pool.query(
    queries.getTopicsHelper, [district],
    (err, result) => {
        if (err) {
            res.sendStatus(400);
        } else {
            if (result.length < numberOfDefaultTopics) {
                addTopics(trimmedCoord, res);
            } else {
                res.send(result);
            }
        }
    });
}

function getThreadsHelper(info, res) {
    var district = info.location.district ? info.location.district : info.coordStr;
    var currentUserId = info.currentUserId;
    dbRequest(queries.getThreadsHelper, [currentUserId, district], res);
}

function addTopics(trimmedCoord, res) {
    fetchCachedInfo(trimmedCoord, insertTopics, { 'coordStr': trimmedLocation }, res);
}

function insertTopics(args, res) {
    if (args.location != null) {
        let trimmedCoord = args.coordStr;
        let districtStr = args.location.district ? args.location.district : "Local politics";
        let timeNow = getDateTimeNow();
        let districtStr = "📍 " + districtStr;
        let district = args.location.district ? args.location.district : null;
        let values = [
            [districtStr, 'Talk about local politics with the people around you.', trimmedCoord, timeNow, time_now, district],
            ['📍 US Politics', 'Discuss US politics, domestic policy, congress with the people in your district. 🇺🇸', trimmedCoord, time_now, time_now, district],
            ['📍 World Affairs', 'What\'s happening in the world? Talk about global politics and current events with people around you. ️', trimmedCoord, time_now, time_now, district]
        ];
        let valuesToSend = [values]; 
        if (args.location.district) {
            let currentDistrict = ""+args.location.district
            pool.query(
                queries.insertTopics,
                [currentDistrict],
                (err, result) => {
                    if (err) {
                        res.sendStatus(400);
                    } else {
                        //to prevent duplication 
                        if (result.length == 0) {
                            naiveInsertion(trimmedCoord, valuesToSend, res);
                        } else {
                            fetchTopics(trimmedCoord, res);
                        }
                    }
                });
        } else {
            naiveInsertion(trimmedCoord, valuesToSend, res);
        }
    }
}

function naiveInsertion(trimmedCoord, values, res) {
    pool.query(
    queries.naiveInsertion,
    values,
    (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            fetchTopics(trimmedCoord, res);
        }
    });
}

function fetchTopics(trimmedCoord, res) {
    pool.query(
    queries.fetchTopics,
    [trimmedCoord],
    function (err, result) {
        if (err) {
            res.sendStatus(400);
        } else {
            res.send(result);
        }
    });
}