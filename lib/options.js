const { exit, argv: [,, ...cliParams] } = require('process');
/**
 * 
 */
class Opt {

  constructor(defaults={}) {
    this.opts = {
      quiet: ['-q', '--quiet'],
      help: ['-h', '--help'],
      timeout: ['-t', '--timeout'],
      combinedTimeout: ['--timeout=', '-t='],
    };

    this.seen = {};

    this.host = 'localhost';
    this.port = undefined;
    this.command = undefined;
    this.quiet = false;
    this.timeout = 200;

  
    if(defaults.opts) Object.assign(this.opts, defaults.opts);
    const settings = ['host', 'port', 'command', 'quiet', 'timeout'];
    settings.forEach((name) => {
      if(defaults.hasOwnProperty(name)) this[name] = defaults[name];
    });
  }

  static get USAGE() {
    return `
Usage:
  $cmdname [host]:port [-q] [-t <timeout>] [-- <command>[ <args>]]
  -h | --help                         This message
  -q | --quiet                        Do not output any status messages
  -t <timeout> | --timeout=<timeout>  Timeout in seconds, zero for no timeout
  -- <command> <args>                 Execute command with args after the test finishes
`;
  }

  usage() {
    console.error(Opt.USAGE);
    exit(1);
  }

  raise(msg) {
    throw new Error(msg);
  }

  isFlag(param, type) {
    if(!this.seen[type] && this.opts[type].includes(param)) {
      this.seen[type] = true;
      return true;
    }
    return false;
  }

  matchingTimeoutOpt(param) {
    const hits = this.opts.combinedTimeout.filter((possible) => param.startsWith(possible));
    if(hits.length > 1) throw new Error("Combined timeout options specification invalid.");
    else if(hits.length) {
      const timeout = param.replace(hits[0], '');
      if(timeout.length) return timeout;
      throw new Error(`Found a timeout flag, but not following millseconds (default: ${hits[0]}${this.timeout})`);
    }
    else return false;
  }

  isHelp(param) { return this.isFlag(param, 'help'); }

  isQuiet(param) { return this.isFlag(param, 'quiet'); }

  isTimeout (param) { return this.isFlag(param, 'timeout'); }

  isCombinedTimeout(param) {
    if(!this.seen.timeout && this.matchingTimeoutOpt(param)) {
      this.seen.timeout = true;
      return true;
    }
    return false;
  }

  parseOrQuit(givenParams=[]) {
    try {
      this.parse(givenParams);
    } catch (e) {
      console.log(e.message);
      this.usage();
    }
    return this;
  }

  parse(givenParams=[]) {
    const params = givenParams.length ? givenParams : cliParams; 
    while(params.length) {
      const param = params.shift();
      if(this.isHelp(param)) {
        this.usage();
      } else if(this.isQuiet(param)) {
        this.quiet = true;
      } else if(this.isTimeout(param)) {
        // next param should therefore be a value in millis
        if(params[0] && params[0].toString().match(/\d+/)) {
          this.timeout = parseInt(params.shift(), 10);
        } else {
          this.raise(`Found a timeout flag, but no following milliseconds (default: ${param} ${this.timeout})`);
        }
      } else if(this.isCombinedTimeout(param)) {
        this.timeout = parseInt(this.matchingTimeoutOpt(param), 10);
      } else if(param==='--') {
        // everything after this is a command to execute when we're done
        if(!params.length) this.raise('Found a standalone double dash, but no following command');
        this.command = params.join(' ');
        break; // no further parsing
      } else if(!this.seen.port) {
        this.seen.port = true;
        const [host, port] = param.split(':');
        if(host) this.host = host; // if it was ':8080' then we want to keep localhost
        this.port = parseInt(port, 10);
        if(!this.port) this.raise(`Found [<host>]:<port> of ${param}, but port cannot be empty or zero`);
        continue;
      } else {
        this.raise(`Found unknown argument: ${param}`);
      }
    }

    // By now we should definitely have seen a port.
    // Every other parameter has sane defaults.
    if(!this.seen.port) this.raise('Found no port for which to wait');

    return this;
  }
}


module.exports = Opt;
