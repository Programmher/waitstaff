#!/usr/bin/env node 

const { Socket } = require('net');
const { exit, argv, cwd, env } = require('process');
const { execSync } = require('child_process');
const [,, ...params] = argv;
const USAGE = `
Usage:
  $cmdname host:port [-t timeout] [-- command args]
  -q | --quiet                        Do not output any status messages
  -t timeout | --timeout=timeout      Timeout in seconds, zero for no timeout
  -- COMMAND ARGS                     Execute command with args after the test finishes
`;

const timeoutLongOpt = '--timeout';
let port;
let command;
let host = 'localhost';
let ms = 200;
let quiets = ['-q', '--quiet'];
let timeouts = ['-t', timeoutLongOpt];
let note = (msg, type='log') => console[type](msg);
const timeoutAt = (millis) => { [timeouts, ms] = [[], parseInt(millis, 10)]; };
const after = ms => new Promise(resolve => setTimeout(resolve, ms));
const complain = (msg) => {
  note(msg, 'error');
  exit(1);
};
const usage = () => {
  complain(USAGE);
};

while(params.length) {
    const param = params.shift();
    if(quiets.includes(param)) {
      note = () => false;
      quiets = [];
    } else if(timeouts.includes(param)) {
      // next param should therefore be a value in millis
      if(params.length && params[0].match(/\d+/)) {
        timeoutAt(params.shift());
      } else {
        usage();
      }
    } else if(param.startsWith(`${timeoutLongOpt}=`)) {
      timeoutAt(param.replace(`${timeoutLongOpt}=`, ''));
    } else if(param==='--') {
      // everything after this is a command to execute when we're done
      if(!params.length) usage();
      command = params.join(' ');
      break;
    } else {
      [host, port] = param.split(':');
      port = parseInt(port, 10);
      if(host && port) continue;
      usage();
    }
}

// By now we should definitely have a port.
// Every other parameter has sane defaults.
if(!port) usage();

const main = async (host, port, command) => {

  const canConnect = async () => {
    return new Promise((resolve, reject) => {
      const connection = (new Socket()).connect(port, host);
      connection.on('connect', () => resolve(true));
      connection.on('error', reject);
    });
  };

  while(true) {
    try {
      if(await canConnect()) break;
    } catch (e) {}
    await after(50);
  }

  if(command) {
    try {
    console.log(command);
    execSync(command, { cwd: cwd(), stdio: 'inherit', env });
    } catch(e) {
      console.error(e);
    }
  }
};

main(host, port, command).then(() => exit(0)).catch(() => complain('unknown error'));

note(`waiting for ${host}:${port} ${ms ? `for ${ms} ms.` : 'forever.'}`);
if(ms) after(ms).then(() => complain('timed out; no connection available'));

