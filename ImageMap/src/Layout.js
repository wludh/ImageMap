ImageMap.Layout = (function () {

    // layout options
    var _container          // reference to the ImageMap container
      , _orientation        // orientation of the map and details containers
      , _detailsWidth       // width of the details pane in percent
      , _mapHeight          // height of the map in percent, or if -1, use the Timeline band heights
      , _panelPadding       // padding between panels in pixels

    // presentation options
      , _title              // ImageMap title
      , _instructions       // ImageMap instructions
      , _detailFadeIn       // details fade-in duration in seconds

    // internal use
      , _noticeBackgroundDiv// cached reference to the notice background div
      , _noticeDiv          // cached reference to the notice div
      , _title              // cached reference to the title div
      , _mapDiv             // cached reference to the map container div
      , _detailsDiv         // cached reference to the details container div
      , _detailTitle        // cached reference to the detail title div
      , _timelineDiv        // cached reference to the timeline container div
    ;

    /**
    * initialize the data
    *
    * @param {string} options - optional option overrides
    */
    var _init = function (options) {
        options = typeof options !== 'undefined' ? options : {};

        //options
        _orientation = typeof options.orientation !== 'undefined' ? options.orientation : 'Portrait';
        _detailsWidth = typeof options.detailsWidth !== 'undefined' ? options.detailsWidth : 30;    // percent
        if (_detailsWidth % 10 > 0) {
            _detailsWidth -= _detailsWidth % 10;
        }
        _mapHeight = typeof options.mapHeight !== 'undefined' ? options.mapHeight : 100; //-1;             // percent (-1 indicates use actual band pixel height)
        if (_mapHeight != -1 && _mapHeight % 10 > 0) {
            _mapHeight -= _mapHeight % 10;
        }
        _panelPadding = typeof options.panelPadding !== 'undefined' ? options.panelPadding : 5;    // pixels

        // presentation options
        _title = typeof options.title !== 'undefined' ? options.title : 'Image-Map';
        _instructions = typeof options.instructions !== 'undefined' ? options.instructions : '';
        _detailFadeIn = typeof options.detailFadeIn !== 'undefined' ? options.detailFadeIn : 1;     // seconds

        // style
        var headElements = '<link href="https://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css" rel="stylesheet" type="text/css"/>';
        headElements += '<script src="https://d3js.org/d3.v3.min.js" type="text/javascript"></script>';
        headElements += '<script src="https://api.simile-widgets.org/ajax/2.2.3/simile-ajax-api.js" type="text/javascript"></script>';
        headElements += '<script src="https://api.simile-widgets.org/timeline/2.3.1/timeline-api.js?bundle=true" type="text/javascript"></script>';
        if (ImageMap.DEBUG) {
            headElements += '<link rel="stylesheet" href="css/ImageMap.css" type="text/css" media="screen">';
        }
        else {
            headElements += '<link rel="stylesheet" href="https://ManagementTools3.wlu.edu/ImageMap/css/ImageMap.css" type="text/css" media="screen">';
        }
        $('head').append(headElements);

        //container
        if (options.container == undefined || $('#' + options.container).length == 0) {
            //create a full-screen container
            options.container = 'newImContainer'
            var newContainer = $('<div>').attr('id', options.container).attr('class', 'fullScreenContainer');
            $(document).append(newContainer)
        }
        _container = $('#' + options.container);
        
        //message overlay
        $('<div>')
            .attr('id', 'imScreenNoticeBackground')
            .attr('class', 'fullScreenContainer')
            .append($('<div>')
                .attr('id', 'imScreenNotice')
                .html('Loading Image Map...'))
            .appendTo(document.body);

        //image map
        $('<div>')
        .attr('id', 'imCanvasContainer')
        .attr('class', 'imContainer')
            .append($('<div>')
            .attr('id', 'imCanvasTools')
                .append($('<select>')
                .attr('id', 'imSetWidth')
                .attr('title', 'Set Image Panel Width')
                .attr('class', 'imEnabled imIcondll')
                )
                .append($('<a>')
                .attr('id', 'imZoomReset')
                .attr('title', 'Reset Zoom')
                .attr('class', 'imEnabled imIconbutton')
                    .append($('<i>')
                    .attr('class', 'fa fa-arrows-alt')
                    )
                )
                .append($('<a>')
                .attr('id', 'imZoomOut')
                .attr('title', 'Zoom Out')
                .attr('class', 'imEnabled imIconbutton')
                    .append($('<i>')
                    .attr('class', 'fa fa-search-minus')
                    )
                )
                .append($('<a>')
                .attr('id', 'imZoomIn')
                .attr('title', 'Zoom In')
                .attr('class', 'imEnabled imIconbutton')
                    .append($('<i>')
                    .attr('class', 'fa fa-search-plus')
                    )
                )
                .append($('<div>')
                .attr('id', 'imMapTitle')
                )
                .append($('<div>')
                .attr('id', 'imMapDirections')
                    .append($('<a>')
                    .attr('id', 'imSeeAlsoRight')
                    .attr('title', 'Go to the Right Image')
                    .attr('class', 'imEnabled imIconbutton')
                        .append($('<i>')
                        .attr('class', 'fa fa-chevron-circle-right')
                        )
                    )
                    .append($('<a>')
                    .attr('id', 'imSeeAlsoDown')
                    .attr('title', 'Go to the Down Image')
                    .attr('class', 'imEnabled imIconbutton')
                        .append($('<i>')
                        .attr('class', 'fa fa-chevron-circle-down')
                        )
                    )
                    .append($('<a>')
                    .attr('id', 'imSeeAlsoUp')
                    .attr('title', 'Go to the Up Image')
                    .attr('class', 'imEnabled imIconbutton')
                        .append($('<i>')
                        .attr('class', 'fa fa-chevron-circle-up')
                        )
                    )
                    .append($('<a>')
                    .attr('id', 'imSeeAlsoLeft')
                    .attr('title', 'Go to the Left Image')
                    .attr('class', 'imEnabled imIconbutton')
                        .append($('<i>')
                        .attr('class', 'fa fa-chevron-circle-left')
                        )
                    )
                    .append($('<div>')
                    .attr('class', 'imClear')
                    )
                )
                .append($('<div>')
                .attr('id', 'imLeft')
                )
                .append($('<div>')
                .attr('id', 'imCanvas')
                )
                .append($('<div>')
                .attr('id', 'imRight')
                )
            ) 
        .appendTo(_container);

        //details
        $('<div>')
        .attr('id', 'imDetailsContainer')
        .attr('class', 'imContainer')
            .append($('<div>')
            .attr('id', 'imDetailsTools')
                .append($('<a>')
                .attr('id', 'imShowInstructions')
                .attr('title', 'Show Instructions')
                .attr('class', 'imEnabled imIconbutton')
                )
                .append($('<a>')
                .attr('id', 'imShowAreas')
                .attr('title', 'Show Areas')
                )
                .append($('<a>')
                .attr('id', 'imHighlightAreas')
                .attr('title', 'Highlight Areas')
                )
                .append($('<a>')
                .attr('id', 'imSearch')
                .attr('title', 'Search')
                )
                .append($('<a>')
                .attr('id', 'imFilter')
                .attr('title', 'Filter')
                )
                .append($('<a>')
                .attr('id', 'imShowAll')
                .attr('title', 'Show All')
                )
                .append($('<a>')
                .attr('id', 'imExportToPDF')
                .attr('title', 'Export to PDF')
                )
                .append($('<div>')
                .attr('id', 'imDetailsTitle')
                )
                .append($('<div>')
                .attr('class', 'imClear')
                )
            )
            .append($('<div>')
            .attr('id', 'imDetails')
            )
        .appendTo(_container);

        //timeline
        $('<div>')
            .attr('id', 'imTimelineContainer')
            .attr('class', 'imContainer')
            .appendTo(_container);
        
        //debug
        $('<div>')
            .attr('id', 'imDebug')
            .hide()
            .appendTo(_container);
        $('<a>')
            .attr('id', 'imDebugToggle')
            .attr('title', 'Toggle Debug Visibility')
            .attr('class', 'imEnabled imIconbutton fa fa-plus')
            .hide()
            .appendTo(_container);
        $('<a>')
            .attr('id', 'imDebugClear')
            .attr('title', 'Clear Debug Log')
            .attr('class', 'imEnabled imIconbutton fa fa-times')
            .hide()
            .appendTo(_container);

        // cache references to DOM elements
        _noticeBackgroundDiv = $('#imScreenNoticeBackground');
        _noticeDiv = $('#imScreenNotice');
        _mapDiv = $('#imCanvasContainer');
        _titleDiv = $('#imMapTitle');
        _detailsDiv = $('#imDetailsContainer');
        _detailsTitleDiv = $('#imDetailsTitle');
        _timelineDiv = $('#imTimelineContainer');

        var ddl = $("#imSetWidth");
        for (var i = 0; i < 10; i++) {
            var args = { value: i * 10, text: i * 10 + '%' };
            ddl.append($('<option>', args));
        }
    

        // set the static properties
        _titleDiv.html(_title);
        _mapDiv.css('top', _panelPadding + 'px');
        _mapDiv.css('left', _panelPadding + 'px');
        _detailsDiv.css('top', _panelPadding + 'px');
        _detailsDiv.css('right', _panelPadding + 'px');
        _detailsDiv.css('bottom', _panelPadding + 'px');
        _timelineDiv.css('bottom', _panelPadding + 'px');
        _timelineDiv.css('left', _panelPadding + 'px');

        if (_instructions != "") {
            _showInstructions();
        }
        //else {
        //    ImageMap.Player.rewind();
        //}

        $(window).resize(function () {
            ImageMap.Layout.update();
        });
        _update();
        _clearScreenNotice();
    };

    /**
    * update page layout
    *
    */
    var _update = function () {
        var w = _container.width()
          , h = _container.height();

        // h less top and bottom padding = total of the map and timeline heights
        var tmHeight = h - _panelPadding - _panelPadding;

        var mapCanvasHeight
          , timelineCanvasHeight;

        if (_mapHeight == -1) { // use pixel values
            timelineCanvasHeight = ImageMap.Timeline.height();
            mapCanvasHeight = tmHeight - timelineCanvasHeight;
        }
        else { // use percentage values
            mapCanvasHeight = (tmHeight * _mapHeight / 100);
            timelineCanvasHeight = tmHeight - mapCanvasHeight;
        }

        // update the dynamic properties
        if (_orientation == 'Portrait')
        {
            _mapDiv.css('right', (w * _detailsWidth / 100) + 'px');
            _mapDiv.css('bottom', timelineCanvasHeight + _panelPadding + 'px');
            _detailsDiv.css('left', (w * (100 - _detailsWidth) / 100) + _panelPadding + 'px');
            _timelineDiv.css('top', _panelPadding + mapCanvasHeight + _panelPadding + 'px');
            _timelineDiv.css('right', (w * _detailsWidth / 100) + 'px');
        }
        else {
            _mapDiv.css('right', (w * _detailsWidth / 100) + 'px');
            _mapDiv.css('bottom', timelineCanvasHeight + _panelPadding + 'px');
            _detailsDiv.css('left', (w * (100 - _detailsWidth) / 100) + _panelPadding + 'px');
            _timelineDiv.css('top', _panelPadding + mapCanvasHeight + _panelPadding + 'px');
            _timelineDiv.css('right', (w * _detailsWidth / 100) + 'px');
        }
    }

    /**
    * set the screen notice
    *
    * @param {string} content
    */
    var _setScreenNotice = function (content) {
        _noticeDiv.html(content);
        _noticeBackgroundDiv.show();
    };

    /**
    * clear the screen notice
    *
    */
    var _clearScreenNotice = function () {
        _noticeBackgroundDiv.fadeOut();
    };

    /**
    * set the details content div's html
    *
    * @param {string} content
    */
    var _setDetails = function (content) {
        _detailsDiv.hide().html(content).fadeIn(1000 * _detailFadeIn);
    };

    /**
    * show the instructions
    *
    */
    var _showInstructions = function () {
        _setDetails(_instructions);
    };

    /**
    * set the map width
    *
    */
    var _setMapWidth = function () {
        imageMapImageWidth = $("#SetWidthDDL").val();
        _update();
    }

    /**
    * toggle the layout between portrait and landscape
    *
    */
    var _toggleDiaplayMode = function () {
        _orientation = (_orientation == "Portrait") ? "Landscape" : "Portrait";
        _update();
    }









    return {
        init: _init,
        update: _update,
        setScreenNotice: _setScreenNotice,
        clearScreenNotice: _clearScreenNotice,
        setDetails: _setDetails,
        showInstructions: _showInstructions
        }
}());
