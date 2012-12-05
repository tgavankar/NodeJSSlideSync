var path = require('path');
var fs = require('fs');
var util = require('util');
var passport = require('passport');
var User = require('./models/User');
var Presentation = require('./models/Presentation');
var ensureAuthenticated = require('./middleware/ensureAuthenticated');
var sanitize = require('validator').sanitize;

module.exports = function (app) {
    
    app.get('/view/:id', function(req, res) {
        Presentation.findOne({shortid: req.params.id}, function(err, doc) {
            if(err) {
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(404).render('404.ejs');
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
                res.status(400).send(e);
            }
            else if(!doc) {
                res.status(404).render('404.ejs');
            }
            else {
                if(doc.type === "dzslides") {
                    res.render('view.ejs', {title: doc.title, 
                                            presId: doc.shortid, 
                                            html: doc.content.html, 
                                            css: doc.content.css, 
                                            presType: doc.type, 
                                            jsfile: 'presenter.js'});    
                }
                else if(doc.type === "pdf") {
                    res.render('view.ejs', {title: doc.title, 
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
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(404).render('404.ejs');
            }
            else {
                if(doc.type === "dzslides") {
                    res.render('present.ejs', {title: doc.title, presId: doc.shortid, html: doc.content.html, css: doc.content.css});
                }
                else if(doc.type === "pdf") {
                    res.render('present.ejs', {title: doc.title, presId: doc.shortid, presType: doc.type})
                }
            }
        });
    });

    app.get('/list', ensureAuthenticated, function(req, res) {
        var presentations = Presentation.find({_creator: req.user}, function(err, docs) {
            res.render('list.ejs', {preslist: docs});
        });
    });

    app.get('/create', ensureAuthenticated, function(req, res) {
        res.render('create.ejs', {presType: 'dzslides', title: '', desc: '', html: '', css: '', action: '/create'});
    });

    app.post('/create', ensureAuthenticated, function(req, res) {
        function makePres() {
            var shortid = Math.random().toString(36).substring(2, 7); // Random 5 chars

            Presentation.findOne({shortid : shortid }, function(err, exists) {
                if (err) {
                    return {success: false, text: err};
                }
                if (exists) {
                    return makePres();
                }

                var pres = new Presentation({shortid: shortid});
                pres.title = sanitize(req.body.title).xss();
                pres.desc = sanitize(req.body.desc).xss();
                pres.createdTimestamp = new Date();
                pres.modifiedTimestamp = new Date();
                pres.type = sanitize(req.body.type).xss();
                pres._creator = req.user;

                if(req.body.type === "dzslides") {
                    pres.content = {html: sanitize(req.body.html).xss(), css: sanitize(req.body.css).xss()};
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
                    return {success: false, text: 'Invalid type'};
                }

                pres.save(function(err) {
                    if(err) {
                        return { success: false, err: err };
                    }
                    return { success: true, text: shortid };
                });
            });
        }

        var output = makePres();

        if(output.success) {
            res.send(output.text);
        }
        else {
            res.status(400).send(output.text);
        }
    });

    app.get('/edit/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(404).render('404.ejs');
            }
            else {
                if(doc.type === "dzslides") {
                    res.render('create.ejs', {title: doc.title, presId: doc.shortid, presType: doc.type, desc: doc.desc, html: doc.content.html, css: doc.content.css, action: '/edit/' + req.params.id});
                }
                else if(doc.type === "pdf") {
                    res.render('create.ejs', {title: doc.title, presId: doc.shortid, presType: doc.type, desc: doc.desc, html: '', css: '', action: '/edit/' + req.params.id})
                }
            }
        });
    });

    app.post('/edit/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(400).send('Invalid ID');
            }
            else {
                doc.title = sanitize(req.body.title).xss();
                doc.desc = sanitize(req.body.desc).xss();
                doc.modifiedTimestamp = new Date();

                if(req.body.type === "dzslides") {
                    doc.content = {html: sanitize(req.body.html).xss(), css: sanitize(req.body.css).xss()};
                }
                else if(req.body.type === "pdf") {
                    var destPath = path.join(__dirname, 'public', 'upload', doc.shortid + '.pdf');
                    var is = fs.createReadStream(req.files.pdfFile.path);
                    var os = fs.createWriteStream(destPath);

                    util.pump(is, os, function() {
                        fs.unlinkSync(req.files.pdfFile.path);
                    });

                    doc.content = {path: doc.shortid + '.pdf'};
                }
                doc.type = req.body.type;
                doc.save(function(err) {
                    if(err) {
                        res.status(400).send(err);
                    }
                    else {
                        res.send(doc.shortid);
                    }
                });

            }
        });
    });

    app.post('/delete/:id', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.params.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(404).render('404.ejs');
            }
            else {
                if(req.body.type === "pdf") {
                    fs.unlinkSync(path.join(__dirname, 'public', 'upload', shortid + '.pdf'));
                }

                doc.remove();

                return res.send('Successfully deleted.');
            }
            return res.status(400).send('An unexpected error has occurred.');
        });
    });
}
