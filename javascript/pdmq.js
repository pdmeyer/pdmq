/**
 * @file pdmq.js
 * @description Core queue buffer implementation for Max/MSP.
 * This module provides the fundamental queue buffer functionality used by pdmq.manager.
 * It implements a multi-channel buffer system with synchronized data and metadata buffers.
 * 
 * The module contains several classes:
 * - Queue: Manages a single channel's queue with read/write positions and loop behavior
 * - QueueBuffer: Manages multiple Queue instances in a multichannel buffer
 * - QueueApi: Interface for QueueBuffer
 * - QueueBufferManager: Handles Max patcher scripting for automatic buffer creation 
 *        and management inside pdmq.maxpat
 * - QueueHostApi: Extends QueueApi add interface for QueueBufferManager
 *  
 * @module pdmq
 */
"use strict";
const g = new Global('pdm_queue_global');
const MaxJsObject = require('./pdmq.maxjsobject.js').MaxJsObject;

/********************** Queue **********************/
/**
 * Manages a single channel's queue with read/write positions and loop behavior.
 * Handles synchronization between data and metadata buffers for a single channel.
 */
class Queue {
    constructor(qbufName, metabufName, channel) {
        this.qbuf = null;
        this.metabuf = null;
        this.setBuffers(qbufName, metabufName);

        this.channel = Math.max(channel, 1); // Buffer API uses 1-based channel indexing

        // Initialize reader properties in read buffer
        this.setLoopLength(1);  // Default to no looping
        this.setEvery(1);       // Default to advancing every impulse
    }

    /**
     * Updates the buffer names and reinitializes queues
     * @param {string} qbufName - New data buffer name
     * @param {string} metabufName - New metadata buffer name
     * @returns {boolean} True if buffers were set successfully, false otherwise
     */
    setBuffers(qbufName, metabufName) {
        this.qbuf = new Buffer(qbufName);
        this.metabuf = new Buffer(metabufName);
    }

    // Get the every value from the read buffer
    getEvery() {
        return this.metabuf.peek(this.channel, 3, 1);
    }

    // Set the loop length in the read buffer
    setLoopLength(length) {
        this.metabuf.poke(this.channel, 2, length);
    }

    // Set the every value in the read buffer
    setEvery(every) {
        this.metabuf.poke(this.channel, 3, every);
    }

    // Get the next value in the queue (to the right of read head)
    getNext() {
        const readPos = this.getReadPosition();
        const writePos = this.getWritePosition();
        return this.qbuf.peek(this.channel, Math.min((readPos + 1), writePos) % this.getBufferSize(), 1);
    }

    // Get the last value read (at read head position)
    getLast() {
        const readPos = this.getReadPosition();
        return this.qbuf.peek(this.channel, readPos % this.getBufferSize(), 1);
    }

    getContents() {
        let contents = [];

        const fullBuf = this.getFullBuffer();
        const bufSize = this.getBufferSize();
        const readPos = this.getReadPosition();
        const writePos = this.getWritePosition();
        const loopLength = this.getLoopLength();
        const startPos = Math.max(0, Math.min(readPos, writePos - loopLength));
        const endPos = writePos;

        
        for(var i = startPos; i < endPos; i++) {
            const bufIx = i % bufSize
            const value = fullBuf[bufIx];
            if(value == null) {
                error('value is null at index ', bufIx, '\n');
            }
            contents.push(value);
        }
        if(contents.length == 0) {
            contents.push(0);
        }
        return contents;
    }

    // Get all values in the buffer
    getFullBuffer() {
        // Get all values except the last frame which contains write position
        return this.qbuf.peek(this.channel, 0, this.getBufferSize());
    }

    getBufferSize() {
        return this.qbuf.framecount();
    }

    // Get the write position from the last slot
    getWritePosition() {
        // Read the last frame of the channel
        return this.metabuf.peek(this.channel, 0, 1); 
    }

    // Get the read position from the read buffer
    getReadPosition() {
        return this.metabuf.peek(this.channel, 1, 1);
    }

    // Get the loop length from the read buffer
    getLoopLength() {
        return this.metabuf.peek(this.channel, 2, 1);
    }

    setReadPosition(position) {
        this.metabuf.poke(this.channel, 1, position);
    }
  
    setWritePosition(position) {
        this.metabuf.poke(this.channel, 0, position);
    }

    advanceWritePosition(steps = 1) {
        this.setWritePosition(this.getWritePosition() + steps);
    }

    advanceReadPosition(steps = 1) {
        this.setReadPosition(this.getReadPosition() + steps);
    }

    write(value) {
        this.qbuf.poke(this.channel, this.getWritePosition() % this.getBufferSize(), value);
        this.advanceWritePosition();
    }

    clear() {
        if(!this.qbuf) {
            error("Error: No buffers set. Please set buffers before calling this method.\n");
            return;
        }
        let length = this.getBufferSize();
        let mlength = this.metabuf.framecount();
        let qClear = new Array(length).fill(0);
        let mClear = new Array(mlength).fill(0);
        this.qbuf.poke(this.channel, 0, qClear);
        this.metabuf.poke(this.channel, 0, mClear);
    }

    serialize() {
        const data = {
            channel: this.channel,
            read_position: this.getReadPosition(),
            write_position: this.getWritePosition(),
            loop_length: this.getLoopLength(),
            every: this.getEvery(),
            queue_contents: this.getContents(),
            buffer_contents: this.getFullBuffer()
        };
        return data;
    }

    // Clean up when done
    free() {
        this.qbuf.freepeer();
        this.metabuf.freepeer();
    }
} 

/********************** QueueBuffer **********************/
/**
 * Manages a collection of queues for a multi-channel buffer.
 * Handles synchronization between data and metadata buffers across multiple channels.
 */
class QueueBuffer {
    /**
     * Creates a new QueueBuffer instance
     * @param {string} qbufName - Name of the queue buffer
     * @param {string} metabufName - Name of the metadata buffer
     */
    constructor(qbufName, metabufName) {
        this.qbufName = null;
        this.metabufName = null;
        this.qbuf = null;
        this.metabuf = null;
        this.queues = [];
        this.setBuffers(qbufName, metabufName);
    }
    /**
     * Updates the buffer names and reinitializes queues
     * @param {string} qbufName - New data buffer name
     * @param {string} metabufName - New metadata buffer name
     * @returns {boolean} True if buffers were set successfully, false otherwise
     */
    setBuffers(qbufName, metabufName) {
        if (!QueueBuffer.validateBuffers(qbufName, metabufName)) {
            error("Error: Queue buffer '", qbufName, "' or metadata buffer '", metabufName, "' does not exist or is invalid\n");
            return false;
        }
        
        this.qbufName = qbufName;
        this.metabufName = metabufName;
        this.qbuf = new Buffer(qbufName);
        this.metabuf = new Buffer(metabufName);
        // Update queue count to match new buffer
        return this._updateQueues();
    }


    /**
     * Updates the queue collection to match the current buffer channel count
     * @private
     */
    _updateQueues() {
        const qbufChannels = this.qbuf.channelcount();
        const metabufChannels = this.metabuf.channelcount();
        
        if (qbufChannels !== metabufChannels) {
            error("Error: qbuf and metabuf must have the same number of channels. qbuf: ", qbufChannels, " metabuf: ", metabufChannels, "\n");
            return false;
        }

        // Remove excess queues if we have too many
        while (this.queues.length > qbufChannels) {
            this.queues.pop();
        }
        
        // Add new queues if we need more
        while (this.queues.length < qbufChannels) {
            const queue = new Queue(this.qbufName, this.metabufName, this.queues.length + 1);
            this.queues.push(queue);
        }
        return true;
    }

    /**
     * Gets the size of the buffer in frames
     * @returns {number} Buffer size in frames
     */
    getBufferSize() {
        return this.qbuf.framecount();
    }

    /**
     * Gets the number of channels in the buffer
     * @returns {number} Number of channels
     */
    getChannelCount() {
        return this.qbuf.channelcount();
    }

    getBuffers() {
        if(!this.qbuf || !this.metabuf) {
            error("Error: Buffers not set. Please set buffers before calling this method.\n");
            return null;
        }
        return {
            qbuf: this.qbufName,
            metabuf: this.metabufName
        };
    }

    /**
     * Gets a specific queue by channel number
     * @param {number} channel - Channel number (1-based)
     * @returns {Queue} The queue for the specified channel
     */
    getQueue(channel) {
        if(channel < 1 || channel > this.getChannelCount()) {
            error("Error: Invflid channel number. Please use a number between 1 and ", this.getChannelCount(), "\n");
            return null;
        }
        return this.queues[channel - 1];
    }

    /**
     * Gets the next value(s) in the queue(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Next value(s)
     */
    getNext(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getNext();
        }
        return this.queues.map(q => q.getNext());
    }

    /**
     * Gets the last value(s) read from the queue(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Last value(s)
     */
    getLast(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getLast();
        }
        return this.queues.map(q => q.getLast());
    }

    /**
     * Gets the current contents of the queue(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {Array<number>|Array<Array<number>>} Queue contents
     */
    getContents(channel = 0) {
        return this.getQueue(channel).getContents();
    }

    /**
     * Gets the full buffer contents
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {Array<number>|Array<Array<number>>} Buffer contents
     */
    getFullBuffer(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getFullBuffer();
        }
        return this.queues.map(q => q.getFullBuffer());
    }

    /**
     * Gets the current read and write positions
     * @returns {Object} Object containing read and write positions
     */
    getPositions() {
        return {
            read: this.queues.map(q => q.getReadPosition()),
            write: this.queues.map(q => q.getWritePosition())
        };
    }

    /**
     * Gets the write position(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Write position(s)
     */
    getWritePosition(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getWritePosition();
        }
        return this.queues.map(q => q.getWritePosition());
    }

    /**
     * Gets the read position(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Read position(s)
     */
    getReadPosition(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getReadPosition();
        }
        return this.queues.map(q => q.getReadPosition());
    }

    /**
     * Sets the read position(s)
     * @param {number} position - New read position
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setReadPosition(position, channel = 0) {
        if (channel !== 0) {
            this.getQueue(channel).setReadPosition(position);
        } else {
            this.queues.forEach(q => q.setReadPosition(position));
        }
    }

    /**
     * Sets the write position(s)
     * @param {number} position - New write position
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setWritePosition(position, channel = 0) {
        if (channel !== 0) {
            this.getQueue(channel).setWritePosition(position);
        } else {
            this.queues.forEach(q => q.setWritePosition(position));
        }
    }

    /**
     * Advances the read position(s)
     * @param {number} steps - Number of steps to advance
     * @param {number} channel - Channel to advance (0 for all channels)
     */
    advanceReadPosition(steps = 1, channel = 0) {
        if (channel !== 0) {
            this.getQueue(channel).advanceReadPosition(steps);
        } else {
            this.queues.forEach(q => q.advanceReadPosition(steps));
        }
    }

    /**
     * Advances the write position(s)
     * @param {number} steps - Number of steps to advance
     * @param {number} channel - Channel to advance (0 for all channels)
     */
    advanceWritePosition(steps = 1, channel = 0) {
        if (channel !== 0) {
            this.getQueue(channel).advanceWritePosition(steps);
        } else {
            this.queues.forEach(q => q.advanceWritePosition(steps));
        }
    }

    /**
     * Gets the loop length(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Loop length(s)
     */
    getLoopLength(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getLoopLength();
        }
        return this.queues.map(q => q.getLoopLength());
    }

    /**
     * Sets the loop length for the specified channel(s)
     * @param {number} length - New loop length
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setLoopLength(length, channel = 0) {
        if (typeof length !== 'number' || length < 1) {
            error("Error: loop length must be a positive number\n");
            return;
        }
        if (channel < 0 || channel > this.getChannelCount()) {
            error("Error: invalid channel number\n");
            return;
        }
        if (channel !== 0) {
            this.getQueue(channel).setLoopLength(length);
        } else {
            this.queues.forEach(q => q.setLoopLength(length));
        }
    }

    /**
     * Gets the every value(s)
     * @param {number} channel - Channel to get from (0 for all channels)
     * @returns {number|Array<number>} Every value(s)
     */
    getEvery(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getEvery();
        }
        return this.queues.map(q => q.getEvery());
    }

    /**
     * Sets the every value for the specified channel(s)
     * @param {number} every - New every value
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setEvery(every, channel = 0) {
        if (typeof every !== 'number' || every < 1) {
            error("Error: every must be a positive number\n");
            return;
        }
        if (channel !== 0) {
            this.getQueue(channel).setEvery(every);
        } else {
            this.queues.forEach(q => q.setEvery(every));
        }
    }

    /**
     * Writes a value to the specified channel(s)
     * @param {number} value - Value to write
     * @param {number} channel - Channel to write to (0 for all channels)
     */
    write(value, channel = 0) {
        // if(!this.qbuf) return;
        if(!this.qbuf) {
            error("Error: No buffers set. Please set buffers before calling this method.\n");
            return;
        }
        if(channel < 0 || channel > this.getChannelCount()) {
            error("Error: Invalid channel number. Please use a number between 1 and ", this.getChannelCount(), "\n");
            return;
        }
        if (channel !== 0) {
            this.queues[channel - 1].write(value);
        } else {
            this.queues.forEach(q => q.write(value));
        }
    }

    /**
     * Clears the queue buffer
     */
    clear(channel = 0) {
        if (channel !== 0) {
            this.queues[channel - 1].clear();
        } else {
            this.queues.forEach(q => q.clear());
        }
    }

    /**
     * Serializes the current state of the queue buffer
     * @returns {Object} Serialized state
     */
    serialize() {
        return {
            queue_buffer_name: this.qbufName,
            metadata_buffer_name: this.metabufName,
            num_queues: this.getChannelCount(),
            size: this.getBufferSize(),
            queues: this.queues.map(queue => queue.serialize())
        };
    }

    /**
     * Frees resources used by the queue buffer
     */
    free() {
        this.queues.forEach(q => q.free());
        this.queues = [];
    }

    /**
     * Validates that both buffers exist and have matching channel counts
     * @param {Buffer} qbuf - Queue buffer to validate
     * @param {Buffer} metabuf - Metadata buffer to validate
     * @param {string} qbufName - Name of the queue buffer (for error messages)
     * @param {string} metabufName - Name of the metadata buffer (for error messages)
     * @returns {boolean} True if buffers are valid, false otherwise
     * @static
     */
    static validateBuffers(qbufName, metabufName) {
        const [qbufExists, metabufExists] = QueueBuffer.queueBuffersExist(qbufName, metabufName);
        const output = {
            "exists": false,
            "isValid": false
        }
        output.exists = qbufExists || metabufExists;
        if(!output.exists) {
            return output;
        }
        // Check if channel counts match
        output.isValid = QueueBuffer.validateChannelCount(qbufName, metabufName);
        return output;
    }

    static queueBuffersExist(qbufName, metabufName) {
        const qbufExists = QueueBuffer.bufferExists(qbufName);
        const metabufExists = QueueBuffer.bufferExists(metabufName);
        return [qbufExists, metabufExists];
    }

    static bufferExists(bufferName) {
        const _temp_buffer = new Buffer(bufferName);
        const exists = _temp_buffer.channelcount() !== -1;
        _temp_buffer.freepeer();
        return exists;
    }

    static getChannelCount(bufferName) {
        const _temp_buffer = new Buffer(bufferName);
        const count = _temp_buffer.channelcount();
        _temp_buffer.freepeer();
        return count;
    }

    static validateChannelCount(qbufName, metabufName) {
        const qbuf = new Buffer(qbufName);
        const metabuf = new Buffer(metabufName);
        const valid = qbuf.channelcount() > 0 && qbuf.channelcount() === metabuf.channelcount();
        qbuf.freepeer();
        metabuf.freepeer();
        return valid;
    }

    /**
     * Creates buffer names from a base name
     * @param {string} name - Base name for the buffers
     * @returns {Object} Object containing the buffer names
     */
    static createBufferNames(name) {
        return {
            qbufName: name,
            metabufName: name + "_meta"
        };
    }

    static validateChannelIndex(channel, channelCount) {
        return channel > 0 && channel <= channelCount;
    }
    
    /**
     * Validates a queue name and returns the corresponding buffer names
     * @param {string} name - Base name for the queue
     * @returns {Object} Object containing the buffer names and validation status
     * @property {string} qbufName - Name of the queue buffer
     * @property {string} metabufName - Name of the metadata buffer
     * @property {boolean} isValid - Whether the buffers exist and are valid
     */
    static validateQueueName(name) {
        const {qbufName, metabufName} = QueueBuffer.createBufferNames(name);
        const {exists, isValid} = QueueBuffer.validateBuffers(qbufName, metabufName);
        return {qbufName, metabufName, exists, isValid};
    }

    static getValidationData(name) {
        const output = QueueBuffer.validateQueueName(name);
        output.channelcount = QueueBuffer.getChannelCount(output.qbufName);
        return output;
    }
}






/********************** QueueBufferManager **********************/
/**
 * Manages scripting within the Max patcher to dynamically create and remove buffer~ objects.
 * Handles the creation, naming, and removal of buffer boxes in the Max patcher.
 */
class QueueBufferManager {
    /**
     * Creates a new QueueBufferManager instance
     * @param {Object} patcher - The Max patcher instance
     */
    constructor(jsthis) {
        this.jsthis = jsthis;
        this.patcher = jsthis.patcher;
        this.qbufBox = null;
        this.metabufBox = null;
    }

    /**
     * Creates new buffer boxes with the specified parameters
     * @param {string} qbufName - Name of the queue buffer
     * @param {string} metabufName - Name of the metadata buffer
     * @param {number} channelCount - Number of channels
     * @param {number} length - Buffer length
     * @returns {Object} Object containing the created buffer boxes
     */
    createBufferBoxes(qbufName, metabufName, channelCount, length) {
        var box = this.jsthis.box.rect;
        let left = box[2] + 10;
        let top = box[1];
        
        const qbufBox = this.patcher.newdefault(left, top, 'buffer~', qbufName, 1, channelCount, '@samps', length);
        qbufBox.varname = "pdm_queue_qbuf_box";
        left = qbufBox.rect[2] + 10;
        const metabufBox = this.patcher.newdefault(left, top, 'buffer~', metabufName, 1, channelCount, '@samps', 4);
        metabufBox.varname = "pdm_queue_metabuf_box";
        return { qbufBox, metabufBox };
    }

    /**
     * Removes existing buffer boxes if they exist
     */
    removeBufferBoxes() {
        if(this.qbufBox?.valid) {
            this.patcher.remove(this.qbufBox);
        }
        if(this.metabufBox?.valid) {
            this.patcher.remove(this.metabufBox);
        }
        this.metabufBox = null;
        this.qbufBox = null;
    }

    /**
     * Sets the buffer boxes
     * @param {Object} boxes - Object containing the buffer boxes
     */
    setBufferBoxes(boxes) {
        this.qbufBox = boxes.qbufBox;
        this.metabufBox = boxes.metabufBox;
    }

    /**
     * Creates new buffers with the specified parameters
     * @param {string} name - Base name for the buffers
     * @param {number} channelCount - Number of channels
     * @param {number} length - Buffer length
     * @returns {Object|null} Object containing buffer names if successful, null if failed
     */
    createBuffers(name, channelCount, length) {
        const {qbufName, metabufName} = QueueBuffer.createBufferNames(name);
        const buffersExist = QueueBuffer.validateBuffers(qbufName, metabufName).exists;
        
        if(buffersExist) {
            error("Error: Buffers with name", name, "already exist. Please choose a different name.\n");
            return null;
        }

        this.removeBufferBoxes();
        const boxes = this.createBufferBoxes(qbufName, metabufName, channelCount, length);
        this.setBufferBoxes(boxes);
        return { qbufName, metabufName };
    }
}

/********************** QueueApi **********************/
/**
 * Provides an interface for interacting with QueueBuffer.
 * Handles message routing and basic queue operations.
 * Can be extended to add additional functionality like buffer management.
 */
class QueueApi extends MaxJsObject {
    /**
     * @returns {Object} API specification for parameters and messages
     */
    static get api() {
        return {
            parameters: {
            },
            messages: {
                name: {
                    handler: '_name',
                },
                buffernames: {
                    handler: '_buffernames',
                },
                write: {
                    handler: '_write',
                    parameters: ['channel', 'value']
                },
                back: { 
                    handler: '_back',
                    parameters: ['channel?', 'steps?']
                },
                looplen: {
                    handler: '_looplen',
                    parameters: ['channel?', 'length']
                },
                every: {
                    handler: '_every',
                    parameters: ['channel?', 'every']
                },
                getbuffers: {
                    handler: '_getbuffers',
                },
                getqueue: {
                    handler: '_getqueue',
                },
                getchannelcount: {
                    handler: '_getchannelcount',
                },
                getlength: {
                    handler: '_getlength',
                },  
                clear : {
                    handler: '_clear',
                },
                dump: {
                    handler: '_dump',
                }
            },
            signatures: [
                {
                    count: 2,
                    params: ['buffers', 'buffers']
                }
            ]
        };
    }

    /**
     * Creates a new QueueApi instance
     */
    constructor() {
        super();
        this.queueBuffer = null;
        this.init();
    }

    /**
     * Initializes the QueueApi
     * @returns {boolean} True if initialization was successful
     */
    _init() {
        return true;
    }

    /**
     * Helper method to safely execute operations on the queue buffer
     * @param {Function} callback - Function to execute with the queue buffer
     * @returns {any} Result of the callback function
     */
    _withQueueBuffer(callback) {
        if (!this.queueBuffer) {
            error("Error: No buffers set. Please set buffers using 'name' or 'buffernames' before calling " + callback.name + ".\n");
            return;
        }
        return callback(this.queueBuffer);
    }

    /**
     * Sets up the queue buffer with the specified names
     * @param {string} qbufName - Name of the queue buffer
     * @param {string} metabufName - Name of the metadata buffer
     */
    setBuffers(qbufName, metabufName) {
        if(!metabufName) {
            metabufName = qbufName + "_meta";
        }
        if(!this.queueBuffer) {
            this.queueBuffer = new QueueBuffer(qbufName, metabufName);
        } else {
            this.queueBuffer.setBuffers(qbufName, metabufName);
        }
        this._getbuffers();
    }

    _name(name) {
        let {qbufName, metabufName, exists, isValid} = QueueBuffer.validateQueueName(name);
        if(!exists) {
            error("Error: Buffers with name", name, "don't exist. Please create them first.\n");
            return;
        }
        if(!isValid) {
            error("Error: Buffers with name", name, "are not valid queue buffers. Please choose a different name.\n");
            return;
        }
        this.setBuffers(qbufName, metabufName);
    }

    /**
     * Handles buffer name changes
     * @param {string} qbufName - Name of the queue buffer
     * @param {string} metabufName - Name of the metadata buffer
     */
    _buffernames(qbufName, metabufName) {
        this.setBuffers(qbufName, metabufName);
    }

    /**
     * Writes a value to the specified channel(s)
     * @param {number} channel - Channel to write to (0 for all channels)
     * @param {number} value - Value to write
     */
    _write(channel, value) {
        function write(queueBuffer) {
            queueBuffer.write(value, channel);
        }
        this._withQueueBuffer(write);
        this._notify("write", channel, value);
    }

    _back(channel = 0, steps = 1) {
        if(steps < 0) {
            this._clear(channel);
            return;
        }
        function back(queueBuffer) {
            queueBuffer.advanceWritePosition(-steps, channel);
        }
        this._withQueueBuffer(back);
        this._notify("back", channel, steps);
    }

    _looplen(channel, length) {
        function looplen(queueBuffer) {
            queueBuffer.setLoopLength(length, channel);
        }
        this._withQueueBuffer(looplen);
        this._notify("looplen", channel, length);
    }

    _every(channel, every) {
        function every(queueBuffer) {
            queueBuffer.setEvery(every, channel);
        }
        this._withQueueBuffer(every);
    }

    _getbuffers() {
        function getbuffers(queueBuffer) {
            return queueBuffer.getBuffers();
        }
        let buffers = this._withQueueBuffer(getbuffers);
        if(buffers) {
            outlet(0, 'buffers', buffers.qbuf, buffers.metabuf);
        }
    }

    _getqueue(channel = 0) {
        if(channel != 0) {
            function getqueue(queueBuffer) {
                return queueBuffer.getContents(channel);
            }
            let queue = this._withQueueBuffer(getqueue);
            if(queue) {
                outlet(0, 'queue', channel, queue);
            }
        } else  {
            function getqueueall(queueBuffer) {
                queueBuffer.queues.forEach((queue, index) => {
                    outlet(0, 'queue', index + 1, queue.getContents());
                });
            }
            this._withQueueBuffer(getqueueall);
        }
    }

    _getchannelcount() {
        function getchannelcount(queueBuffer) {
            return queueBuffer.getChannelCount();
        }
        const channelcount = this._withQueueBuffer(getchannelcount);
        if(channelcount) outlet(0, 'channelcount', channelcount);
    }   

    _getlength() {
        function getlength(queueBuffer) {
            return queueBuffer.getBufferSize();
        }
        const length =this._withQueueBuffer(getlength);
        if(length) outlet(0, 'length', length);
    }
    
    _clear(channel = 0) {
        function clear(queueBuffer) {
            queueBuffer.clear(channel);
        }
        this._withQueueBuffer(clear);
    }

    _dump() {
        function dump(queueBuffer) {
            let dumped = queueBuffer.serialize();
            let d = new Dict();
            d.parse(JSON.stringify(dumped));
            outlet(0, 'dump', 'dictionary', d.name);
        }
        this._withQueueBuffer(dump);
    }

    _notify(message, ...args) {
        g.msg = [message, this.queueBuffer.qbufName, ...args];
        if(this.queueBuffer.qbufName) {
            g.sendnamed("pdm_queue", "msg");
        } else {
            error("Error: No queue buffer name set. Please set buffers before calling this method.\n");
        }
    }
}

/********************** QueueHostApi **********************/
/**
 * Extends QueueApi to interact with the QueueBufferManager.
 * Adds buffer management capabilities to the base QueueApi functionality.
 * Handles creation and removal of buffer boxes in the Max patcher.
 */
class QueueHostApi extends QueueApi {
    /**
     * @returns {Object} API specification for parameters and messages
     */
    static get api() {
        return {
            ...super.api,
            messages: {
                ...super.api.messages,
                create: {
                    handler: '_create',
                    parameters: ['name', 'channelCount', 'length']
                },
                remove: {
                    handler: '_remove',
                }
            }
        };
    }

    /**
     * Creates a new QueueHostApi instance
     * @param {Object} patcher - The Max patcher instance
     */
    constructor(jsthis) {
        super();
        this.bufferManager = new QueueBufferManager(jsthis);
        this.init();
    }

    /**
     * Handles buffer creation
     * @param {string} name - Base name for the buffers
     * @param {number} channelCount - Number of channels
     * @param {number} length - Buffer length
     */
    _create(name, channelCount = 1, length = 16) {
        //generate and validate the buffer names using the queuebuffer name
        let {qbufName, metabufName, exists, isValid} = QueueBuffer.validateQueueName(name);

        //if the buffers don't exist, create them
        if(!exists) {
            const bufferNames = this.bufferManager.createBuffers(name, channelCount, length);
            qbufName = bufferNames.qbufName;
            metabufName = bufferNames.metabufName;
            isValid = true;
        } 

        //if the buffers are not valid, error and return
        if(!isValid) {
            error("Error: Buffers with name", qbufName, "and/or", metabufName, "already exist and are not valid queue buffers. Please choose a different name.\n");
            outlet(0, 'create', 0);
            return;
        }
        
        //if the buffers are valid, set them and get the buffers
        this.setBuffers(qbufName, metabufName);
        this._getbuffers();
        outlet(0, 'create', 1);
        this._notify("create", 1);
     
    }

    /**
     * Removes existing buffer boxes if they exist
     */
    _remove() {
        this.bufferManager.removeBufferBoxes();
    }

    /**
     * Handles buffer name changes
     * @param {string} qbufName - Name of the queue buffer
     * @param {string} metabufName - Name of the metadata buffer
     */
    _buffernames(qbufName, metabufName) {
        this.bufferManager.removeBufferBoxes();
        super._buffernames(qbufName, metabufName);
    }

    _notify(message, ...args) {
        g.msg = [message, this.queueBuffer.qbufName, ...args];
        if(this.queueBuffer.qbufName) {
            g.sendnamed("pdm_queue", "msg");
        } else {
            error("Error: No queue buffer name set. Please set buffers before calling this method.\n");
        }
    }
}

exports.Queue = Queue;
exports.QueueBuffer = QueueBuffer;
exports.QueueApi = QueueApi;
exports.QueueHostApi = QueueHostApi;
exports.QueueBufferManager = QueueBufferManager;