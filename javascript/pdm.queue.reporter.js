// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const Queue = require('pdm.queue.js').Queue;

// Global variables
let qs = [];

// Initialize the Queue with arguments
function init() {
    const args = getJsArgsAsObject();
    // Check for required parameters
    if (!args.databuf || !args.readbuf) {
        post("Error: Missing required parameters. Usage: init @databuf <name> @readbuf <name> @datachan <number> [@readchan <number>] [@readix <number>]\n");
        return false;
    }
    const channels = args.channels[0] ? args.channels[0] : 1;
    let success = true;
    qs = [];
    for(let i = 1; i <= channels; i++) {
        try {
            // Create new Queue instance
            qs.push(new Queue(
                args.databuf[0],
                i,
                args.readbuf[0],
                i,
                args.readix ? args.readix[0] : 0
            ));
        post("Queue initialized successfully\n");
        success = true;

        } catch (error) {
            post("Error initializing queue ",i,": ", error.message, "\n");
            success = false;
        }
    }
    return success;
}

// Catch-all function for other messages
function anything() {
    if (qs.length == 0) {
        if(!init()) return;
    }
    
    const message = messagename;
    const args = arrayfromargs(arguments);  

    // Check if message is a property name
    if (message in qs[0]) {
        switch (message) {
            case "readix":
                qs.forEach(q => { q.readix = args[0]; });
                break;
            case "readbuf":
                qs.forEach(q => { q.setBuffer(message, args[0]); });
                break;
            case "databuf":
                qs.forEach(q => { q.setBuffer(message, args[0]); });
                break;
            default:
                post("Cannot set property:", message, "\n");
        }
        return;
    }

    // Handle method calls
    switch (message) {
        case "next":
            qs.forEach(q => { outlet(0, "next", q.getNext()); });
            break;

        case "last":
            qs.forEach(q => { outlet(0, "last", q.getLast()); });
            break;

        case "full":
            qs.forEach((q, index) => { outlet(0, "full", index, q.getFullBuffer()); });
            break;

        case "free":
            qs.forEach(q => { q.free(); });
            qs = [];
            post("Queue freed\n");
            break;

        default:
            post("Unknown message:", message, "\n");
    }
}

function getqueue() {
    qs.forEach((q, index) => {
        const queue = q.getQueue();
        const ix = index + 1
        if(queue.length > 0) {
            outlet(0, "queue", ix, queue);
        } else {
            outlet(0, "queue", ix, "none");
        }
    });
}

function getpositions() {
    let readPositions = [];
    let writePositions = [];
    qs.forEach((q, index) => {
        readPositions.push(q.getReadPosition());
        writePositions.push(q.getWritePosition());
        const ix = index + 1;
    })
    outlet(0, 'positions', 'write', writePositions)
    outlet(0, 'positions', 'read', readPositions)
}

function free() {
    if (qs.length > 0) {
        qs.forEach(q => { q.free(); });
        qs = [];
        post("Queue freed\n");
    }
}

function loadbang() {
    init();
}

function bang() {
    getqueue();
}

// Helper function to parse arguments into an object
function getJsArgsAsObject() {
    var argsArray = jsarguments.slice(1);
    var groupedArgs = { unaddressed: [] };
    var currentKey = 'unaddressed';

    argsArray.forEach(function (arg, index) {
        if (String(arg).indexOf('@') === 0) {
            currentKey = arg.substring(1);
            groupedArgs[currentKey] = [];
        } else {
            if (!groupedArgs[currentKey]) {
                groupedArgs[currentKey] = [];
            }
            groupedArgs[currentKey].push(arg);
        }
    });
    if (groupedArgs.unaddressed.length === 0) {
        delete groupedArgs.unaddressed;
    }
    return groupedArgs;
}

init();