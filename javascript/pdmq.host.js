/**
 * @file pdmq.host.js
 * @description Host implementation for Max/MSP.
 * This module is designed to be used inside pdmq.maxpat. It provides
 * the interface for creating and managing queue buffers in Max.
 * 
 * @module pdmq.host
 * @requires pdmq.js
 */
"use strict";
autowatch = 1;

const QueueHostApi = require('./pdmq.js').QueueHostApi;

const api = new QueueHostApi(this);

function anything() { 
    api.anything(messagename, ...arrayfromargs(arguments)); 
}
function loadbang() { 
    api.init(); 
}     