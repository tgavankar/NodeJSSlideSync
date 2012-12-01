var passport = require('passport');
var User = require('./models/User');
var Presentation = require('./models/Presentation');
var ensureAuthenticated = require('./middleware/ensureAuthenticated');
var _ = require('underscore');

module.exports = function (app) {
    
    app.get('/view/:id', function(req, res) {
        Presentation.findOne({shortid: req.params.id}, function(err, doc) {
            if(err) {
                res.send("error");
            }
            else if(!doc) {
                res.send("id not found");
            }
            else {
                res.render('view.ejs', {title: doc.title, presId: doc.shortid, html: doc.content.html, css: doc.content.css, jsfile: 'viewer.js'});
            }
        });
    });

    app.get('/presentraw/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.send("error");
            }
            else if(!doc) {
                res.send("id not found");
            }
            else {
                res.render('view.ejs', {title: doc.title, presId: doc.shortid, html: doc.content.html, css: doc.content.css, jsfile: 'presenter.js'});
            }
        });
    });

    app.get('/present/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.send("error");
            }
            else if(!doc) {
                res.send("Not found");
            }
            else {
                res.render('present.ejs', {title: doc.title, presId: doc.shortid, html: doc.content.html, css: doc.content.css});
            }
        });
    });

    app.get('/list', ensureAuthenticated, function(req, res) {
        var presentations = Presentation.find({_creator: req.user}, function(err, docs) {
            res.render('list.ejs', {title: 'SlideSync', preslist: docs});
        });
        
    });

    app.get('/create', ensureAuthenticated, function(req, res) {
        res.render('create.ejs', {});
    });

    app.post('/create', ensureAuthenticated, function(req, res) {
        function makePres() {
            var shortid = Math.random().toString(36).substring(2, 7); // Random 5 chars

            Presentation.findOne({shortid : shortid }, function(err, exists) {
                if (err){
                    return {'err': err};
                }
                if (exists) {
                    return makePres();
                }

                var pres = new Presentation({shortid: shortid});
                pres.title = req.body.title;
                pres.desc = req.body.desc;
                pres.createdTimestamp = new Date();
                pres.modifiedTimestamp = new Date();
                pres.type = req.body.type;
                pres._creator = req.user;
                pres.content = {html: req.body.html, css: req.body.css};
                pres.save(function(err) {
                    if(err) {
                        return {'err': err};
                    }
                    return 'created!';
                });
            });
        }

        res.send(makePres());
    });
}
