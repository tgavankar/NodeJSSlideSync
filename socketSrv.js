var redis = require("redis");

module.exports = function (app) {
    function init() {
        // Initialize the socket.io library
        // Start the socket.io server on the same port as nodeJS
        var io = require('socket.io').listen(app);
        var client = redis.createClient();

        // Listen for client connection event
        io.sockets.on('connection', function(socket){
            // Handle a new connection from a viewer.
            socket.on('view', function(data) {
                // Use socketIO's rooms feature.
                socket.join(data.presId);
            });

            // Handle messages from the presenter.
            socket.on('send', function(data) {
                client.get(data.presId, function(err, reply) {
                    // Verify security key is valid.
                    if(reply === data.key) {
                        // Broadcast only to viewers in room.
                        io.sockets.in(data.presId).emit('receive', "SET_" + data.cmd);
                    }
                });
            });
        });
    }

    init();
}