"use strict";
autowatch = 1;
outlets = 2;

mgraphics.init(); 
mgraphics.relative_coords = 0; 
mgraphics.autofill = 0;

const QueueBuffer = require('pdm.queue.js').QueueBuffer;
const DynamicColor = require('pdm.dynamiccolor.js').DynamicColor;

//parameters 
const PADDING_LEFT = 0;
let MARKER_SIZE = 4;
let FONT_SIZE = 14;
let SHOW_MARKERS = true;
let SHOW_HEADERS = true;
const FONT_FACE = "Andale Mono";
const COLORS = {
    text : new DynamicColor('live_control_fg'),
    indicator : new DynamicColor('live_control_selection')
}

//global variables
let qbuf = null; 
let size_changed = true;
let initialized = false;
const self = this;
let char_dim = [0, 0];
let max_text_length = 0;

//initialization
function loadbang() {init();}

function init(){
    if(jsarguments.length > 1) {
        name(jsarguments.slice(1));
    }
}

//parameter setters
function name(args) {
    initialized = assignQbuf(args);
    redraw();
}

function markersize(size) {
    size = Math.round(size);
    if(size < 1) {
        error('Error: Marker size must be greater than 0. size: ', size, '\n');
        return;
    }
    MARKER_SIZE = size;
    size_changed = true;
    redraw();
}

function fontsize(size) {
    size = Math.round(size);
    if(size < 1) {
        error('Error: Font size must be greater than 0. size: ', size, '\n');
        return;
    }
    FONT_SIZE = size;
    size_changed = true;
    redraw();
}

function showmarkers(show) {
    SHOW_MARKERS = show;
    size_changed = true;
    redraw();
}

function showheaders(show) {
    SHOW_HEADERS = show;
    size_changed = true;
    redraw();
}

//event handlers
function onresize() {
    size_changed = true;
}

function bang() {
    redraw();
}

function redraw() {
    if(initialized) mgraphics.redraw();
}

//helper functions
function assignQbuf(args) {
    let names = {}
    if(!Array.isArray(args)) {
        args = [args];
    }
    if(args.length == 2) {
        names.qbufName = args[0];
        names.metabufName = args[1]
    } else if (args.length == 1) {
        names = QueueBuffer.createBufferNames(args[0]);
    }
    
    const {qbufName, metabufName, exists, isValid} = QueueBuffer.validateQueueName(names.qbufName);
    if(!exists || !isValid) {
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
    mgraphics.select_font_face(FONT_FACE);
    mgraphics.set_font_size(FONT_SIZE);
    return mgraphics.text_measure(" ");
}
findCharDim.local = 1;

function getMaxTextLength() {
    const dim = getDim();
    const rowHeaderWidth = SHOW_HEADERS ? 3 * char_dim[0] : 0;
    const max_px = dim[0] - PADDING_LEFT - rowHeaderWidth;
    const max_chars = Math.floor(max_px / char_dim[0]) / 2;
    return max_chars;
}
getMaxTextLength.local = 1;

//drawing
function paint() {
    if(!qbuf) return;

    const queueData = qbuf.serialize();
    const num_queues = queueData.num_queues;

    mgraphics.select_font_face(FONT_FACE);
    mgraphics.set_font_size(FONT_SIZE);
    if(size_changed) {
        char_dim = mgraphics.text_measure(" ");
        max_text_length = getMaxTextLength();
        size_changed = false;
    }

    for(let i = 0; i < num_queues; i++) {
        //get queue data
        const queue = queueData.queues[i];
        let contents = queue.queue_contents;
        const eff_length = contents.length;

        const length = Math.max(queue.loop_length, eff_length);
        const read_pos = length === 1 ? 0 : length - (queue.write_position - queue.read_position);
        
        //calculate text position
        const line_height = char_dim[1];
        const leading = char_dim[1] * 0.5;
        const text_y = i * (line_height + leading) + line_height;

        //format text
        if(contents.length > max_text_length) {
            contents = contents.slice(read_pos, read_pos + max_text_length);
        }
        let display_text = contents.map(x => (x ?? 0).toString()).join(" ");
        if(SHOW_HEADERS) {
            display_text = i+1 + ": " + display_text;
        }

        //draw text
        mgraphics.set_source_rgba(COLORS.text.getRGBA());
        mgraphics.move_to(PADDING_LEFT, text_y);
        mgraphics.text_path(display_text);
        mgraphics.fill();

        //calculate marker position
        if(SHOW_MARKERS) {
            const marker_y = text_y + leading * 0.25;
            let marker_x = PADDING_LEFT + (read_pos * 2 + 0.5) * char_dim[0];
            if(SHOW_HEADERS) {
                marker_x += char_dim[0] * 3;
            }
            
            //draw marker
            mgraphics.set_source_rgba(COLORS.indicator.getRGBA());
            mgraphics.move_to(marker_x, marker_y);
            mgraphics.line_to(marker_x + MARKER_SIZE / 2, marker_y + MARKER_SIZE);
            mgraphics.line_to(marker_x - MARKER_SIZE / 2, marker_y + MARKER_SIZE);
            mgraphics.close_path();
            mgraphics.fill();
        }
    }
}
paint.local = 1;

if(!initialized) {
    init();
}

// function onclick(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function ondrag(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function ondblclick(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function onidle(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function onidleout(x, y, button, modifier1, shift, capslock, option, ctrl) {}

// function anything() {}