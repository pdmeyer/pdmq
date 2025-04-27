// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const Queue = require('pdm.queue.js').Queue;

// Global variables
let queue = null;

// Initialize the Queue with arguments
function init() {
    const args = getJsArgsAsObject();
    
    // Check for required parameters
    if (!args.databuf || !args.readbuf || !args.datachan) {
        post("Error: Missing required parameters. Usage: init @databuf <name> @readbuf <name> @datachan <number> [@readchan <number>] [@readix <number>]\n");
        return false;
    }
    try {
        // Create new Queue instance
        queue = new Queue(
            args.databuf[0],
            args.datachan[0],
            args.readbuf[0],
            args.readchan[0] ? args.readchan[0] : args.datachan[0],
            args.readix ? args.readix[0] : 0
        );
        post("Queue initialized successfully\n");
        return true;
    } catch (error) {
        post("Error initializing Queue:", error.message, "\n");
        return false;
    }
}

// Catch-all function for other messages
function anything() {
    if (!queue) {
        // post("Error: Queue not initialized. Send 'init' message first.\n");
        if(!init()) return;
    }
    
    const message = messagename;
    const args = arrayfromargs(arguments);  

    // Check if message is a property name
    if (message in queue) {
        switch (message) {
            case "datachan":
                if (args[0] >= queue.databuf.channelcount()) {
                    post(`Error: Channel ${args[0]} is out of range\n`);
                    return;
                }
                queue.dataChannel = args[0];
                break;
            case "readchan":
                if (args[0] >= queue.readbuf.channelcount()) {
                    post(`Error: Channel ${args[0]} is out of range\n`);
                    return;
                }
                queue.readChannel = args[0];
                break;
            case "readix":
                queue.readix = args[0];
                break;
            case "readbuf":
                queue.setBuffer(message, args[0]);
                break;
            case "databuf":
                queue.setBuffer(message,args[0]);
                break;
            default:
                post("Cannot set property:", message, "\n");
        }
        queue();
        return;
    }

    // Handle method calls
    switch (message) {
        case "next":
            outlet(0, "next", queue.getNext());
            break;

        case "last":
            outlet(0, "last", queue.getLast());
            break;

        case "queue":
            const q = queue.getQueue();
            if(q.length > 0) {
                outlet(0, "queue", q);
            } else {
                outlet(0, "queue", "none");
            }
            break;

        case "full":
            outlet(0, "full", queue.getFullBuffer());
            break;

        case "free":
            queue.free();
            queue = null;
            post("Queue freed\n");
            break;

        default:
            post("Unknown message:", message, "\n");
    }
}

// Clean up when the js object is deleted
function notifydeleted() {
    if (queue) {
        queue.free();
        queue = null;
    }
}

function loadbang() {
    init();
}

function bang() {
    queue.getQueue();
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