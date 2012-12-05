var passport = require('passport');
var User = require('./models/User');
var Presentation = require('./models/Presentation');
var ensureAuthenticated = require('./middleware/ensureAuthenticated');
var redis = require("redis");

module.exports = function (app) {
    var client = redis.createClient();
    
    client.on("error", function (err) {
        console.log("Error " + err);
    });

    app.post('/redis/regpub', ensureAuthenticated, function(req, res) {
        Presentation.findOne({shortid: req.body.id, _creator: req.user}, function(err, doc) {
            if(err) {
                res.status(400).send(err);
            }
            else if(!doc) {
                res.status(400).send("Not found");
            }
            else {
                var key = Math.random().toString(36).substring(2, 7); // Random 5 chars
                client.set(req.body.id, key, function() {
                    res.send({key: key});
                });
            }
        });
    });
}
