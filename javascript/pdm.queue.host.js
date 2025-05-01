/**
 * @file pdm.queue.host.js
 * @description Provides a Max/MSP interface for the queue buffer system.
 * 
 * This module is designed to be used inside pdm.queue.maxpat. It provides
 * an interface for writing to the queues and for controlling the read/write positions, 
 * loop length, and every parameter.
 * 
 * @requires pdm.queue.js
 */

autowatch = 1;

const QueueHostApi = require('pdm.queue.js').QueueHostApi;

const api = new QueueHostApi(this);

function anything() { api.anything(messagename, ...arrayfromargs(arguments)); }
function loadbang() { api.init(); }     