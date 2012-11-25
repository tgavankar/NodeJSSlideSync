// simpleExpressServer.js

var fs = require("fs");
var path = require("path");
var express = require("express");
var flash = require("connect-flash");

var passport = require('passport');
var PassportLocalStrategy = require('passport-local').Strategy;

//======================================
//      init/main
//======================================

var app = express();

app.configure(function(){
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'By90asdbAB0' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);
});

function serveStaticFile(request, response) {
    //notify the user they're logged in. Necessary because
    //  we use the same html for logging in and when they're
    //  logged in
    if (request.user !== undefined){
        response.cookie("user", request.user.sessionId);
        response.cookie("name", request.user.username);
    }
    else {
        response.cookie("user", "none");
        response.cookie("name", "none");
    }
    console.log("user:", request.user);
    response.sendfile("static/" + request.params.staticFilename);
}

app.get("/static/:staticFilename", serveStaticFile);

app.listen(8889);

process.on("uncaughtException", onUncaughtException);

//======================================
//      passport
//======================================

app.post('/login',
  passport.authenticate('local', { successRedirect: '/static/mobile.html',
                                   failureRedirect: '/static/loginFail.html',
                                   failureFlash: true }));

//registering new users would be done by adding to these data structures
var idToUser = [
    { id: 0, username: 'player1', password: 'password', email: 'bob@example.com' },
    { id: 1, username: 'player2', password: 'password', email: 'bob2@example.com' }
];

var usernameToId = {'player1': 0, 'player2': 1};
var sessToId = {};

passport.use(new PassportLocalStrategy(
    function(username, password, done) {
        var user = idToUser[usernameToId[username]];

        // Create a session ID per user auth and store it for websocket
        // payload validation.
        var sessId = Math.random().toString(36).substring(7);
        user.sessionId = sessId;
        sessToId[sessId] = user.id;

        if (user === undefined)
            return done(null, false, { message: 'Unknown user ' + username });
        if (user.password !== password)
            return done(null, false, { message: 'Invalid password' });
        return done(null, user);
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, idToUser[id]);
});


//======================================
//      handling uncaught exceptions
//======================================

function onUncaughtException(err) {
    var err = "uncaught exception: " + err;
    console.log(err);
}

//======================================
//      cmd handler
//======================================


/*****************************************************/

// Initialize the socket.io library
// Start the socket.io server on port 3000
// Remember.. this also serves the socket.io.js file!
var io = require('socket.io').listen(3000);

// Listen for client connection event
// io.sockets.* is the global, *all clients* socket
// For every client that is connected, a separate callback is called
io.sockets.on('connection', function(socket){
    // Listen for this client's "send" event
    // remember, socket.* is for this particular client
    socket.on('send', function(data) {
        // Since io.sockets.* is the *all clients* socket,
        // this is a broadcast message.
        // Broadcast a "receive" event with the data received from "send"
        // Only rebroadcast if the message is properly signed (i.e.
        // player matches their sessionID).
            io.sockets.emit('receive', data);
    });
});