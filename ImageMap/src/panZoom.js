ImageMap.PanZoom = (function () {

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


    function calculateOverflow() {
        xOverflow = (scale * iw) - pw;//Math.min(iw, pw);
        yOverflow = (scale * ih) - ph;//Math.min(ih, ph);
        //debug("Overflow: " + Math.round(xOverflow) + ", " + yOverflow);
    }

    function zoomRecenter() {
        if (editPoly == undefined) {
            xOffset = 0;
            yOffset = 0;
            scale = minScale;
        }
        else {
            var bounds = editPoly[0][0].getBBox();
            var sx = minScale * iw / bounds.width / 2;
            var sy = minScale * ih / bounds.height / 2;
            scale = Math.max(minScale, Math.min(maxScale, Math.min(sx, sy)));
            xOffset = (pw / 2 - (bounds.x + bounds.width / 2) * scale);
            yOffset = (ph / 2 - (bounds.y + bounds.height / 2) * scale);
        }
        calculateOverflow()
        zoom();
    }

    function zoomTo(x, y, s) {
        var dx = (x - xOffset) / 10;
        var dy = (y - yOffset) / 10;
        var ds = (s - scale) / 10;
        debug("zoomTo(" + dx + ", " + dy + ", " + ds + ")");

        xOffset += dx;
        yOffset += dy;
        scale += ds;
        calculateOverflow()
        zoom();

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(ds) > 0.01) {
            setTimeout(function () {
                zoomTo(x, y, s);
            }, 20);
        }
    }

    function zoomReset(animated) {
        if (animated) {
            zoomOut(1.05);
        }
        else {
            xOffset = 0;
            yOffset = 0;
            minScale = Math.min(pw / iw, ph / ih);
            scale = minScale;
        }
        calculateOverflow()
        zoom();
        if (animated && scale > minScale) {
            setTimeout(function () {
                zoomReset(animated);
            }, 20);
        }
    }

    function zoomIn(factor) {
        //debug("");
        //debug("zoomIn");
        //debug("selectedArea: " + selectedArea);
        //debug("editPoly: " + editPoly);
        var origX;
        var origY
        //if a shape is selected, zoom on the center of the shape's bounding box
        if (selectedArea != -1) {
            var bounds = shapes[selectedImage][selectedArea][0][0].getBBox();
            var origX = bounds.x + bounds.width / 2;
            var origY = bounds.y + bounds.height / 2;
        }
        else if (editPoly != undefined) {
            var bounds = editPoly[0][0].getBBox();
            var origX = bounds.x + bounds.width / 2;
            var origY = bounds.y + bounds.height / 2;
        }
        else {
            var origX = ((pw / 2) - xOffset) / scale;
            var origY = ((ph / 2) - yOffset) / scale;
        }

        //debug("Image is " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        //debug("Inital offset of " + Math.round(xOffset) + "," + Math.round(yOffset));

        //var origX = (Math.max((pw / 2), iw * scale / 2) * scale - xOffset) / scale;
        //var origY = (Math.max((ph / 2), ih * scale / 2) * scale - yOffset) / scale;
        debug("Focus at orig " + Math.round(origX) + "," + Math.round(origY));
        scale = Math.min(scale * factor, maxScale);
        calculateOverflow();
        xOffset = (pw / 2) - (origX * scale);
        yOffset = (ph / 2) - (origY * scale);
        //debug("Image is " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        //debug("Try offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
        zoom();
        //debug("Resulting offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
    }

    function zoomOut(factor) {
        //debug("");
        //debug("zoomOut");
        //debug("Image is " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        //debug("Inital offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
        var origX = ((pw / 2) - xOffset) / scale;
        var origY = ((ph / 2) - yOffset) / scale;
        //debug("Focus at orig " + Math.round(origX) + "," + Math.round(origY));
        scale = Math.max(scale / factor, minScale);
        calculateOverflow();
        xOffset = (pw / 2) - (origX * scale);
        yOffset = (ph / 2) - (origY * scale);
        //debug("Image is " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        //debug("Try offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
        zoom();
        //debug("Resulting offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
    }

    function zoom() {
        if (scale == minScale) {
            $("#ZoomOut").removeClass("enabled");
            $("#ZoomOut").addClass("disabled");
            $("#ZoomReset").removeClass("enabled");
            $("#ZoomReset").addClass("disabled");
        }
        else {
            $("#ZoomOut").removeClass("disabled");
            $("#ZoomOut").addClass("enabled");
            $("#ZoomReset").removeClass("disabled");
            $("#ZoomReset").addClass("enabled");
        }
        if (scale == maxScale) {
            $("#ZoomIn").removeClass("enabled");
            $("#ZoomIn").addClass("disabled");
        }
        else {
            $("#ZoomIn").removeClass("disabled");
            $("#ZoomIn").addClass("enabled");
        }

        //debug("zoom to: " + scale.toFixed(3));
        move();

        //re-scale line widths
        if (selectedImage != undefined) { //view mode
            for (var i = 0; i < shapes[selectedImage].length; i++) {
                var style = areaStyles.areaStyles[areas[selectedImage].areas[i].AreaStyleIndex];
                if (i == selectedArea) {
                    shapes[selectedImage][i].attr("stroke-width", style.SelectedLineWeight / scale);
                    shapes[selectedImage][i].attr("stroke", style.SelectedStroke);
                    shapes[selectedImage][i].attr("fill", style.SelectedFill);
                }
                else {
                    shapes[selectedImage][i].attr("stroke-width", style.InactiveLineWeight / scale);
                    shapes[selectedImage][i].attr("stroke", style.InactiveStroke);
                    shapes[selectedImage][i].attr("fill", style.InactiveFill);
                }
            }
        }
        if (editPoly != undefined) { //edit mode
            for (var i = 0; i < dots.length; i++) {
                dots[i].attr("r", cornerDotRadius / scale);
                subdots[i].attr("r", edgeDotRadius / scale);
            }
            editPoly.attr("stroke-width", lineThickness / scale);
        }

        //save zoom level in edit mode
        if ($("#ImageMapAreaZHiddenField") != undefined) {
            $("#ImageMapAreaZHiddenField").val(scale);
        }
    }

    function moveLeft() {
        xOffset += (40 * scale);
        move();
    }
    function moveRight() {
        xOffset -= (40 * scale);
        move();
    }
    function moveUp() {
        yOffset += (40 * scale);
        move();
    }
    function moveDown() {
        yOffset -= (40 * scale);
        move();
    }

    //function dragged() {
    //d3.event.sourceEvent.stopPropagation();
    //xOffset += d3.event.dx;// * scale;
    //yOffset += d3.event.dy;// * scale;
    //    //debug(d3.event.dx + "," + d3.event.dy);
    //move();
    //}

    var dragImage = d3.behavior.drag()
        .on("dragstart", function (d, i) {
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", function (d, i) {
            xOffset += d3.event.dx; // * scale;
            yOffset += d3.event.dy; // * scale;
            //debug(d3.event.dx + "," + d3.event.dy);
            move();
        })
        .on("dragend", function (d, i) {
            d3.event.sourceEvent.stopPropagation();
        });

    function move() {
        //debug("Overflow: " + Math.round(xOverflow) + "," + Math.round(yOverflow));
        //debug("Requested: " + Math.round(xOffset) + "," + Math.round(yOffset));
        if (xOffset > 0) //can't scroll left of edge
            xOffset = 0;
        else if (xOverflow <= 0) //can't scroll if image < panel width
            xOffset = 0;
        else if (xOffset < -xOverflow) //can't scroll right of edge
            xOffset = -xOverflow;

        if (yOffset > 0)// || yOverflow <= 0)
            yOffset = 0;
        else if (yOverflow <= 0)
            yOffset = 0;
        else if (yOffset < -yOverflow)
            yOffset = -yOverflow;

        //debug("Offset: " + Math.round(xOffset) + "," + Math.round(yOffset));
        svg.attr("transform", "translate(" + xOffset + "," + yOffset + ")scale(" + scale + ")");
        $("#ImageMapAreaXHiddenField").attr("value", xOffset);
        $("#ImageMapAreaYHiddenField").attr("value", yOffset);
    }

    function imageZoomScroll() { //zoom in towards mouse pointer
        //debug("imageZoomScroll");
        var oX = d3.event.offsetX;
        var oY = d3.event.offsetY;
        if (d3.event.offsetX == undefined) {
            oX = d3.event.clientX * scale / minScale - ffXOffset,
            oY = d3.event.clientY * scale / minScale - ffYOffset;
        }
        var dcX = oX / scale;
        var dcY = oY / scale;
        var delta = d3.event.wheelDelta;
        //debug("imageZoomScroll wheelDelta: " + delta);
        var ds = (delta > 0) ? 13 / 12 : 12 / 13;
        scale = Math.max(Math.min(scale * ds, maxScale), minScale);
        calculateOverflow();
        zoom();
        //maintain mouse focus point
        xOffset -= (dcX - (oX / scale)) * scale;
        yOffset -= (dcY - (oY / scale)) * scale;
        move();
    }

    function editImageZoomScroll() { //zoom in towards mouse pointer
        //debug("imageZoomScroll");
        var oX = d3.event.offsetX;
        var oY = d3.event.offsetY;
        if (d3.event.offsetX == undefined) {
            oX = d3.event.clientX * scale / minScale - 200,
            oY = d3.event.clientY * scale / minScale - 200;
            debug("Alt focus: " + oX + "," + oY);
        }
        var dcX = oX / scale;
        var dcY = oY / scale;
        var delta = d3.event.wheelDelta;
        //debug("imageZoomScroll wheelDelta: " + delta);
        var ds = (delta > 0) ? 13 / 12 : 12 / 13;
        scale = Math.max(Math.min(scale * ds, maxScale), minScale);
        calculateOverflow();
        zoom();
        //maintain mouse focus point
        xOffset -= (dcX - (oX / scale)) * scale;
        yOffset -= (dcY - (oY / scale)) * scale;
        move();
    }

    function imageZoomScroll2() { //zoom in towards mouse pointer
        var oX = d3.event.offsetX;
        var oY = d3.event.offsetY;
        debug("Offset: " + oX + "," + oY);
        if (d3.event.offsetX == undefined) {
            oX = d3.event.clientX * scale / minScale - ffXOffset,
            oY = d3.event.clientY * scale / minScale - ffYOffset;
        }
        debug("Offset: " + oX + "," + oY);
        var dcX = oX / scale;
        var dcY = oY / scale;
        debug(d3.event.detail);
        var delta = (d3.event.detail != undefined) ? d3.event.detail : d3.event.wheelDelta;
        debug("imageZoomScroll2 wheelDelta: " + delta);
        var ds = (delta > 0) ? 13 / 12 : 12 / 13;
        scale = Math.max(Math.min(scale * ds, maxScale), minScale);
        calculateOverflow();
        zoom();
        //maintain mouse focus point
        xOffset -= (dcX - (oX / scale)) * scale;
        yOffset -= (dcY - (oY / scale)) * scale;
        move();
    }

    function imageDoubleClick() {
        //d3.event.stopPropagation();

        var oX = d3.event.offsetX;
        var oY = d3.event.offsetY;
        //debug("offset: " + d3.event.offsetX + "," + d3.event.offsetY);
        //debug("client: " + d3.event.clientX + "," + d3.event.clientY);
        //debug("layer: " + d3.event.layerX + "," + d3.event.layerY);
        //debug("page: " + d3.event.pageX + "," + d3.event.pageY);
        if (d3.event.offsetX == undefined) {
            oX = d3.event.clientX * scale / minScale - 10,
            oY = d3.event.clientY * scale / minScale - 50;
            //    debug("norm: " + oX + "," + oY);
        }
        var dcX = oX / scale;
        var dcY = oY / scale;
        //debug("");
        //debug("Double click at orig " + Math.round(dcX) + "," + Math.round(dcY));
        //debug("Focus at old scale " + Math.round(d3.event.offsetX) + "," + Math.round(d3.event.offsetY));
        //debug("Image was " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        scale = Math.min(scale * 1.5, maxScale);
        calculateOverflow();
        zoom();
        //debug("Image is " + Math.round(iw * scale) + " x " + Math.round(ih * scale));
        //debug("Focus would now be at " + Math.round(scale * dcX) + "," + Math.round(scale * dcY));
        //debug("Center of window is at " + pw / 2 + "," + ph / 2);
        //try to center on zoom vector...

        //center screen
        //xOffset = (pw / 2) - (scale * dcX);
        //yOffset = (ph / 2) - (scale * dcY);

        //maintain mouse focus point
        xOffset -= (dcX - (oX / scale)) * scale;
        yOffset -= (dcY - (oY / scale)) * scale;


        //debug("Try offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
        move();
        //debug("Resulting offset of " + Math.round(xOffset) + "," + Math.round(yOffset));
        //debug("Overflow " + Math.round(xOverflow) + "," + Math.round(yOverflow));
    }

    return {
        loadJSON: _loadJSON,
        loadFile: _loadFile,
        loadAJAX: _loadAJAX
    }
}());
