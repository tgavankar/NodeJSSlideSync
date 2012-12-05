var passport = require('passport');
var User = require('./models/User');
var validate = require('validator').check;
var sanitize = require('validator').sanitize;

module.exports = function (app) {
    
    app.get('/register', function(req, res) {
        if(req.user === undefined) {
            res.render('register.ejs');
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/login', function (req, res) {
        if (req.user === undefined){
            res.render('login.ejs');
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        req.user.lastUserAgent = req.headers['user-agent'];
        req.user.lastIp = req.ip;
        req.user.lastHost = req.host;
        req.user.lastLoginTimestamp = new Date();
        req.user.save();
        var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
        delete req.session.redirect_to;
        return res.send({'redirect_to': redirect_to});
    });

    app.post('/register', function(req, res) {
        var username = req.body.username;

        if(!validate(req.body.username).is(/^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/)) {
            return res.status(400).send('Invalid username format. Usernames can only use alphanumeric characters, start with a letter, and be between 2-20 characters long.');
        }

        if(!validate(req.body.password).is(/.{5}.+/)) {
            return res.status(400).send('Password must be at least 6 characters long.');
        }

        if(req.body.password !== req.body.passwordConf) {
            return res.status(400).send('Passwords did not match.');   
        }
        
        User.findOne({username : username }, function(err, existingUser) {
            if(err) {
                return res.status(400).send(err);
            }
            if(existingUser) {
                return res.status(400).send('This username already exists.');
            }
            var user = new User({ username : req.body.username });
            user.registeredTimestamp = new Date();
            user.setPassword(req.body.password, function(err) {
                if(err) {
                    return res.status(400).send(err);
                }

                user.save(function(err) {
                    if(err) {
                        return res.status(400).send(err);
                    }
                    return res.send('User created successfully!');
                });
            });  
        });
    });
}
