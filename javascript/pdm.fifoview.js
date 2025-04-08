class  FifoView {
    constructor(dataBufferName, dataChannel, readBufferName, readChannel, readBufferIndex = 0) {
        this.databuf = new Buffer(dataBufferName);
        this.readbuf = new Buffer(readBufferName);

        //get buffer dimensions
        this.bufferSize = this.databuf.framecount();

        this.dataChannel = Math.max(dataChannel, 1); // Buffer API uses 1-based channel indexing
        this.readChannel = Math.max(readChannel, 1); // Buffer API uses 1-based channel indexing
        this.readix = Math.max(Math.min(readBufferIndex, this.readbuf.framecount()-1), 0);   
    }

    // Get the write position from the last slot
    getWritePosition() {
        // Read the last frame of the channel
        return this.databuf.peek(this.dataChannel, this.bufferSize-1, 1); 
    }

    // Get the read position from the read buffer
    getReadPosition() {
        const writePos = this.getWritePosition();
        return this.readbuf.peek(this.readChannel, this.readix, 1);
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
                queueLength = Math.min(Math.max(writePos - readPos + 1, 1), this.bufferSize - 1);
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
        // Use peek to get all values at once for better performance
        // Clamp to minimum of 1 since read head always has a value
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

    // Clean up when done
    free() {
        this.databuf.freepeer();
        this.readbuf.freepeer();
    }
} 

exports.FifoView = FifoView;