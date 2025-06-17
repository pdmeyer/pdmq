// pdmq.reader.validateattrs.js
// validate attributes of a pdmq.reader object
// philip meyer 2025 / philip@inter-modal.com
"use strict";
outlets = 2;
const QueueBuffer = require('./pdmq.js').QueueBuffer;

//stored queue data to use for validating channel (i.e. channelcount)
let vdata = {}

//api
//queue name setter
function name(n) {
	if(n === vdata.name) return; //already set

	if(validateName(n)) {
		vdata.name = n;
		outlet(0, 'qbuf', vdata.qbufName);
		outlet(0, 'metabuf', vdata.metabufName);
		outlet(1, 'name', n);
	}
}

//queue channel setter
function channel(c) {
	//make sure a buffer is set
	if(!validateBufferIsSet()) return;

	//parse the channel as an integer
	c = parseInt(c);
	
	//move on if the channel is already set
	if(c === vdata.channel) return; 

	//make sure the channel is valid for buffer channelcount
	if(!validateChannel(c)) return;
	
	outlet(0, 'channel', c);
}

function mode(m) {
	outlet(0, 'mode', Boolean(m));
}

function anything() {
	error("pdmq.reader.validateattrs doesn't understand",messagename,"\n");
}

//helpers
function validateName(qname) {
	vdata = QueueBuffer.getValidationData(qname);
	if(!vdata.exists) {
		error('Failed to connect reader to queue. Either queue buffer', vdata.qbufName, 'or metadata buffer', vdata.metabufName, 'does not exist.\n')
		return false;
	}
	if(!vdata.isValid) {
		error('Failed to connect reader to queue. Queue buffer', vdata.qbufName, 'and metadata buffer', vdata.metaBufName, 'have an unequal number of channels.\n');
		return false;
	}
	return true;
}
validateName.local = 1;	

//validate that a buffer is set
function validateBufferIsSet() {
	if(Object.keys(vdata).length === 0) {
		error('Failed to set channel', c ,'. No queue buffer is currently set.\n')
		return false;
	}
	return true;
}

//validate the channel
function validateChannel(c) {
	if(isNaN(c)) {
		error('Error. Channel value', c, 'must be a number)\n');
		return false;
	}
	
	const chIsValid = QueueBuffer.validateChannelIndex(c, vdata.channelcount);
	
	if(!chIsValid) {
		error('Failed to set channel', c, '. Channel index is out of bounds.\n') 
		return false;
	}
	vdata.channel = c;
	return true;
}
validateChannel.local = 1;
