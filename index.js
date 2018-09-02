#!/usr/bin/env node 

const { exit, cwd, env } = require('process');
const { execSync } = require('child_process');
const { complain, after } = require('./lib/utils');
const Waiter = require('./lib/waiter');
const Order = require('./lib/order');
const order = new Order();
const { host, port, command, quiet, timeout } = order.parseOrQuit();

Waiter.wait(host, port, command, quiet)
  .then(() => {
    if(command) {
      if(!quiet) console.log(`Running \`${command}\``);
      return execSync(command, { cwd: cwd(), stdio: 'inherit', env });
    }
  })
  .then(() => exit(0))
  .catch((e) => {
    if(command && e.status) exit(e.status);
    else complain(`unknown error: ${e.message}`);
  });

if(!quiet) console.log(`waiting for ${host}:${port} ${timeout ? `for ${timeout} ms.` : 'forever.'}`);
if(timeout) after(timeout).then(() => complain('timed out; no connection available'));
