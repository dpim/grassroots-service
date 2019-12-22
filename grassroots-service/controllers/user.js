const bcrypt = require('bcrypt');
const queries = require('./../db/queries');
const saltRounds = 10;

module.exports = {
    createUser: (timeNow, username, email, password, res, pool) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                return;
            }
            pool.query(
            queries.insertUser,
            [username, email, hash, timeNow],
            (err, result) => {
                if (err) {
                    res.status(500).send("internal error");
                } else {
                    res.send(result);
                }
            });
        });
    },
    changePassword: (userId, password, res, pool) => {
        pool.query(
            queries.getUserHash,
            [userId],
            (err, result) => {
            if (err || !result) {
                res.status(500).send("internal error");
            } else {
                let resultPacket = result[0];
                 //if passwords match
                bcrypt.compare(password, resultPacket.check, function (err, res) {
                    if (err) {
                        return;
                    } else {
                        bcrypt.hash(password, saltRounds, (err, hash) => {
                            if (err){
                                res.status(500).send("internal error");
                            }
                            pool.query(
                                queries.updateHash
                                [timeNow, hash, userId],
                                (err, result) => {
                                if (err) {
                                    res.status(500).send("internal error");
                                } else {
                                    res.send(result);
                                }
                            });
                        });
                    }
                });
            }
        });
    },
    findUserById: (id, cb, pool) => {
        pool.query(
        queries.findUserById,
        [id],
        (err, result) => {
            if (err) {
                cb(null, null)
            } else {
                cb(null, result);
            }
        });
    },
    findUserByUsername: (username, password, cb, pool) => {
        pool.query(
        queries.findUserByUsername,
        [username],
        (err, result) => {
            if (err || !result) {
                cb(null, null)
            } else {
                let resultPacket = result[0]
                bcrypt.compare(password, resultPacket.hash, function (err, res) { //if passwords match
                    if (err) {
                        cb(null, null);
                    } else {
                        if (res == true) {
                            cb(null, resultPacket.id);
                        } else {
                            Clipboard(null, null)
                        }
                    }
                });
            }
        });
    },
    checkInUse: (username, email, res, pool) => {
        pool.query(
        queries.checkIfUserInUse,
        [username, email],
        (err, result) => {
            if (err) {
                res.status(404).send("user doesn't exist");
            } else {
                res.send(result);
            }
        });
    },
    getUser: (userId, res, dbRequest) => {
        dbRequest(queries.getUser, [userId], res);
    },
    getCommentsForUser: (currentUserId, userId, res, dbRequest) => {
        dbRequest(queries.getCommentsForUser, [currentUserId, userId], res);
    },
    getThreadsForUser: (currentUserId, userId, res, dbRequest) => {
        dbRequest(queries.getThreadsForUser, [currentUserId, userId], res);
    },
}