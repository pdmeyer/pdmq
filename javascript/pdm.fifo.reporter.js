// Set up inlets and outlets
inlets = 1;
outlets = 1;
autowatch = 1;

const FifoView = require('pdm.fifoview.js').FifoView;

// Global variables
let views = [];

// Initialize the FifoView with arguments
function init() {
    const args = getJsArgsAsObject();
    // Check for required parameters
    if (!args.databuf || !args.readbuf) {
        post("Error: Missing required parameters. Usage: init @databuf <name> @readbuf <name> @datachan <number> [@readchan <number>] [@readix <number>]\n");
        return false;
    }
    const channels = args.channels[0] ? args.channels[0] : 1;
    let success = true;
    views = [];
    for(let i = 1; i <= channels; i++) {
        try {
            // Create new FifoView instance
            views.push(new FifoView(
                args.databuf[0],
                i,
                args.readbuf[0],
                i,
                args.readix ? args.readix[0] : 0
            ));
        post("FifoView initialized successfully\n");
        success = true;

        } catch (error) {
            post("Error initializing view ",i,": ", error.message, "\n");
            success = false;
        }
    }
    post('views.length', views.length, '\n');
    return success;
}

// Catch-all function for other messages
function anything() {
    if (views.length == 0) {
        if(!init()) return;
    }
    
    const message = messagename;
    const args = arrayfromargs(arguments);  

    // Check if message is a property name
    if (message in views[0]) {
        switch (message) {
            case "readix":
                views.forEach(view => { view.readix = args[0]; });
                break;
            case "readbuf":
                views.forEach(view => { view.setBuffer(message, args[0]); });
                break;
            case "databuf":
                views.forEach(view => { view.setBuffer(message, args[0]); });
                break;
            default:
                post("Cannot set property:", message, "\n");
        }
        return;
    }

    // Handle method calls
    switch (message) {
        case "next":
            views.forEach(view => { outlet(0, "next", view.getNext()); });
            break;

        case "last":
            views.forEach(view => { outlet(0, "last", view.getLast()); });
            break;

        case "full":
            views.forEach((view, index) => { outlet(0, "full", index, view.getFullBuffer()); });
            break;

        case "free":
            views.forEach(view => { view.free(); });
            views = [];
            post("FifoView freed\n");
            break;

        default:
            post("Unknown message:", message, "\n");
    }
}

function queue() {
    views.forEach((view, index) => {
        const q = view.getQueue();
        const ix = index + 1
        if(q.length > 0) {
            outlet(0, "queue", ix, q);
        } else {
            outlet(0, "queue", ix, "none");
        }
    });
}

function free() {
    if (views.length > 0) {
        views.forEach(view => { view.free(); });
        views = [];
        post("FifoView freed\n");
    }
}

function loadbang() {
    init();
}

function bang() {
    queue();
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