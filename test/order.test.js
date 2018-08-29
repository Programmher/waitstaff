const test = require('blue-tape');

// Test that Order is a constructor which provides defaults, 
// and that the usage string exists
const Order = require('../lib/order');
const defaultTimeout = 200;

test('Order defaults', async (t) => {
  t.ok(Order.USAGE.match(/after the test finishes/im), 'USAGE string exists');

  const o = new Order();
  t.ok('localhost'===o.host, 'host defaults to localhost');
  t.ok(undefined===o.port, 'port defaults to undefined');
  t.ok(undefined===o.command, 'command defaults to undefined');
  t.ok(false===o.quiet, 'quiet defaults to false');
  t.ok(defaultTimeout===o.timeout, 'timeout defaults to 200ms');

  t.ok(typeof o.opts === 'object', 'Order.opts is an object, having:');
  t.ok(o.opts.quiet.includes, ' An array called "quiet", including');
  t.ok(o.opts.quiet.includes('-q'), '-q');
  t.ok(o.opts.quiet.includes('--quiet'), '--quiet');

  t.ok(o.opts.help.includes, ' An array called "help", including');
  t.ok(o.opts.help.includes('-h'), '-h');
  t.ok(o.opts.help.includes('--help'), '--help');

  t.ok(o.opts.timeout.includes, ' An array called "timeout", including');
  t.ok(o.opts.timeout.includes('-t'), '-t');
  t.ok(o.opts.timeout.includes('--timeout'), '--timeout');

  t.ok(o.opts.combinedTimeout.includes, ' An array called "combinedTimeout", including');
  t.ok(o.opts.combinedTimeout.includes('-t='), '-t=');
  t.ok(o.opts.combinedTimeout.includes('--timeout='), '--timeout=');
});

// Test overriding defaults.
const optionTypes = ['quiet', 'help', 'timeout', 'combinedTimeout'];
const overrideArray = [1, 2, 3];
const settingTypes = ['host', 'port', 'command', 'quiet', 'timeout'];
const override = 'injected';

test('Order defaults can be overridden', async (t) => {
  optionTypes.forEach((type) => {
    const o2 = new Order({opts: {[type]: overrideArray}});
    t.same(o2.opts[type], overrideArray, `${type} can be overridden`);
  });

  settingTypes.forEach((type) => {
    const o2 = new Order({[type]: override});
    t.same(o2[type], override, `${type} can be overridden`);
  });
});

// Test flag handlers
const flagInputs = {
  isHelp: {bad: '-b', short: '-h', long: '--help'},
  isQuiet: {bad: '-b', short: '-q', long: '--quiet'},
  isTimeout: {bad: '-b', short: '-t', long: '--timeout'},
  isCombinedTimeout: {bad: '-b=', short: '-t=', long: '--timeout=', like: 'isTimeout'},
};

test('Order misc methods', async (t) => {
  Object.keys(flagInputs).forEach((f) => {
    const {bad, short, long, like} = flagInputs[f];
    const o = new Order();
    t.notOk(o[f](bad), `${f} does not respond to ${bad}`);
    t.ok(o[f](short), `${f} does respond to ${short}`);
    t.notOk(o[f](bad), `${f} still does not respond to ${bad}`);
    t.notOk(o[f](short), `${f} no longer responds to ${short}`);
    const o2 = new Order();
    t.ok(o2[f](long), `${f} does respond to ${long}`);
    t.notOk(o2[f](bad), `${f} does not respond to ${bad}`);
    t.notOk(o2[f](long), `${f} no longer responds to ${long}`);
    if(like) {
      const {short, long} = flagInputs[like];
      t.notOk(o2[like](short), `${like} also no longer responds to ${short}`);
      t.notOk(o2[like](long), `${like} also no longer responds to ${long}`);
    }
  });
});

// Testing timeout in depth
const invalidTimeoutSpec = ['--timeout=', '-t=', '--testing=', '--testing='];

test('Order timeout parsing and validation', async (t) => {
  const defaultTimeout = 555;
  const o = new Order({timeout: defaultTimeout, opts: {combinedTimeout: invalidTimeoutSpec}});
  t.same(o.matchingTimeoutOpt('-t'), [], 'matchingTimeoutOpt does not parse -t');
  t.same(o.matchingTimeoutOpt('--timeout'), [], 'matchingTimeoutOpt does not parse --timeout');
  t.same(o.matchingTimeoutOpt('-t=1'), ['1', '-t='], 'matchingTimeoutOpt does parse -t=1');
  t.same(o.matchingTimeoutOpt('--timeout=1'), ['1', '--timeout='], 'matchingTimeoutOpt does parse --timeout=1');
  t.same(o.matchingTimeoutOpt('--t=1'), [], 'matchingTimeoutOpt does not parse --t=1');
  t.throws(() => o.matchingTimeoutOpt('--testing=1'), /invalid/im, 'matchingTimeoutOpt throws upon encountering an invalid spec');

  t.equal(o.validateTimeout('500', '-t'), 500, 'Correctly parses timeout numbers: 500');
  t.equal(o.validateTimeout('0', '-t'), 0, 'Correctly parses timeout numbers: 0');

  const cases = [['', '-t='], ['a', '-t='], ['', '--timeout=']];
  cases.forEach((c) => {
    t.throws(
      () => o.validateTimeout(...c), 
      new RegExp(`no following milliseconds.+${c[1]}${defaultTimeout}`), 
      `validateTimeout throws upon encountering bad timeout '${c[0]}', keeping given timeout option style: '${c[1]}'`);
  });

});

test('Order parsing errors', async (t) => {
  const defaultTimeout = 555;
  const quiet = true;
  const cases = [
    [[], /no port/im, 'order must contain a host:port parameter'],
    [['--quiet'], /no port/im, 'the quiet flag should not silence errors', quiet],
    [['localhost:'], /port cannot be empty or zero/im, 'order port cannot be empty'],
    [['localhost:0'], /port cannot be empty or zero/im, 'order port cannot be zero'],
    [[':8080', '--what'], /unknown/im, 'unknown parameters are rejected'],
    [[':8080', '-t', 'a'], /no following milliseconds.+-t 555/im, "-t: 'a' is not a timeout integer in milliseconds"],
    [[':8080', '-q', '-t'], /no following milliseconds.+-t 555/im, "milliseconds part cannot be missing", quiet],
    [[':8080', '--timeout', 'a'], /no following milliseconds.+--timeout 555/im, "--timeout: 'a' is not a timeout integer in milliseconds"],
    [[':8080', '-q', '--timeout'], /no following milliseconds.+--timeout 555/im, "milliseconds part cannot be missing", quiet],
    [[':8080', '--'], /standalone/im, 'double dash without a command to run is invalid'],
  ];
  cases.forEach((c) => {
    const o = new Order({timeout: defaultTimeout});
    t.throws(
      () => o.parse(c[0]),
      c[1],
      c[2]
    );
    if(c[3]) {
      t.equal(o.quiet, true, ' and quiet flag did not silence error');
    }
  });
});

test('Order parsing happy cases', async (t) => {
  const cases = [
    [[':8080', '--', 'ls'], 'ls', 'solo command'],
    [[':8080', '--', 'ls', '-l'], 'ls -l', 'command with argument'],
    [[':8080', '--', 'ls', '--quiet'], 'ls --quiet', 'command includes a quiet flag'],
    [[':8080', '--', 'ls', '--help'], 'ls --help', 'command includes a help flag'],
  ];
  cases.forEach(([params, command, comment]) => {
    const o = new Order();
    const parsed = o.parse(params);
    t.equal(parsed.command, command, comment);
    t.equal(parsed.quiet, false, ' and not quiet');
  });
});

test('Order parsing help behavior', async(t) => {
  const cases = [
    [['-h'], 'short help flag'],
    [['--help'], 'long help flag'],
    [['-q', '-h'], 'short help flag, unquieted even with quiet flag first'],
    [['-h', '-q', ':8080'], 'short help flag, unquieted even with quiet flag after'],
  ];
  cases.forEach(([params, comment]) => {
    const o = new Order();
    t.throws(() => o.parse(params), /after the test finishes/im,  comment);
  });
});
