module.exports = function (app) {
    function init() {
        // Initialize the socket.io library
        // Start the socket.io server on port 3000
        // Remember.. this also serves the socket.io.js file!
        var io = require('socket.io').listen(app);

        // Listen for client connection event
        // io.sockets.* is the global, *all clients* socket
        // For every client that is connected, a separate callback is called
        io.sockets.on('connection', function(socket){
            // Listen for this client's "send" event
            // remember, socket.* is for this particular client
            socket.on('send', function(data) {
                // Since io.sockets.* is the *all clients* socket,
                // this is a broadcast message.
                // Broadcast a "receive" event with the data received from "send"
                // Only rebroadcast if the message is properly signed (i.e.
                // player matches their sessionID).
                    io.sockets.emit('receive', data);
            });
        });
    }

    init();
}