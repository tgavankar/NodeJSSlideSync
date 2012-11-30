$(document).ready(function() {
    var sync = new SlideSyncViewer();
    sync.init();
});

/********
 * Pong
 ********/
var SlideSyncViewer = function() {

}

SlideSyncViewer.prototype.init = function() {
    // Make a connection to the socket.io server
    this.socket = io.connect('/');
    window.nativePostMessage = window.postMessage;

    // When getting a "receive" event from the server
    this.socket.on('receive', function(data) {
        console.log("recv: " + data);
        window.nativePostMessage("SET_" + data, "*");
    });
}