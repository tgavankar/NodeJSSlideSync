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
    
    function decorate(callback, toBind, pres) {
        return function(aWin, aMsg) {
            if(aWin === window && arguments.length > 1 && ["CURSOR", "FORWARD", "BACK", "START", "END"].indexOf(arguments[1]) > -1) {
                aMsg = [aMsg];
                for (var i = 2; i < arguments.length; i++)
                  aMsg.push(encodeURIComponent(arguments[i]));
                var data = {cmd: aMsg.join(" "), presId: $("#presId").text(), key: pres.key};
                console.log('send: ' + JSON.stringify(data));
                pres.socket.emit('send', data);
            }
            callback.apply(toBind, arguments);
        }
    }

    if($("#presType").text() === "dzslides") {
        Dz.postMsg = decorate(Dz.postMsg, Dz, this);
    }
    else if($("#presType").text() === "pdf") {
        PdfJs.postMsg = decorate(PdfJs.postMsg, PdfJs, this);
        $('#totalslidecount').text(PdfJs.slideCount);
    }
}

SlideSyncPresenter.prototype.registerRedis = function() {
    var success = function(data) {
        this.key = data.key;
    }.bind(this);

    function error(xhr, status, err){
        alert(JSON.stringify(err));
    }

    $.ajax({
        url: '/redis/regpub',
        data: {id: $('#presId').text(), _csrf: $('#csrf').text()},
        cache: false,
        type: 'POST',
        success: success,
        error: error
    });
}