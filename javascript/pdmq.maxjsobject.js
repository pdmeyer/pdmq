/**
 * @file pdm.maxjsobject.js
 * @description Base class for Max/MSP JavaScript objects with parameter and message handling.
 * Provides common functionality for parsing arguments, handling parameters, and routing messages.
 * 
 * This class serves as the foundation for Max/MSP JavaScript objects, providing:
 * - Argument parsing and validation
 * - Parameter management with callbacks
 * - Message routing and handling
 * - Signature-based argument mapping
 * 
 * @module pdm.maxjsobject  
 */

/**
 * Base class for Max/MSP JavaScript objects
 * @class
 */
"use strict";
class MaxJsObject {
    /**
     * Creates a new MaxJsObject instance
     * @constructor
     */
    constructor() {
        this.args = this._parseJsArgs();
        this.initialized = false;
        this._parameterCallbacks = new Map();
    }

    /**
     * API specification for the object
     * @static
     * @returns {Object} API configuration object
     */
    static get api() {
        return {
            parameters: {
                // Format: 'paramName': { 
                //     required: true|false, 
                //     default: value,
                //     parser: (value) => {return value}, // Optional parser function
                //     callback: 'methodName' // Optional callback method
                // }
            },
            messages: {
                // Format: 'messageName': { handler: 'methodName', parameters: ['param1', 'param2'] }
            },
            signatures: [
                // Format 1: Simple count-based mapping
                // {
                //     count: number, // Number of unaddressed arguments to match
                //     params: [paramName1, paramName2, ...] // Parameters to map to, in order
                // }
                // 
                // Format 2: Full signature with custom condition
                // {
                //     when: (args) => boolean, // Condition for when to apply this signature
                //     then: {
                //         mappings: {
                //             paramName: index // Map unaddressed argument at index to parameter
                //         },
                //         defaults: {
                //             paramName: value // Default values for parameters not in mappings
                //         }
                //     }
                // }
            ]
        };
    }

    /**
     * Static method to perform initial grouping of arguments
     * @static
     * @param {Array} argsArray - Array of arguments to parse
     * @returns {Object} Grouped arguments with unaddressed arguments
     */
    static getJsArgs() {
        const argsArray = jsarguments.slice(1);

        const groupedArgs = { unaddressed: [] };
        let currentKey = 'unaddressed';

        argsArray.forEach((arg) => {
            if (String(arg).indexOf('@') === 0) {
                //if there's only one arg for the last key, unwrap it from the array
                if(groupedArgs[currentKey].length === 1) {
                    groupedArgs[currentKey] = groupedArgs[currentKey][0];
                }
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

    /**
     * Instance method to handle signature-based argument mapping
     * @private
     * @param {Object} groupedArgs - Arguments grouped by key
     * @returns {Object} Updated grouped arguments with signature mappings applied
     */
    _applySignatures(groupedArgs) {
        if (!groupedArgs.unaddressed || groupedArgs.unaddressed.length === 0) {
            return groupedArgs;
        }

        const api = this.constructor.api;
        if (!api.signatures) {
            return groupedArgs;
        }

        // Find matching signature
        const matchingSignature = api.signatures.find(signature => {
            if (signature.count !== undefined) {
                return signature.count === groupedArgs.unaddressed.length;
            }
            return signature.when(groupedArgs);
        });

        if (!matchingSignature) {
            return groupedArgs;
        }

        if (matchingSignature.count !== undefined) {
            // Handle simple count-based mapping
            const paramValues = {};
            matchingSignature.params.forEach((paramName, index) => {
                if (index < groupedArgs.unaddressed.length) {
                    if (!paramValues[paramName]) {
                        paramValues[paramName] = [];
                    }
                    paramValues[paramName].push(groupedArgs.unaddressed[index]);
                }
            });
            
            // Apply the collected values
            Object.entries(paramValues).forEach(([paramName, values]) => {
                if (!groupedArgs[paramName]) {
                    groupedArgs[paramName] = values;
                }
            });
        } else {
            // Handle full signature with custom condition
            Object.entries(matchingSignature.then.mappings || {}).forEach(([paramName, index]) => {
                if (index < groupedArgs.unaddressed.length && !groupedArgs[paramName]) {
                    groupedArgs[paramName] = [groupedArgs.unaddressed[index]];
                }
            });

            Object.entries(matchingSignature.then.defaults || {}).forEach(([paramName, value]) => {
                if (!groupedArgs[paramName]) {
                    groupedArgs[paramName] = [value];
                }
            });
        }

        return groupedArgs;
    }

    _filterArgs(args) {
        const internalProps = new Set([
            'args',
            'initialized',
            '_parameterCallbacks'
        ]);

        const filteredArgs = {};
        Object.entries(args).forEach(([key, value]) => {
            if (!internalProps.has(key)) {
                filteredArgs[key] = value;
            }
        });

        return filteredArgs;
    }

    /**
     * Main method to parse JavaScript arguments
     * @returns {Object} Filtered and processed arguments
     */
    _parseJsArgs() {
        
        // Step 1: Initial grouping
        const groupedArgs = MaxJsObject.getJsArgs();
        
        // Step 2: Apply signatures
        const processedArgs = this._applySignatures(groupedArgs);

        // Step 3: Filter out internal properties
        return this._filterArgs(processedArgs);
    }

    /**
     * Initializes the object from arguments
     * @returns {boolean} True if initialization was successful
     */
    init() {
        if (this.initialized) return true;
        
        // Validate API configuration
        if (this.constructor.api) {
            const api = this.constructor.api;
            
            // Validate handlers in messages
            if (api.messages) {
                for (const [messageName, spec] of Object.entries(api.messages)) {
                    if (spec.handler) {
                        const handler = this[spec.handler];
                        if (typeof handler !== 'function') {
                            error(`Error: Handler '${spec.handler}' for message '${messageName}' is not a function\n`);
                            return false;
                        }
                    }
                }
            }
            
            // Validate handlers in parameters
            if (api.parameters) {
                for (const [paramName, spec] of Object.entries(api.parameters)) {
                    if (spec.handler) {
                        const handler = this[spec.handler];
                        if (typeof handler !== 'function') {
                            error(`Error: Handler '${spec.handler}' for parameter '${paramName}' is not a function\n`);
                            return false;
                        }
                    }
                }
            }
        }
        
        // Validate required parameters
        const requiredParams = Object.entries(this.constructor.api.parameters)
            .filter(([_, spec]) => spec.required)
            .map(([name]) => name);
            
        if (!this.checkRequiredArgs(requiredParams)) {
            error(`Error: Missing required parameters: ${requiredParams.join(', ')}\n`);
            return false;
        }

        // Set parameters from arguments and register callbacks
        Object.entries(this.constructor.api.parameters).forEach(([name, spec]) => {
            const value = this._getArg(name, spec.default);
            if (value !== null) {
                this[name] = value;
                // Register callback if specified
                if (spec.callback && typeof this[spec.callback] === 'function') {
                    this._parameterCallbacks.set(name, this[spec.callback].bind(this));
                }
            }
        });

        this.initialized = true;
        return this._init();
    }

    /**
     * Custom initialization hook for subclasses
     * @protected
     * @returns {boolean} True if initialization was successful
     */
    _init() {
        return true;
    }

    /**
     * Checks if all required arguments are present
     * @private
     * @param {Array<string>} requiredArgs - List of required argument names
     * @returns {boolean} True if all required arguments are present
     */
    checkRequiredArgs(requiredArgs) {
        for (const arg of requiredArgs) {
            if (!this.args[arg] || this.args[arg].length === 0) {
                error(`Error: Missing required argument @${arg}\n`);
                return false;
            }
        }
        return true;
    }

    /**
     * Gets a single argument value
     * @private
     * @param {string} argName - Name of the argument
     * @param {any} defaultValue - Default value if argument is not present
     * @returns {any} Argument value or default
     */
    _getArg(argName, defaultValue = null) {
        return this.args[argName] ? this.args[argName][0] : defaultValue;
    }

    /**
     * Gets all values for an argument
     * @private
     * @param {string} argName - Name of the argument
     * @returns {Array} Array of argument values
     */
    _getArgValues(argName) {
        return this.args[argName] || [];
    }

    /**
     * Handles parameter changes
     * @private
     * @param {string} paramName - Name of the parameter that changed
     * @param {...any} args - New parameter values
     */
    _handleParameterChange(paramName, ...args) {
        post('Parameter change detected for ', paramName, ' with values: ', args, '\n');
        
        // Get the parameter specification
        const paramSpec = this.constructor.api.parameters[paramName];
        
        // Apply parser function if defined
        let processedArgs = args;
        if (paramSpec && paramSpec.parser && typeof paramSpec.parser === 'function') {
            processedArgs = args.map(arg => paramSpec.parser(arg));
        }
        
        // Update the instance property with the processed value
        if (processedArgs.length === 1) {
            this[paramName] = processedArgs[0];
        } else {
            this[paramName] = processedArgs;
        }
        
        // Call the callback if one exists
        const callback = this._parameterCallbacks.get(paramName);
        if (callback) {
            post('Calling callback for ', paramName, '\n');
            callback(processedArgs);
        }
    }

    /**
     * Handles incoming messages
     * @param {string} message - Message name
     * @param {...any} args - Message arguments
     */
    anything(message, ...args) {
        const api = this.constructor.api;
        
        // Check if it's a parameter set
        if (message in api.parameters) {
            this._handleParameterChange(message, ...args);
            return;
        }

        // Check if it's a defined message
        if (message in api.messages) {
            const spec = api.messages[message];
            if (spec.parameters && args.length < spec.parameters.length) {
                error(`Error: Message ${message} requires ${spec.parameters.length} parameters\n`);
                return;
            }
            return this[spec.handler](...args);
        }

        // Handle unknown messages
        this._handleUnknownMessage(message, ...args);
    }

    /**
     * Handles unknown messages
     * @protected
     * @param {string} message - Unknown message name
     * @param {...any} args - Message arguments
     */
    _handleUnknownMessage(message, ...args) {
        error(`Unknown message: ${message}\n`);
    }

    static getObjectAttrs(varname) {
        const reserved = {
            "cpu": true, "cpumeasure": true, "dumpoutlet": true, "poll": true, 
            "autoexport": true, "exportfolder": true, "exportname": true, 
            "exportnotifier": true, "exportscript": true, "exportscriptargs": true, 
            "gen": true, "nocache": true, "t": true, "title": true, "hot": true
        };
            
            const mobj = this.patcher.getnamed(varname);
            if(!mobj) {
                error('object with varname', varname, 'not found\n')
                return;
            }
            const attrs = {};
            const attrnames = mobj.getattrnames();
            attrnames.forEach((name) => {
                if(!(mobj.maxclass === "gen~" && reserved[name])) {
                    attrs[name] = mobj.getattr(name);
                }
            })
            return attrs;
    }
}

exports.MaxJsObject = MaxJsObject;