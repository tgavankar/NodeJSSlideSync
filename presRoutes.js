var path = require('path');
var fs = require('fs');
var util = require('util');
var passport = require('passport');
var User = require('./models/User');
var Presentation = require('./models/Presentation');
var ensureAuthenticated = require('./middleware/ensureAuthenticated');
var _ = require('underscore');
var csrf = require('./middleware/csrf');

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
                if(doc.type === "dzslides") {
                    res.render('view.ejs', {user: req.user, 
                                            title: doc.title, 
                                            presId: doc.shortid, 
                                            html: doc.content.html, 
                                            css: doc.content.css, 
                                            presType: doc.type, 
                                            jsfile: 'viewer.js'});
                }
                else if(doc.type === "pdf") {
                    res.render('view.ejs', {user: req.user, 
                                            title: doc.title, 
                                            presId: doc.shortid, 
                                            presType: doc.type, 
                                            jsfile: 'viewer.js'});   
                }
            }
        });
    });

    app.get('/praw/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.send("error");
            }
            else if(!doc) {
                res.send("id not found");
            }
            else {
                if(doc.type === "dzslides") {
                    res.render('view.ejs', {user: req.user, 
                                            title: doc.title, 
                                            presId: doc.shortid, 
                                            html: doc.content.html, 
                                            css: doc.content.css, 
                                            presType: doc.type, 
                                            jsfile: 'presenter.js'});    
                }
                else if(doc.type === "pdf") {
                    res.render('view.ejs', {user: req.user, 
                                            title: doc.title, 
                                            presId: doc.shortid, 
                                            presType: doc.type, 
                                            jsfile: 'presenter.js'});
                }
                
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
                if(doc.type === "dzslides") {
                    res.render('present.ejs', {user: req.user, title: doc.title, presId: doc.shortid, html: doc.content.html, css: doc.content.css});
                }
                else if(doc.type === "pdf") {
                    res.render('present.ejs', {user: req.user, title: doc.title, presId: doc.shortid, presType: doc.type})
                }
            }
        });
    });

    app.get('/list', ensureAuthenticated, function(req, res) {
        var presentations = Presentation.find({_creator: req.user}, function(err, docs) {
            res.render('list.ejs', {user: req.user, preslist: docs});
        });
        
    });

    app.get('/create', ensureAuthenticated, csrf, function(req, res) {
        res.render('create.ejs', {user: req.user});
    });

    app.post('/create', ensureAuthenticated, function(req, res) {
        function makePres() {
            var shortid = Math.random().toString(36).substring(2, 7); // Random 5 chars

            Presentation.findOne({shortid : shortid }, function(err, exists) {
                if (err){
                    return {err: err};
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

                if(req.body.type === "dzslides") {
                    pres.content = {html: req.body.html, css: req.body.css};
                }
                else if(req.body.type === "pdf") {
                    var destPath = path.join(__dirname, 'public', 'upload', shortid + '.pdf');
                    var is = fs.createReadStream(req.files.pdfFile.path);
                    var os = fs.createWriteStream(destPath);

                    util.pump(is, os, function() {
                        fs.unlinkSync(req.files.pdfFile.path);
                    });

                    pres.content = {path: shortid + '.pdf'};
                }
                else {
                    return {err: 'Invalid type'};
                }

                
                pres.save(function(err) {
                    if(err) {
                        return {err: err};
                    }
                    return shortid;
                });
            });
        }

        res.send(makePres());
    });
}
