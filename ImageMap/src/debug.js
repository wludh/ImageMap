ImageMap.Debug = (function () {

    // internal use
    var _debugDiv            // cached reference to the debug div
      , _debugToggle         // cached reference to the debug toggle button
      , _debugClear;         // cached reference to the debug clear button
    
    /**
    * initialize
    *
    */
    var _init = function (options) {
        options = typeof options !== 'undefined' ? options : {};
        var enabled = typeof options.debugEnabled !== 'undefined' ? options.debugEnabled : false;

        _debugDiv = $("#imDebug");
        _debugToggle = $("#imDebugToggle");
        _debugClear = $("#imDebugClear");

        if (enabled) {
            _debugToggle.click(ImageMap.Debug.toggleDebug);
            _debugClear.click(ImageMap.Debug.clear);
            _debugToggle.fadeIn();
        }
    }

    /**
    * clear the debug display
    *
    */
    var _clear = function () {
        _debugDiv.fadeOut().html("");
    };

    /**
    * post a message to the debug display
    *
    * @param {string} message
    */
    var _log = function (message) {
        _debugDiv.prepend(msg + "<br />");
    }

    /**
    * toggle the debug display's visibility
    *
    */
    var _toggleDebug = function () {
        if (_debugToggle.hasClass('fa-minus')) {
            _debugToggle.removeClass('fa-minus').addClass('fa-plus');
            _debugClear.fadeOut();
            _debugDiv.fadeOut();
        }
        else {
            _debugToggle.removeClass('fa-plus').addClass('fa-minus');
            _debugClear.fadeIn();
            _debugDiv.fadeIn();
        }
    }


    return {
        init: _init,
        clear: _clear,
        log: _log,
        toggleDebug: _toggleDebug
    }
}());
