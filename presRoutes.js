var passport = require('passport');
var User = require('./models/User');
var ensureAuthenticated = require('./middleware/ensureAuthenticated');
var _ = require('underscore');

module.exports = function (app) {
    
    app.get('/view/:id', function(req, res) {
        res.send("view " + req.params.id);
    });

    app.get('/present/:id', ensureAuthenticated, function(req, res) {
        res.send("pres " + req.params.id);
    });

    app.get('/create', ensureAuthenticated, function(req, res) {
        res.render('create.ejs', {});
    });

    app.post('/create', ensureAuthenticated, function(req, res) {
        res.send("created");
    });
}
