// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const QueueBuffer = require('pdm.queue.js').QueueBuffer;
const MaxJsObject = require('pdm.maxjsobject.js').MaxJsObject;

class QueueManager extends MaxJsObject {
    static get api() {
        return {
            parameters: {
                databuf: { type: 'string', required: true },
                readbuf: { type: 'string', required: true }
            },
            messages: {
                back: { 
                    handler: 'handleBack',
                    parameters: ['channel?', 'steps?']  // Optional parameters
                },
                looplen: {
                    handler: 'handleLoopLength',
                    parameters: ['channel?', 'length']
                },
                every: {
                    handler: 'handleEvery',
                    parameters: ['channel?', 'every']
                }
            }
        };
    }

    constructor() {
        super();
        this.queueBuffer = null;
    }

    _init() {
        try {
            this.queueBuffer = new QueueBuffer(
                this.databuf,
                this.readbuf
            );
            post("QueueManager initialized successfully with ", this.queueBuffer.channels, " channels\n");
            return true;
        } catch (error) {
            post("Error initializing QueueManager: ", error.message, "\n");
            return false;
        }
    }

    // Handle incoming lists (position, value)
    list(position, value) {
        if (!this.queueBuffer) {
            if(!this.init()) return;
        }

        // Write to all channels by default
        this.queueBuffer.queues.forEach(queue => {
            queue.setWritePosition(position);
            queue.databuf.poke(queue.dataChannel, position, value);
        });
    }

    // Handle back command
    handleBack(channel = null, steps = 1) {
        if (!this.queueBuffer) {
            if(!this.init()) return;
        }

        if (channel !== null) {
            // Move back on specific channel
            const queue = this.queueBuffer.getQueue(channel);
            queue.advanceWritePosition(-steps);
        } else {
            // Move back on all channels
            this.queueBuffer.advanceWritePosition(-steps);
        }
    }

    // Handle loop length setting
    handleLoopLength(channel = null, length) {
        if (!this.queueBuffer) {
            if(!this.init()) return;
        }

        if (typeof length !== 'number' || length < 1) {
            post("Error: loop length must be a positive number\n");
            return;
        }

        this.queueBuffer.setLoopLength(length, channel);
    }

    // Handle every setting
    handleEvery(channel = null, every) {
        if (!this.queueBuffer) {
            if(!this.init()) return;
        }

        if (typeof every !== 'number' || every < 1) {
            post("Error: every must be a positive number\n");
            return;
        }

        this.queueBuffer.setEvery(every, channel);
    }

    // Handle unknown messages
    _handleUnknownMessage(message, ...args) {
        // Try to parse as position, value pair
        if (args.length >= 2 && typeof args[0] === 'number') {
            this.list(args[0], args[1]);
            return;
        }
        super._handleUnknownMessage(message, ...args);
    }
}

// Create and export instance
const manager = new QueueManager();

// Export functions for Max
function init() { return manager.init(); }
function anything() { manager.anything(messagename, ...arrayfromargs(arguments)); }
function list() { manager.list(...arrayfromargs(arguments)); }
function loadbang() { manager.init(); } 