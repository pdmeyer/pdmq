"use strict";
autowatch = 1;
outlets = 2;

mgraphics.init(); 
mgraphics.relative_coords = 0; 
mgraphics.autofill = 0;

const QueueBuffer = require('pdm.queue.js').QueueBuffer;
const DynamicColor = require('pdm.dynamiccolor.js').DynamicColor;

const PADDING_LEFT = 0;
const MARKER_SIZE = 4;
const FONT_SIZE = 14;
const FONT_FACE = "Andale Mono";

const colors = {
    text : new DynamicColor('live_control_fg'),
    indicator : new DynamicColor('live_control_selection')
}

let qbuf = null; 
let size_changed = 1;
let initialized = false;
const self = this;

function loadbang() {init();}

function init(){
    initialized = assignQbuf(jsarguments);
}

function name() {
    var args = arrayfromargs(arguments);
    assignQbuf(args);
}

function assignQbuf(args) {
    let names = {}
    if(args.length == 3) {
        names.qbufName = args[1];
        names.metabufName = args[2]
    } else if (args.length == 2) {
        names = QueueBuffer.createBufferNames(args[1]);
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
    const rowHeaderWidth = 3 * char_dim[0];
    const max_px = dim[0] - PADDING_LEFT - rowHeaderWidth;
    const max_chars = Math.floor(max_px / char_dim[0]) / 2;
    return max_chars;
}
getMaxTextLength.local = 1;

let char_dim = [0, 0];
let max_text_length = 0;
function paint() {
    if(!qbuf) return;

    const queueData = qbuf.serialize();
    const num_queues = queueData.num_queues;

    mgraphics.select_font_face(FONT_FACE);
    mgraphics.set_font_size(FONT_SIZE);
    if(size_changed) {
        char_dim = mgraphics.text_measure(" ");
        max_text_length = getMaxTextLength();
        size_changed = 0;
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
            // post('contents.length', contents.length, '\n');
            // post('max_text_length', max_text_length, '\n');
            // post('before', contents, '\n');
            contents = contents.slice(read_pos, read_pos + max_text_length);
            // post('after', contents, '\n');
            // return;
        }
        const display_text = i+1 + ": " + contents.map(x => (x ?? 0).toString()).join(" ");

        //draw text
        mgraphics.set_source_rgba(colors.text.getRGBA());
        mgraphics.move_to(PADDING_LEFT, text_y);
        mgraphics.text_path(display_text);
        mgraphics.fill();

        //calculate marker position
        const marker_y = text_y + leading * 0.25;
        const marker_x = PADDING_LEFT + 3 * char_dim[0] + (read_pos * 2 + 0.5) * char_dim[0];
        
        //draw marker
        mgraphics.set_source_rgba(colors.indicator.getRGBA());
        mgraphics.move_to(marker_x, marker_y);
        mgraphics.line_to(marker_x + MARKER_SIZE / 2, marker_y + MARKER_SIZE);
        mgraphics.line_to(marker_x - MARKER_SIZE / 2, marker_y + MARKER_SIZE);
        mgraphics.close_path();
        mgraphics.fill();
    }
}
paint.local = 1;

function onclick(x, y, button, modifier1, shift, capslock, option, ctrl) {

}

function ondrag(x, y, button, modifier1, shift, capslock, option, ctrl) {
    
}

function ondblclick(x, y, button, modifier1, shift, capslock, option, ctrl) {

}

function onidle(x, y, button, modifier1, shift, capslock, option, ctrl) {

}

function onidleout(x, y, button, modifier1, shift, capslock, option, ctrl) {

}

function onresize() {
}

function onresize() {
    size_changed = 1;
}

function bang() {
    mgraphics.redraw();
}

function anything() {  

}