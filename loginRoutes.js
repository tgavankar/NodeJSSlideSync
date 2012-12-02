var passport = require('passport');
var User = require('./models/User');

module.exports = function (app) {
    
    app.get('/register', function(req, res) {
        if(req.user === undefined) {
            res.render('register.ejs', {user: req.user});
        }
        else {
            res.redirect('/');
        }
    });

    app.get('/login', function (req, res) {
        if (req.user === undefined){
            res.render('login.ejs', {user: req.user});
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
        
        User.findOne({username : username }, function(err, existingUser) {
            if (err){
                return res.send({'err': err});
            }
            if (existingUser) {
                return res.send('user exists');
            }

            var user = new User({ username : req.body.username });
            user.registeredTimestamp = new Date();
            user.setPassword(req.body.password, function(err) {
                if (err) {
                    return res.send({'err': err});
                }

                user.save(function(err) {
                    if (err) {
                        return res.send({'err': err});
                    }
                    return res.send('success');
                });
            });  
        });
    });
}
