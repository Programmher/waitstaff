#!/usr/bin/env node 

const { exit } = require('process');
const { complain, after } = require('./lib/utils');
const waiter = require('./lib/waiter');
const Opts = require('./lib/options');
const opts = new Opts();
const { host, port, command, quiet, timeout } = opts.parseOrQuit();

waiter(host, port, command, quiet)
  .then(() => exit(0))
  .catch((e) => {
    if(command && e.status) exit(e.status);
    else complain(`unknown error: ${e.message}`);
  });

if(!quiet) console.log(`waiting for ${host}:${port} ${timeout ? `for ${timeout} ms.` : 'forever.'}`);
if(timeout) after(timeout).then(() => complain('timed out; no connection available'));
