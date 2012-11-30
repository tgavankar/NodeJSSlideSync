$(document).ready(function() {
    var sync = new SlideSyncPresenter();
    sync.init();
});

/********
 * Pong
 ********/
var SlideSyncPresenter = function() {

}

SlideSyncPresenter.prototype.init = function() {
    // Make a connection to the socket.io server
    this.socket = io.connect('/');
    window.nativePostMessage = window.postMessage;

    var ref = this;

    window.postMessage = function(data) {
        console.log("send: " + data);
        ref.socket.emit('send', data);
    }
}
