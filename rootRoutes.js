var passport = require('passport');
var User = require('./models/User');

module.exports = function (app) {
    
    app.get('/', function(req, res) {
        templateData = { user: req.user};
        res.render('index', templateData);
    });
}
