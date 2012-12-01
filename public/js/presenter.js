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
    
    function decorate(callback, pres) {
        return function(aWin, aMsg) {
            if(aWin === window && arguments.length > 1 && ["CURSOR", "FORWARD", "BACK", "START", "END"].indexOf(arguments[1]) > -1) {
                aMsg = [aMsg];
                for (var i = 2; i < arguments.length; i++)
                  aMsg.push(encodeURIComponent(arguments[i]));
                var data = {cmd: aMsg.join(" "), presId: $("#presId").text(), key: pres.key};
                pres.socket.emit('send', data);
            }
            callback.apply(Dz, arguments);
        }
    }

    Dz.postMsg = decorate(Dz.postMsg, this);
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
        data: {id: $('#presId').text()},
        cache: false,
        type: 'POST',
        success: success,
        error: error
    });
}