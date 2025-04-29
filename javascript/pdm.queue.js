/**
 * @file pdm.queue.js
 * @description Core queue buffer implementation for Max/MSP.
 * This module provides the fundamental queue buffer functionality used by pdm.queue.manager.
 * It implements a multi-channel buffer system with synchronized data and metadata buffers.
 * 
 * The module contains two main classes:
 * - Queue: Manages a single channel's queue with read/write positions and loop behavior
 * - QueueBuffer: Manages multiple Queue instances for multi-channel operation
 * 
 * Requires that buffers are created in the parent patch with the same number of channels: 
 * - qbuf: queue buffer that holds the queues
 * - metabuf: metadata buffer that holds the read/write positions, loop length, and every value
 * 
 * 
 * @module pdm.queue
 */

class  Queue {
    constructor(qBufName, metaBufName, channel) {
        this.qbuf = null;
        this.metabuf = null;
        this.setBuffers(qBufName, metaBufName);

        this.channel = Math.max(channel, 1); // Buffer API uses 1-based channel indexing

        // Initialize reader properties in read buffer
        this.setLoopLength(1);  // Default to no looping
        this.setEvery(1);       // Default to advancing every impulse
    }

    // Get the every value from the read buffer
    getEvery() {
        return this.metabuf.peek(this.channel, 2, 1);
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
        return this.qbuf.peek(this.channel, Math.min((readPos + 1), writePos) % (this.getBufferSize() - 1), 1);
    }

    // Get the last value read (at read head position)
    getLast() {
        const readPos = this.getReadPosition();
        return this.qbuf.peek(this.channel, readPos % (this.getBufferSize() - 1), 1);
    }

    // Get all remaining values in the queue
    getQueue() {
        const readPos = this.getReadPosition();
        const writePos = this.getWritePosition();
        const readCycle = Math.floor(readPos / (this.getBufferSize() - 1));
        const writeCycle = Math.floor(writePos / (this.getBufferSize() - 1));
        let queueLength = 0;

        let queue = []

        if(!(readPos == 0 && writePos == 0 && readCycle ==  0 && writeCycle == 0)) {
            if(readCycle == writeCycle) {
                queueLength = Math.min(Math.max(writePos - readPos + 1, 1), this.getBufferSize() - 1) - 1;
                queue = this.qbuf.peek(this.channel, readPos % (this.getBufferSize() - 1), queueLength);
            } else {
                queueLength = (readCycle + 1) * (this.getBufferSize() - 1) - readPos;
                queue = this.qbuf.peek(this.channel, readPos % (this.getBufferSize() - 1), queueLength);
                if(!Array.isArray(queue)) queue = [queue];
                queueLength = (writePos + 1) % (this.getBufferSize() - 1);
                queue = queue.concat(this.qbuf.peek(this.channel, 0, queueLength));
            }
        }
        if(!Array.isArray(queue)) queue = [queue];
        return queue
    }

    // Get all values in the buffer
    getFullBuffer() {
        // Get all values except the last frame which contains write position
        return this.qbuf.peek(this.channel, 0, this.getBufferSize() - 1);
    }

    /**
     * Validates that both buffers exist and have matching channel counts
     * @param {Buffer} qbuf - Queue buffer to validate
     * @param {Buffer} metabuf - Metadata buffer to validate
     * @param {string} qBufName - Name of the queue buffer (for error messages)
     * @param {string} metaBufName - Name of the metadata buffer (for error messages)
     * @returns {boolean} True if buffers are valid, false otherwise
     * @static
     */
    static validateBuffers(qbuf, metabuf, qBufName, metaBufName) {
        // Check if buffers exist
        if (qbuf.channelcount() === -1) {
            error("Error: Queue buffer '", qBufName, "' does not exist\n");
            return false;
        }

        if (metabuf.channelcount() === -1) {
            error("Error: Metadata buffer '", metaBufName, "' does not exist\n");
            return false;
        }

        // Check if channel counts match
        if (qbuf.channelcount() !== metabuf.channelcount()) {
            error("Error: qbuf and metabuf must have the same number of channels\n");
            return false;
        }

        return true;
    }

    /**
     * Updates the buffer names
     * @param {string} qBufName - New data buffer name
     * @param {string} metaBufName - New metadata buffer name
     */
    setBuffers(qBufName, metaBufName) {
        let _tempQBuf = new Buffer(qBufName);
        let _tempMetaBuf = new Buffer(metaBufName);

        if (!Queue.validateBuffers(_tempQBuf, _tempMetaBuf, qBufName, metaBufName)) {
            return;
        }

        this.qbuf = _tempQBuf;
        this.metabuf = _tempMetaBuf;
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
        return this.metabuf.peek(this.channel, 0, 1);
    }

    // Get the loop length from the read buffer
    getLoopLength() {
        return this.metabuf.peek(this.channel, 1, 1);
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

    serialize() {
        const data = {
            size: this.getBufferSize(),
            channel: this.channel,
            read: this.getReadPosition(),
            write: this.getWritePosition(),
            loopLength: this.getLoopLength(),
            every: this.getEvery()
        };
        return data;
    }

    // Clean up when done
    free() {
        this.qbuf.freepeer();
        this.metabuf.freepeer();
    }
} 

/**
 * Manages a collection of queues for a multi-channel buffer system.
 * Handles synchronization between data and metadata buffers across multiple channels.
 */
class QueueBuffer {
    /**
     * Creates a new QueueBuffer instance
     * @param {string} qbufName - Name of the data buffer
     * @param {string} metabufName - Name of the metadata buffer
     */
    constructor(qbufName, metabufName) {
        this.qBufName = qbufName;
        this.metaBufName = metabufName;
        this.qbuf = null;
        this.metabuf = null;
        this.queues = [];
        
        // Initialize buffers and queues
        if (!this.setBuffers(qbufName, metabufName)) {
            // If initialization fails, set queues to empty array
            this.queues = [];
            return;
        }
    }

    /**
     * Updates the queue collection to match the current buffer channel count
     * @private
     */
    _updateQueues() {
        const qbufChannels = this.qbuf.channelcount();
        const metabufChannels = this.metabuf.channelcount();
        
        if (qbufChannels !== metabufChannels) {
            error("Error: qbuf and metabuf must have the same number of channels\n");
            return;
        }

        post("Updating queues to match ", qbufChannels, " channels\n");
        
        // Remove excess queues if we have too many
        while (this.queues.length > qbufChannels) {
            this.queues.pop();
        }
        
        // Add new queues if we need more
        while (this.queues.length < qbufChannels) {
            const queue = new Queue(this.qBufName, this.metaBufName, this.queues.length + 1);
            post("Created queue ", this.queues.length + 1, "\n");
            this.queues.push(queue);
        }
        
        post("QueueBuffer now has ", this.queues.length, " queues\n");
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

    /**
     * Gets a specific queue by channel number
     * @param {number} channel - Channel number (1-based)
     * @returns {Queue} The queue for the specified channel
     */
    getQueue(channel) {
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
    getQueueContents(channel = 0) {
        if (channel !== 0) {
            return this.getQueue(channel).getQueue();
        }
        return this.queues.map(q => q.getQueue());
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
     * Sets the loop length(s)
     * @param {number} length - New loop length
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setLoopLength(length, channel = 0) {
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
     * Sets the every value(s)
     * @param {number} every - New every value
     * @param {number} channel - Channel to set (0 for all channels)
     */
    setEvery(every, channel = 0) {
        if (channel !== 0) {
            this.getQueue(channel).setEvery(every);
        } else {
            this.queues.forEach(q => q.setEvery(every));
        }
    }

    /**
     * Updates the buffer names and reinitializes queues
     * @param {string} qBufName - New data buffer name
     * @param {string} metaBufName - New metadata buffer name
     * @returns {boolean} True if buffers were set successfully, false otherwise
     */
    setBuffers(qBufName, metaBufName) {
        let _tempQBuf = new Buffer(qBufName);
        let _tempMetaBuf = new Buffer(metaBufName);

        if (!Queue.validateBuffers(_tempQBuf, _tempMetaBuf, qBufName, metaBufName)) {
            return false;
        }
        
        this.qBufName = qBufName;
        this.metaBufName = metaBufName;
        this.qbuf = _tempQBuf;
        this.metabuf = _tempMetaBuf;
        
        // Update queue count to match new buffer
        this._updateQueues();
        return true;
    }

    /**
     * Writes a value to the specified channel(s)
     * @param {number} value - Value to write
     * @param {number} channel - Channel to write to (0 for all channels)
     */
    write(value, channel = 0) {
        if (channel !== 0) {
            this.queues[channel - 1].write(value);
        } else {
            this.queues.forEach(q => q.write(value));
        }
    }

    /**
     * Serializes the current state of the queue buffer
     * @returns {Object} Serialized state
     */
    serialize() {
        return {
            qBufName: this.qBufName,
            metaBufName: this.metaBufName,
            size: this.getBufferSize(),
            channels: this.getChannelCount(),
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
}

exports.Queue = Queue;
exports.QueueBuffer = QueueBuffer;