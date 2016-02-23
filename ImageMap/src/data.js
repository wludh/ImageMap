ImageMap.Data = (function () {

    var _loadJSON = function (data) {
        data = data || {};

        try {
            //alert('Load Data');
        }
        catch (err) {
            alert(err);
            return null;
        }
    };

    var _loadFile = function (url) {
        try {
            //alert('Load Data from File: ' + url);
        }
        catch (err) {
            alert(err);
            return null;
        }
    };

    var _loadAJAX = function (url) {
        try {
            //alert('Load Data from web service: ' + url);
        }
        catch (err) {
            alert(err);
            return null;
        }
    };

    return {
        loadJSON: _loadJSON,
        loadFile: _loadFile,
        loadAJAX: _loadAJAX
    }
}());
