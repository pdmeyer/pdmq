outlets = 2;
const QueueBuffer = require('pdm.queue.js').QueueBuffer;

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
	c = parseInt(c);
	
	if(c === vdata.channel) return; //already set

	if(validateChannel(c)) {
		outlet(0, 'channel', c);
	}
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

function validateChannel(c) {
	if(!isNum(c)) {
		error('Error. Channel value', c, 'must be a number)\n');
		return false;
	}
	
	if(Object.keys(vdata).length === 0) {
		error('Failed to set channel', c ,'. No queue buffer is currently set.\n')
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

function checkIsInitialized() {
	if(vdata.isValid && vdata.channelcount > 0 && vdata.channel !== undefined) {
		return true;
	}
	return false;
}

const isNum = n =>
	typeof n === 'number' && !isNaN(n);

