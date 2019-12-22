const exConfig = require('./config').exConfig;
const express = require('express');
const app = express();
const db = require('./db-helper');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var port = process.env.PORT || 1337;
var cookie = {path: '/', httpOnly: true, secure: false, maxAge: 2*1000*365*24*60*60}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(require('express-session')(
    { 
        secret: exConfig.secret, 
        resave: true, 
        saveUninitialized: false, 
        cookie: cookie 
    }
));
app.use(require('cookie-parser')());
app.use(passport.initialize());
app.use(passport.session());

app.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        res.send({ user: req.user });
    }
);

app.get('/:version/sanity',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        if (version == 'v1') {
            db.check();
            res.sendStatus(200);
        }
    }
);

app.get('/:version/hottopics/:location?',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const coordLocation = req.params.location;
        if (version == 'v1') {
            if (coordLocation != null){
                db.getTopics(coordLocation, res);
            } else {
                db.getGenericTopics(res);
            }
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

//eg. get all topics about a specific podcast
app.get('/:version/parents',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        if (version == 'v1') {
            db.getParents(res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/parents/:parent',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const parent = req.params.parent;
        if (version == 'v1') {
            db.getTopicsForParent(parent, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

//threads for a topic
app.get('/:version/topics/:topic',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const topicId = req.params.topic;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.getThreadsForTopic(currentUserId, topicId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    })

//hot threads
app.get('/:version/hotthreads/:location?',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const coordLocation = req.params.location;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            if (coordLocation){
                db.getHotThreads(coordLocation, currentUserId, res);
            } else {
                db.getGenericThreads(currentUserId, res);
            }
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/threads/:thread',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.getCommentsForThread(currentUserId, threadId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    } 
);

app.get('/:version/users/:user',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const userId = req.params.user;
        if (version == 'v1') {
            db.getUser(userId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/users/:user/comments',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const userId = req.params.user;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.getCommentsForUser(currentUserId, userId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/users/:user/threads',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const userId = req.params.user;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.getThreadsForUser(currentUserId, userId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/comments/:comment/upvotes',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const commentId = req.params.comment;
        if (version == 'v1') {
            db.getUpvotesForComment(commentId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.get('/:version/threads/:thread/upvotes',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        if (version == 'v1') {
            db.getUpvotesForThread(commentId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/threads/:thread',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        const currentUserId = req.user[0].id;
        const reference = req.body.reference ? req.body.reference : null
        const body = req.body.text;
        if (version == 'v1') {
            db.addCommentToThread(currentUserId, body, reference, threadId, res)
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/threads/:thread/report',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        const currentUserId = req.user[0].id;
        const reference = req.body.reference ? req.body.reference : null
        const body = req.body.text;
        if (version == 'v1') {
            reportThread(currentUserId,threadId, res)
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/topics/:topic',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const topicId = req.params.topic;
        const currentUserId = req.user[0].id;
        const body = req.body.text;
        const title = req.body.title;
        //const parent = req.body.parent;
        if (version == 'v1') {
            db.insertThreadToTopic(currentUserId, title, body, topicId, res)
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/comments/:comment/upvote',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const commentId = req.params.comment;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.upvoteComment(currentUserId, commentId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/comments/:comment/report',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const commentId = req.params.comment;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            reportComment(currentUserId, commentId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/threads/:thread/upvote',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.upvoteThread(currentUserId, threadId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/comments/:comment/downvote',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const commentId = req.params.comment;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.downvoteComment(commentId, currentUserId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.post('/:version/threads/:thread/downvote',
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
        const version = req.params.version;
        const threadId = req.params.thread;
        const currentUserId = req.user[0].id;
        if (version == 'v1') {
            db.downvoteThread(currentUserId, threadId, res);
        } else {
            res.status(400).send("incorrect API version");
            return;
        }
    }
);

app.listen(port, function () {
    console.log('Server listening on port '+ port)
});

//auth
passport.use(new LocalStrategy(
    (username, password, done) => {
        db.findByUsername(username, password, done);
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (id, cb) {
    db.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

app.get('/login',
    (req, res) => {
        res.sendStatus(403);
    });

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        if (req.user) {
            res.send({userId: req.user});
        } else {
            res.sendStatus(403);
        }
    });

app.post('/create',
    (req, res) => {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        db.processUser(username, email, password, res);
    });

app.get('/logout',
    (req, res) => {
        req.logout();
        res.redirect('/');
    });

app.post('/verify',
    (req, res) => {
        let username = req.body.username;
        let email = req.body.email;
        db.checkInUse(username, email, res);
    });

//end auth