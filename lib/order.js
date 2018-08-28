const { exit, argv: [,, ...cliParams] } = require('process');
/**
 * 
 */

const COMMAND_SEPARATOR = '--';

class Order {

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
    console.error(Order.USAGE);
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

  isHelp(param) { return this.isFlag(param, 'help'); }

  isQuiet(param) { return this.isFlag(param, 'quiet'); }

  isTimeout(param) { return this.isFlag(param, 'timeout'); }

  isCombinedTimeout(param) {
    if(!this.seen.timeout && this.matchingTimeoutOpt(param).length) {
      this.seen.timeout = true;
      return true;
    }
    return false;
  }

  raiseMissingMilliseconds(matchingDefault) {
    this.raise(`Found a timeout flag, but no following milliseconds (default: ${matchingDefault})`);
  }

  matchingTimeoutOpt(param) {
    const hits = this.opts.combinedTimeout.filter((possible) => param.startsWith(possible));
    if(hits.length > 1) this.raise("Combined timeout options specification invalid.");
    else if(hits.length) return [param.slice(hits[0].length), hits[0]];

    return [];
  }

  validateTimeout(millis='', param='--timeout=') {
    if(!millis.length || !millis.toString().match(/\d+/)) {
      this.raiseMissingMilliseconds(`${param}${this.timeout}`);
    }
    return parseInt(millis, 10);
  }

  parseCommand(params) {
    if(!params.length) this.raise('Found a standalone double dash, but no following command');
    return params.join(' ');
  }

  parseHostAndPort(param) {
    this.seen.port = true;
    let [host, port] = param.split(':', 2);
    if(!host.length) host = this.host; // if it was ':8080' then we want to keep localhost
    port = parseInt(port, 10);
    if(!port) this.raise(`Found [<host>]:<port> of ${param}, but port cannot be empty or zero`);
    return [host, port];
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

  parse(givenParams) {
    const params = givenParams ? givenParams : cliParams; 
    while(params.length) {
      const param = params.shift();
      if(this.isHelp(param)) {
        this.usage();
      } else if(this.isQuiet(param)) {
        this.quiet = true;
      } else if(this.isTimeout(param)) {
        const timeout = [params.shift(), `${param} `];
        this.timeout = this.validateTimeout(...timeout);
      } else if(this.isCombinedTimeout(param)) {
        const timeout = this.matchingTimeoutOpt(param);
        this.timeout = this.validateTimeout(...timeout);
      } else if(COMMAND_SEPARATOR===param) {
        this.command = this.parseCommand(params);
        break; // no further parsing
      } else if(!this.seen.port) {
        // all other possible options are above this
        [this.host, this.port] = this.parseHostAndPort(param);
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


module.exports = Order;
