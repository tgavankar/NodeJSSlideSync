var redis = require("redis");

module.exports = function (app) {
    function init() {
        // Initialize the socket.io library
        // Start the socket.io server on port 3000
        // Remember.. this also serves the socket.io.js file!
        var io = require('socket.io').listen(app);
        var client = redis.createClient();

        // Listen for client connection event
        // io.sockets.* is the global, *all clients* socket
        // For every client that is connected, a separate callback is called
        io.sockets.on('connection', function(socket){
            socket.on('view', function(data) {
                socket.join(data.presId);
            });

            // Listen for this client's "send" event
            // remember, socket.* is for this particular client
            socket.on('send', function(data) {
                client.get(data.presId, function(err, reply) {
                    if(reply === data.key) {
                        io.sockets.in(data.presId).emit('receive', "SET_" + data.cmd);
                    }
                });
            });
        });
    }

    init();
}