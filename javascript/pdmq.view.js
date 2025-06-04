"use strict";
autowatch = 1;
outlets = 2;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

const QueueBuffer = require('pdmq.js').QueueBuffer;
// const DynamicColor = require('pdm.v8ui.color.js').DynamicColor;

//parameters 
const PADDING_LEFT = 0;
let ELIGIBLE_COLORS = null;

var name = null;
declareattribute("name", {
    setter: "setname",
    paint: true,
    label: "Name"
})

//parameter setters
function setname(args) {
    loadEligibleColors();
    initialized = assignQbuf(args);
    name = args[0];
    mgraphics.redraw();
}
setname.local = 1;

var markersize = 4;
declareattribute("markersize", {
    setter: "setmarkersize",
    type: "long",
    min: 4,
    max: 128,
    paint: true,
    label: "Marker Size"
})

function setmarkersize(size) {
    markersize = size;
    size_changed = true;
}
setmarkersize.local = 1;

var fontsize = 14;
declareattribute("fontsize", {
    setter: "setfontsize",
    type: "long",
    min: 1,
    max: 128,
    paint: true,
    label: "Font Size"
})

function setfontsize(size) {
    fontsize = size;
    size_changed = true;
}
setfontsize.local = 1;

var markers = true;
declareattribute("markers", {
    setter: "setmarkers",
    paint: true,
    style: "onoff",
    label: "Show Markers"
})

function setmarkers(show) {
    markers = Boolean(show);
    size_changed = true;
}
setmarkers.local = 1;

var headers = true;
declareattribute("headers", {
    setter: "setheaders",
    paint: true,
    style: "onoff",
    label: "Show Headers"
})

function setheaders(show) {
    headers = Boolean(show);
    size_changed = true;
}
setheaders.local = 1;

var textcolor = "live_control_fg";
declareattribute("textcolor", {
    setter: "settextcolor",
    type: "string",
    paint: true,
    label: "Text Color",
    default: "live_control_fg"
})
// let _textcol = null;

function settextcolor(color) {
    if(validateColor(color)) {
        textcolor = color;
    }
}
settextcolor.local = 1;

// function settextcolor(color) {
//     _textcol = new DynamicColor(color);
//     if(_textcol.id !== null) {
//         textcolor = color
//     }
// }
// settextcolor.local = 1;

var markercolor = "live_control_selection";
declareattribute("markercolor", {
    setter: "setmarkercolor",
    type: "string",
    paint: true,
    label: "Marker Color",
    default: "live_control_selection"
})
// let _markercol = null;

function setmarkercolor(color) {
    if(validateColor(color)) {
        markercolor = color;
    }
}
setmarkercolor.local = 1;

// function setmarkercolor(color) {
//     _markercol = new DynamicColor(color);
//     if(_markercol.id !== null) {
//         markercolor = color
//     }
// }
// setmarkercolor.local = 1;

var font = "PT Mono";
declareattribute("font", {
    type: "string",
    paint: true,
    label: "Font",
    style: "enum",
    enumvals: ["Andale Mono", "PT Mono", "PT Mono Bold"]
})

//internal variables
let qbuf = null;
let size_changed = true;
let initialized = false;
const self = this;
let char_dim = [0, 0];
let max_text_length = 0;

//initialization
function loadbang() { init(); }

function init() {
    settextcolor("live_control_fg")
    setmarkercolor("live_control_selection")
}

//event handlers
function onresize() {
    size_changed = true;
}

function bang() {
    mgraphics.redraw();
}

//helper functions
function assignQbuf(args) {
    let names = {}
    if (!Array.isArray(args)) {
        args = [args];
    }
    if (args.length == 2) {
        names.qbufName = args[0];
        names.metabufName = args[1]
    } else if (args.length == 1) {
        names = QueueBuffer.createBufferNames(args[0]);
    }

    const { qbufName, metabufName, exists, isValid } = QueueBuffer.validateQueueName(names.qbufName);
    if (!exists || !isValid) {
        error('Error: Queue buffer does not exist or is not valid. qbufName: ', qbufName, ' metabufName: ', metabufName, '\n');
        return false;
    }
    qbuf = new QueueBuffer(qbufName, metabufName);
    return true;
}
assignQbuf.local = 1;

function getDim() {
    const rect = self.box.rect;
    return [rect[2] - rect[0], rect[3] - rect[1]];
}
getDim.local = 1;

function findCharDim() {
    mgraphics.select_font_face(font);
    mgraphics.set_font_size(fontsize);
    return mgraphics.text_measure(" ");
}
findCharDim.local = 1;

function getMaxTextLength() {
    const dim = getDim();
    const rowHeaderWidth = headers ? 3 * char_dim[0] : 0;
    const max_px = dim[0] - PADDING_LEFT - rowHeaderWidth;
    const max_chars = Math.floor(Math.floor(max_px / char_dim[0]) / 2);
    return max_chars;
}
getMaxTextLength.local = 1;

//drawing
function paint() {
    if (!initialized || !qbuf) return;

    const queueData = qbuf.serialize();
    const num_queues = queueData.num_queues;

    mgraphics.select_font_face(font);
    mgraphics.set_font_size(fontsize);
    if (size_changed) {
        char_dim = mgraphics.text_measure(" ");
        max_text_length = getMaxTextLength();
        size_changed = false;
    }

    for (let i = 0; i < num_queues; i++) {
        //get queue data
        const queue = queueData.queues[i];
        let contents = queue.queue_contents;
        const contents_length = contents.length;

        const length = Math.min(queue.loop_length, contents_length);
        
        let read_pos = length === 1 ? 0 : length - (queue.write_position - queue.read_position);

        //calculate text position
        const line_height = char_dim[1];
        const leading = char_dim[1] * 0.5;
        const text_y = i * (line_height + leading) + line_height;

        //format text
        if (contents.length > max_text_length) {
            const start = Math.min(read_pos, length - max_text_length);
            const end = start + max_text_length;
            contents = contents.slice(start, end);
            read_pos -= start;
        }
        let display_text = contents.map(x => (x ?? 0).toString()).join(" ");
        if (headers) {
            display_text = i + 1 + ": " + display_text;
        }

        //draw text
        mgraphics.set_source_rgba(max.getcolor(textcolor));
        mgraphics.move_to(PADDING_LEFT, text_y);
        mgraphics.text_path(display_text);
        mgraphics.fill();

        //calculate marker position
        if (markers) {
            const marker_y = text_y + leading * 0.25;
            let marker_x = PADDING_LEFT + (read_pos * 2 + 0.5) * char_dim[0];
            if (headers) {
                marker_x += char_dim[0] * 3;
            }

            //draw marker
            // const marker_color = new DynamicColor(markercolor);
            mgraphics.set_source_rgba(max.getcolor(markercolor));
            mgraphics.move_to(marker_x, marker_y);
            mgraphics.line_to(marker_x + markersize / 2, marker_y + markersize);
            mgraphics.line_to(marker_x - markersize / 2, marker_y + markersize);
            mgraphics.close_path();
            mgraphics.fill();
        }
    }
}
paint.local = 1;

function loadEligibleColors() {
    if (!ELIGIBLE_COLORS) {
        const maxColors = getMaxColors();
        ELIGIBLE_COLORS = [];
        maxColors.forEach(item => {
            if (item.visibility === 'essential') {
                ELIGIBLE_COLORS.push(item.id);
            }
        });
    }
}
loadEligibleColors.local = 1;

function getMaxColors() {
    const d = new Dict();
    d.import_json('maxcolors.json');
    const maxColors = JSON.parse(d.stringify()).colors;
    d.freepeer();
    return maxColors;
}
getMaxColors.local = 1;

function validateColor(color) {
    loadEligibleColors();
    if(ELIGIBLE_COLORS.includes(color)) {
        return true;
    } else {
        error('Error: Color does not exist. color: ', color, '\n');
        return false;
    }
}
validateColor.local = 1;

if (!initialized) {
    init();
}

// function onclick(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function ondrag(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function ondblclick(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function onidle(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function onidleout(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function anything() {}