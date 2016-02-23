
var ImageMap = (function () {

    var _DEBUG = (window.location.href.indexOf("http://localhost") == 0);

    var _init = function (options) {
        try {
            this.Layout.init(options);
            this.Debug.init(options);
        }
        catch (err) {
            alert(err);
            return null;
        }
    };

    var _loadJSON = function (data) {
        this.Data.loadJSON(data);
    };
    var _loadFile = function (url) {
        this.Data.loadFile(url);
    };
    var _loadAJAX = function (url) {
        this.Data.loadAJAX(url);
    };


    return {
        DEBUG: _DEBUG,
        init: _init,
        loadJSON: _loadJSON,
        loadFile: _loadFile,
        loadAJAX: _loadAJAX
    }
}());
