class  Queue {
    constructor(dataBufferName, dataChannel, readBufferName, readChannel) {
        this.databuf = new Buffer(dataBufferName);
        this.readbuf = new Buffer(readBufferName);

        //get buffer dimensions
        this.bufferSize = this.databuf.framecount();

        this.dataChannel = Math.max(dataChannel, 1); // Buffer API uses 1-based channel indexing
        this.readChannel = Math.max(readChannel, 1); // Buffer API uses 1-based channel indexing

        // Initialize reader properties in read buffer
        this.setLoopLength(1);  // Default to no looping
        this.setEvery(1);       // Default to advancing every impulse
    }

    // Get the write position from the last slot
    getWritePosition() {
        // Read the last frame of the channel
        return this.databuf.peek(this.dataChannel, this.bufferSize-1, 1); 
    }

    // Get the read position from the read buffer
    getReadPosition() {
        return this.readbuf.peek(this.readChannel, 0, 1);
    }

    // Get the loop length from the read buffer
    getLoopLength() {
        return this.readbuf.peek(this.readChannel, 1, 1);
    }

    // Get the every value from the read buffer
    getEvery() {
        return this.readbuf.peek(this.readChannel, 2, 1);
    }

    // Set the loop length in the read buffer
    setLoopLength(length) {
        this.readbuf.poke(this.readChannel, 1, length);
    }

    // Set the every value in the read buffer
    setEvery(every) {
        this.readbuf.poke(this.readChannel, 2, every);
    }

    // Get the next value in the queue (to the right of read head)
    getNext() {
        const readPos = this.getReadPosition();
        const writePos = this.getWritePosition();
        return this.databuf.peek(this.dataChannel, Math.min((readPos + 1), writePos) % (this.bufferSize - 1), 1);
    }

    // Get the last value read (at read head position)
    getLast() {
        const readPos = this.getReadPosition();
        return this.databuf.peek(this.dataChannel, readPos % (this.bufferSize - 1), 1);
    }

    // Get all remaining values in the queue
    getQueue() {
        const readPos = this.getReadPosition();
        const writePos = this.getWritePosition();
        const readCycle = Math.floor(readPos / (this.bufferSize - 1));
        const writeCycle = Math.floor(writePos / (this.bufferSize - 1));
        let queueLength = 0;

        let queue = []

        if(!(readPos == 0 && writePos == 0 && readCycle ==  0 && writeCycle == 0)) {
            if(readCycle == writeCycle) {
                queueLength = Math.min(Math.max(writePos - readPos + 1, 1), this.bufferSize - 1) - 1;
                queue = this.databuf.peek(this.dataChannel, readPos % (this.bufferSize - 1), queueLength);
            } else {
                queueLength = (readCycle + 1) * (this.bufferSize - 1) - readPos;
                queue = this.databuf.peek(this.dataChannel, readPos % (this.bufferSize - 1), queueLength);
                if(!Array.isArray(queue)) queue = [queue];
                queueLength = (writePos + 1) % (this.bufferSize - 1);
                queue = queue.concat(this.databuf.peek(this.dataChannel, 0, queueLength));
            }
        }
        if(!Array.isArray(queue)) queue = [queue];
        return queue
    }

    // Get all values in the buffer
    getFullBuffer() {
        // Get all values except the last frame which contains write position
        return this.databuf.peek(this.dataChannel, 0, this.bufferSize - 1);
    }

    setBuffer(buffer, bufferName) {
        this[buffer] = new Buffer(bufferName);
    }
  
    setWritePosition(position) {
        this.databuf.poke(this.dataChannel, this.bufferSize-1, position);
    }

    advanceWritePosition(steps = 1) {
        this.setWritePosition(this.getWritePosition() + steps);
    }

    setReadPosition(position) {
        this.readbuf.poke(this.readChannel, 0, position);
    }

    advanceReadPosition(steps = 1) {
        this.setReadPosition(this.getReadPosition() + steps);
    }

    // Clean up when done
    free() {
        this.databuf.freepeer();
        this.readbuf.freepeer();
    }
} 

class QueueBuffer {
    constructor(databufName, readbufName) {
        this.databuf = new Buffer(databufName);
        this.readbuf = new Buffer(readbufName);
        this.bufferSize = this.databuf.framecount();
        this.channels = this.databuf.channelcount();

        this.queues = [];
        for(let i = 0; i < this.channels; i++) {
            this.queues.push(new Queue(databufName, i+1, readbufName, i+1));
        }
    }

    getQueue(channel) {
        return this.queues[channel - 1];
    }

    getNext(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getNext();
        }
        return this.queues.map(q => q.getNext());
    }

    getLast(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getLast();
        }
        return this.queues.map(q => q.getLast());
    }

    getQueueContents(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getQueue();
        }
        return this.queues.map(q => q.getQueue());
    }

    getFullBuffer(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getFullBuffer();
        }
        return this.queues.map(q => q.getFullBuffer());
    }

    getPositions() {
        return {
            read: this.queues.map(q => q.getReadPosition()),
            write: this.queues.map(q => q.getWritePosition())
        };
    }

    setReadPosition(position, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).setReadPosition(position);
        } else {
            this.queues.forEach(q => q.setReadPosition(position));
        }
    }

    setWritePosition(position, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).setWritePosition(position);
        } else {
            this.queues.forEach(q => q.setWritePosition(position));
        }
    }

    advanceReadPosition(steps = 1, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).advanceReadPosition(steps);
        } else {
            this.queues.forEach(q => q.advanceReadPosition(steps));
        }
    }

    advanceWritePosition(steps = 1, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).advanceWritePosition(steps);
        } else {
            this.queues.forEach(q => q.advanceWritePosition(steps));
        }
    }

    // New methods for reader properties
    getLoopLength(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getLoopLength();
        }
        return this.queues.map(q => q.getLoopLength());
    }

    setLoopLength(length, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).setLoopLength(length);
        } else {
            this.queues.forEach(q => q.setLoopLength(length));
        }
    }

    getEvery(channel = null) {
        if (channel !== null) {
            return this.getQueue(channel).getEvery();
        }
        return this.queues.map(q => q.getEvery());
    }

    setEvery(every, channel = null) {
        if (channel !== null) {
            this.getQueue(channel).setEvery(every);
        } else {
            this.queues.forEach(q => q.setEvery(every));
        }
    }

    setBuffer(buffer, bufferName) {
        this.queues.forEach(q => q.setBuffer(buffer, bufferName));
    }

    free() {
        this.queues.forEach(q => q.free());
        this.queues = [];
    }
}

exports.Queue = Queue;
exports.QueueBuffer = QueueBuffer;