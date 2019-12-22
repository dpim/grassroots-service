module.exports = {
    insertUser: 'INSERT IGNORE INTO users (displayname, email, hash, datecreated)  \
            VALUES (?, ?, ?, ?)',
    getUserHash: 'SELECT hash FROM users WHERE id = ?',
    updateHash: 'UPDATE users SET dateupdated=?, hash=? WHERE id=?',
    findUserById: 'SELECT displayname, id FROM users WHERE id = ?',
    findUserByUsername: 'SELECT id, hash FROM users WHERE displayname = ?',
    checkIfUserInUse: 'SELECT displayname FROM users WHERE displayname = ? OR email = ?',
    getGenericTopics: 'SELECT * FROM topics WHERE district IS NULL ORDER BY id ASC LIMIT 100',
    getTopicParents: 'SELECT parent, count(parent) FROM topics GROUP BY parent DESC LIMIT 100',
    getTopicsForParent: 'SELECT * FROM topics WHERE parent = ? \
            ORDER BY dateupdated DESC LIMIT 100',
    getGenericThreads: 
            'SELECT u.displayname, th.*, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id AND \
                tu.userid = ?) AS didUpvote, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id) AS countUpvotes, \
            (SELECT COUNT(*) from comments cm WHERE cm.parentid = th.id) AS countComments \
            FROM threads th \
                LEFT JOIN users u ON th.userid = u.id \
                LEFT JOIN topics tp ON th.parentid = tp.id \
            WHERE tp.coordBucket IS NULL \
            ORDER BY th.dateupdated DESC LIMIT 100',
    getThreadsForTopic: 
            'SELECT u.displayname, th.*, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id AND \
                tu.userid = ?) AS didUpvote, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id) AS countUpvotes, \
            (SELECT COUNT(*) from comments cm WHERE cm.parentid = th.id) AS countComments \
            FROM threads th LEFT JOIN users u on th.userid = u.id \
            WHERE th.parentid = ? \
            ORDER BY th.dateupdated DESC LIMIT 100',
    getCommentsForThread: 
            'SELECT u.displayname, cm.*, \
            (SELECT COUNT(*) from comment_upvotes cu WHERE cu.parentid = cm.id AND \
                cu.userid =  ?) AS didUpvote, \
            (SELECT COUNT(*) from comment_upvotes cu WHERE cu.parentid = cm.id) AS countUpvotes \
            FROM comments cm INNER JOIN users u on cm.userid = u.id \
            WHERE cm.parentid = ? \
            ORDER BY cm.dateupdated DESC LIMIT 100',
    getUserById: 'SELECT displayname FROM users WHERE id = ?',
    getCommentsForUser: 
            'SELECT u.displayname, cm.*, \
            (SELECT COUNT(*) from comment_upvotes cu WHERE cu.parentid = cm.id AND \
                cu.userid = ?) AS didUpvote, \
            (SELECT COUNT(*) from comment_upvotes cu WHERE cu.parentid = cm.id) AS countUpvotes \
            FROM comments cm LEFT JOIN users u on cm.userid = u.id \
            WHERE cm.userid = ? \
            ORDER BY cm.dateupdated DESC',
    getThreadsForUser: 
            'SELECT u.displayname, th.*, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id AND \
                tu.userid = ? AS didUpvote, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id) AS countUpvotes \
            FROM threads th LEFT JOIN users u on th.userid = u.id \
            WHERE th.userid = ? \
            ORDER BY th.dateupdated DESC LIMIT 100',
    getUpvotesForComment: 'SELECT * from comment_upvotes cu WHERE cu.parentid = ? \
             ORDER BY cu.dateupdated DESC',
    getUpvotesForThread: 'SELECT * from thread_upvotes tu WHERE tu.parentid = ? \
            ORDER BY tu.dateupdated DESC',
    addCommentToThread: 'INSERT INTO comments \
            (userid, parentid, body, inresponseto, datecreated, dateupdated)  \
            VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE dateupdated = ?',
    insertThreadToTopic: 'INSERT INTO threads \
            (userid, parentid, body, title, datecreated, dateupdated)  \
            VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE dateupdated= ?;',
    upvoteComment: 'INSERT INTO comment_upvotes (userid, parentid, datecreated)  \
            SELECT * FROM (SELECT ?, ?, ?) AS tmp \
            WHERE NOT EXISTS (SELECT * from comment_upvotes WHERE userid = ? AND parentid = ?)',
    downvoteComment: 'DELETE FROM comment_upvotes WHERE parentid = ? AND userid = ?',
    upvoteThread: 'INSERT INTO thread_upvotes (userid, parentid, datecreated)  \
            SELECT * FROM (SELECT ?, ?, ?) AS tmp \
            WHERE NOT EXISTS ( SELECT * from thread_upvotes WHERE userid = ? AND parentid = ?)',
    downvoteThread: 'DELETE FROM thread_upvotes WHERE parentid = ? AND userid = ?',
    updateThreadParent: 'UPDATE threads SET dateupdated = ? WHERE id = ?',
    getTopicsHelper: 'SELECT * FROM topics WHERE district = ? OR district IS NULL ORDER BY id ASC LIMIT 4',
    getThreadshelper: 'SELECT u.displayname, th.*, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id AND \
                tu.userid = ?) AS didUpvote, \
            (SELECT COUNT(*) from thread_upvotes tu WHERE tu.parentid = th.id) AS countUpvotes, \
            (SELECT COUNT(*) from comments cm WHERE cm.parentid = th.id) AS countComments \
            FROM threads th \
                LEFT JOIN users u ON th.userid = u.id \
                LEFT JOIN topics tp ON th.parentid = tp.id \
            WHERE district = ? OR district IS NULL \
            ORDER BY th.dateupdated DESC LIMIT 100',
    naiveTopicInsertion: 'INSERT INTO topics \
            (displayname, body, coordBucket, datecreated, dateupdated, district) \
            VALUES ?',
    getTopics: 'SELECT * FROM topics WHERE coordBucket = ? \
            OR coordBucket IS NULL ORDER BY id ASC LIMIT 100;'
}