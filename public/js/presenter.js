$(document).ready(function() {
    var sync = new SlideSyncPresenter();
    sync.init();
});

var SlideSyncPresenter = function() {

}

SlideSyncPresenter.prototype.init = function() {
    // Make a connection to the socket.io server
    this.socket = io.connect('/');
    window.nativePostMessage = window.postMessage;

    this.initHandlers();
}

SlideSyncPresenter.prototype.initHandlers = function() {
    this.socket.on('connect', this.registerRedis.bind(this));

    // Decorator function that forwards the wrapped postMsg call
    // to the server.
    function decorate(callback, toBind, pres) {
        return function(aWin, aMsg) {
            if(aWin === window && arguments.length > 1 && ["CURSOR", "FORWARD", "BACK", "START", "END"].indexOf(arguments[1]) > -1) {
                aMsg = [aMsg];
                for (var i = 2; i < arguments.length; i++)
                  aMsg.push(encodeURIComponent(arguments[i]));
                var data = {cmd: aMsg.join(" "), presId: $("#presId").text(), key: pres.key};
                pres.socket.emit('send', data);
            }
            callback.apply(toBind, arguments);
        }
    }

    // Use the decorator pattern to wrap the postMsg function so that
    // it also forwards the message to the server.
    if($("#presType").text() === "dzslides") {
        Dz.postMsg = decorate(Dz.postMsg, Dz, this);
    }
    else if($("#presType").text() === "pdf") {
        PdfJs.postMsg = decorate(PdfJs.postMsg, PdfJs, this);
        $('#totalslidecount').text(PdfJs.slideCount);
    }
}

/**
 * Register this presenter with Redis to get a security key.
 * All future messages must be signed with the key, otherwise
 * they will not be forwarded to viewers.
 */
SlideSyncPresenter.prototype.registerRedis = function() {
    var success = function(data) {
        this.key = data.key;
    }.bind(this);

    var error = function(xhr, status, err){
        switch(err) {
            case "Bad Request":
                alert(xhr.responseText);
                break;
            case "Unauthorized":
                window.location.href = "/login";
                break;
            case "Forbidden":
                alert("Session has expired. Please refresh to regain control of viewers.");
                break;
            default:
                alert("An unexpected error has occured.");
        }
    }.bind(this);

    $.ajax({
        url: '/redis/regpub',
        data: {id: $('#presId').text(), _csrf: $('#csrf').text()},
        cache: false,
        type: 'POST',
        success: success,
        error: error
    });
}