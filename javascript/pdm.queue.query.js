// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const Queue = require('pdm.queue.js').Queue;
const MaxJsObject = require('pdm.maxjsobject.js').MaxJsObject;

class QueueQuery extends MaxJsObject {
    static get api() {
        return {
            parameters: {
                databuf: { type: 'string', required: true },
                readbuf: { type: 'string', required: true },
                datachan: { type: 'number', required: true },
                readchan: { type: 'number', required: false, default: null },
                readix: { type: 'number', required: false, default: 0 }
            },
            messages: {
                next: { handler: '_next' },
                last: { handler: '_last' },
                queue: { handler: '_queue' },
                full: { handler: '_full' },
                free: { handler: '_free' }
            }
        };
    }

    constructor() {
        super();
        this.queue = null;
    }

    _init() {
        try {
            // Use datachan as readchan if not specified
            const readChannel = this.readchan || this.datachan;
            
            // Create new Queue instance
            this.queue = new Queue(
                this.databuf,
                this.datachan,
                this.readbuf,
                readChannel,
                this.readix
            );
            post("Queue initialized successfully\n");
            return true;
        } catch (error) {
            post("Error initializing Queue: ", error.message, "\n");
            return false;
        }
    }

    _next() {
        outlet(0, "next", this.queue.getNext());
    }

    _last() {
        outlet(0, "last", this.queue.getLast());
    }

    _queue() {
        const q = this.queue.getQueue();
        if(q.length > 0) {
            outlet(0, "queue", q);
        } else {
            outlet(0, "queue", "none");
        }
    }

    _full() {
        outlet(0, "full", this.queue.getFullBuffer());
    }

    _free() {
        this.queue.free();
        this.queue = null;
        post("Queue freed\n");
    }

    bang() {
        this._queue();
    }

    // Override parameter setting to handle channel validation
    _handleParameterSet(name, value) {
        if (name === 'datachan' || name === 'readchan') {
            if (!this.queue) return;
            const buffer = name === 'datachan' ? this.queue.databuf : this.queue.readbuf;
            if (value >= buffer.channelcount()) {
                post(`Error: Channel ${value} is out of range\n`);
                return;
            }
        }
        super._handleParameterSet(name, value);
    }

    // Clean up when the js object is deleted
    notifydeleted() {
        if (this.queue) {
            this.queue.free();
            this.queue = null;
        }
    }
}

// Create and export instance
const query = new QueueQuery();

// Export functions for Max
function init() { return query.init(); }
function anything() { query.anything(messagename, ...arrayfromargs(arguments)); }
function bang() { query.bang(); }
function loadbang() { query.init(); }
function notifydeleted() { query.notifydeleted(); }