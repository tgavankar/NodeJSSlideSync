$(document).ready(function() {
    var sync = new SlideSyncViewer();
    sync.init();
});

var SlideSyncViewer = function() {

}

SlideSyncViewer.prototype.init = function() {
    // Make a connection to the socket.io server
    this.socket = io.connect('/');
    window.nativePostMessage = window.postMessage;

    this.socket.emit('view', {presId: $('#presId').text()});

    this.follow = true;

    // When getting a "receive" event from the server
    this.socket.on('receive', function(data) {
        if(this.follow) {
            window.nativePostMessage(data, "*");
        }
    }.bind(this));

    $("#follower").show();
    $('#backPage').show();

    $("#follower").on('tapone', function() {
        this.follow = !this.follow;
        if(this.follow) {
            $("#follower").text("Stop Following");
        }
        else {
            $("#follower").text("Start Following");
        }
    }.bind(this));

    $("#backPage").on('tapone', function() {
        window.location.href = '/list';
    });
}