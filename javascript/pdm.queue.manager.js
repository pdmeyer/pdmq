/**
 * @file pdm.queue.manager.js
 * @description Manages a multi-channel queue buffer system in Max/MSP.
 * This module provides an interface for controlling queue buffers,
 * particularly writing to queues and configuring loop behavior. 
 * 
 * The QueueManager class extends MaxJsObject to provide a Max-compatible interface
 * for controlling queue buffers through messages and parameters.
 * 
 * Usage: 
 * - Create queue and metadata buffers in the parent patch with the same number of channels
 *      - qbuf: queue buffer that holds the queues
 *      - metabuf: metadata buffer that holds the read/write positions, loop length, and every value
 * - Create a v8 object: `v8 pdm.queue.manager.js qbuf metabuf` or `v8 pdm.queue.manager.js @buffers qbuf metabuf`
 * 
 * @module pdm.queue.manager
 * @requires pdm.queue.js
 * @requires pdm.maxjsobject.js
 */

// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const QueueBuffer = require('pdm.queue.js').QueueBuffer;
const MaxJsObject = require('pdm.maxjsobject.js').MaxJsObject;

/**
 * Manages a multi-channel queue buffer system in Max.
 * Provides an interface for writing values, controlling playback position,
 * and configuring loop behavior across multiple channels.
 */
class QueueManager extends MaxJsObject {
    /**
     * @returns {Object} API specification for parameters and messages
     */
    static get api() {
        return {
            parameters: {
                buffers: { 
                    required: true,
                    callback: '_handleBuffersChange'
                }
            },
            messages: {
                write: {
                    handler: 'handleWrite',
                    parameters: ['channel', 'value']
                },
                back: { 
                    handler: 'handleBack',
                    parameters: ['channel?', 'steps?']
                },
                looplen: {
                    handler: 'handleLoopLength',
                    parameters: ['channel?', 'length']
                },
                every: {
                    handler: 'handleEvery',
                    parameters: ['channel?', 'every']
                },
                dump: {
                    handler: 'handleDump',
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
     * Creates a new QueueManager instance
     */
    constructor() {
        super();
        this.queueBuffer = null;
        this.init();
    }

    /**
     * Initializes the QueueManager with the specified buffers
     * @param {string} [qBufName] - Name of the queue buffer
     * @param {string} [metaBufName] - Name of the metadata buffer
     * @returns {boolean} True if initialization was successful
     */
    _init(qBufName, metaBufName) {
        try {
            // Get buffer names from arguments if not provided
            if (!qBufName || !metaBufName) {
                const bufferNames = this.getArgValues('buffers');
                if (bufferNames.length < 2) {
                    throw new Error("buffers parameter must contain two buffer names");
                }
                qBufName = bufferNames[0];
                metaBufName = bufferNames[1];
            }
            
            this.queueBuffer = new QueueBuffer(qBufName, metaBufName);
            
            // Check if QueueBuffer initialization succeeded
            if (!this.queueBuffer.qbuf || !this.queueBuffer.metabuf) {
                error("Error: Failed to initialize QueueBuffer\n");
                this.queueBuffer = null;
                return false;
            }
            
            post("QueueManager initialized successfully with ", this.queueBuffer.getChannelCount(), " channels\n");
            return true;
        } catch (error_) {
            error("Error initializing QueueManager: ", error_.message, "\n");
            this.queueBuffer = null;
            return false;
        }
    }

    /**
     * Handles changes to the buffer names
     * @param {string} qBufName - Name of the data buffer
     * @param {string} metaBufName - Name of the metadata buffer
     */
    _handleBuffersChange(qBufName = 'qbuf', metaBufName = 'metabuf') {
        post("Buffers changed to ", qBufName, " and ", metaBufName, "\n");
        // Initialize if queueBuffer is null
        if (!this.queueBuffer) {
            this._init(qBufName, metaBufName);
        } else {
            this._withQueueBuffer(queueBuffer => queueBuffer.setBuffers(qBufName, metaBufName));
        }
    }

    /**
     * Helper method to safely execute operations on the queue buffer
     * @param {Function} callback - Function to execute with the queue buffer
     * @returns {any} Result of the callback function
     */
    _withQueueBuffer(callback) {
        if (!this.queueBuffer) {
            error("Error: No buffers set. Please set buffers before calling this method.\n");
            return;
        }
        return callback(this.queueBuffer);
    }

    /**
     * Writes a value to the specified channel(s)
     * @param {number} channel - Channel to write to (0 for all channels)
     * @param {number} value - Value to write
     */
    handleWrite(channel, value) {
        this._withQueueBuffer(queueBuffer => queueBuffer.write(value, channel));
    }

    /**
     * Moves the write position backward
     * @param {number} channel - Channel to affect (0 for all channels)
     * @param {number} steps - Number of steps to move back
     */
    handleBack(channel = 0, steps = 1) {
        this._withQueueBuffer(queueBuffer => queueBuffer.advanceWritePosition(-steps, channel));
    }

    /**
     * Sets the loop length for the specified channel(s)
     * @param {number} channel - Channel to affect (0 for all channels)
     * @param {number} length - New loop length
     */
    handleLoopLength(channel = 0, length) {
        if (typeof length !== 'number' || length < 1) {
            error("Error: loop length must be a positive number\n");
            return;
        }
        this._withQueueBuffer(queueBuffer => queueBuffer.setLoopLength(length, channel));
    }

    /**
     * Sets the every value for the specified channel(s)
     * @param {number} channel - Channel to affect (0 for all channels)
     * @param {number} every - New every value
     */
    handleEvery(channel = 0, every) {
        if (typeof every !== 'number' || every < 1) {
            error("Error: every must be a positive number\n");
            return;
        }
        this._withQueueBuffer(queueBuffer => queueBuffer.setEvery(every, channel));
    }

    /**
     * Dumps the current state of the queue buffer to a dictionary
     */
    handleDump() {
        this._withQueueBuffer(queueBuffer => {
            let dump = queueBuffer.serialize();
            let d = new Dict();
            d.parse(JSON.stringify(dump));
            outlet(0, 'dictionary', d.name);
        });
    }

    /**
     * Handles unknown messages
     * @param {string} message - The unknown message name
     * @param {...any} args - Arguments passed with the message
     */
    _handleUnknownMessage(message, ...args) {
        error("Unknown message: ", message, "\n");
    }
}

// Create and export instance
const manager = new QueueManager();

// Export functions for Max
function init() { return manager.init(); }
function anything() { manager.anything(messagename, ...arrayfromargs(arguments)); }
function loadbang() { manager.init(); } 