var passport = require('passport');
var User = require('./models/User');

module.exports = function (app) {
    app.get('/', function(req, res) {
        res.render('index');
    });
}
