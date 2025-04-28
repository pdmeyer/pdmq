// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const QueueBuffer = require('pdm.queue.js').QueueBuffer;
const MaxJsObject = require('pdm.maxjsobject.js').MaxJsObject;

class QueueReporter extends MaxJsObject {
    static get api() {
        return {
            parameters: {
                databuf: { type: 'string', required: true },
                readbuf: { type: 'string', required: true }
            },
            messages: {
                next: { handler: 'handleNext' },
                last: { handler: 'handleLast' },
                full: { handler: 'handleFull' },
                queue: { handler: 'handleQueue' },
                positions: { handler: 'handlePositions' },
                free: { handler: 'handleFree' }
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
            post("QueueBuffer initialized successfully with ", this.queueBuffer.channels, " channels\n");
            return true;
        } catch (error) {
            post("Error initializing QueueBuffer: ", error.message, "\n");
            return false;
        }
    }

    handleNext() {
        const nextValues = this.queueBuffer.getNext();
        nextValues.forEach((value, index) => {
            outlet(0, "next", index + 1, value);
        });
    }

    handleLast() {
        const lastValues = this.queueBuffer.getLast();
        lastValues.forEach((value, index) => {
            outlet(0, "last", index + 1, value);
        });
    }

    handleFull() {
        const fullBuffers = this.queueBuffer.getFullBuffer();
        fullBuffers.forEach((buffer, index) => {
            outlet(0, "full", index + 1, buffer);
        });
    }

    handleQueue() {
        const queues = this.queueBuffer.getQueueContents();
        queues.forEach((queue, index) => {
            if(queue.length > 0) {
                outlet(0, "queue", index + 1, queue);
            } else {
                outlet(0, "queue", index + 1, "none");
            }
        });
    }

    handlePositions() {
        const positions = this.queueBuffer.getPositions();
        outlet(0, 'positions', 'write', positions.write);
        outlet(0, 'positions', 'read', positions.read);
    }

    handleFree() {
        this.queueBuffer.free();
        this.queueBuffer = null;
        post("QueueBuffer freed\n");
    }

    bang() {
        this.handleQueue();
    }
}

// Create and export instance
const reporter = new QueueReporter();

// Export functions for Max
function init() { return reporter.init(); }
function anything() { reporter.anything(messagename, ...arrayfromargs(arguments)); }
function bang() { reporter.bang(); }
function loadbang() { reporter.init(); }