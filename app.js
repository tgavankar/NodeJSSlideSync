var path = require('path');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var globals = require('./middleware/globals');

function init(){
    var app = express();
    configureExpress(app);

    var User = initPassportUser();

    mongoose.connect('mongodb://localhost/SlideSync');

    require('express-helpers')(app);
    require('./rootRoutes')(app);
    require('./presRoutes')(app);
    require('./loginRoutes')(app);
    require('./redisRoutes')(app);

    var httpSrv = http.createServer(app).listen(8888, function() {
        console.log("Express server listening on port %d", 8888);
    });

    require('./socketSrv')(httpSrv);
}

init();

function configureExpress(app){
    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.cookieParser('ABN93bKhae0H3b'));
        app.use(express.session());
        app.use(express.csrf());

        app.use(passport.initialize());
        app.use(passport.session());

        // Register middleware for global template vars.
        app.use(globals);

        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        // Handle 404
        app.use(function(req, res) {
            res.render('404.ejs');
        })
    });
}

function initPassportUser(){
    var User = require('./models/User');

    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    return User;
}
