$(document).ready(function() {
    var sync = new SlideSync();
    sync.init();
});

/********
 * Pong
 ********/
var SlideSync = function() {

}

SlideSync.prototype.init = function() {
    // Make a connection to the socket.io server
    this.socket = io.connect('http://192.168.1.139:3000/');

    window.nativePostMessage = window.postMessage;

    var ref = this;
    // When getting a "receive" event from the server
    this.socket.on('receive', function(data) {
        console.log("recv: " + data);
        window.nativePostMessage("SET_" + data, "*");
    });

    window.postMessage = function(data) {
        console.log("send: " + data);
        ref.socket.emit('send', data);
    }
}

