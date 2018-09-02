const test = require('blue-tape');
const { cwd } = require('process');
const { spawnSync } = require('child_process');
const net = require('net');


test('on the command line misc cases', async (t) => {
  let output;
  output = spawnSync('node', ['index.js', ':8080', '--what'], { cwd: cwd()});
  t.ok(output.stderr.toString().match(/unknown.*--what/), 'complains about unknown options');
  t.ok(output.status===1, 'output status is 1 when complaining');

  output = spawnSync('node', ['index.js', '-q', ':8080', '--timeout'], { cwd: cwd()});
  t.ok(output.stderr.toString().match(/Usage/), 'still provides error messages when quiet');
  t.ok(output.stderr.toString().match(/milliseconds.*--timeout/), 'parrots the type of option for timeout complaints');
  t.ok(output.status===1, 'output status is 1 when complaining');

  output = spawnSync('node', ['index.js', '-q', ':8080', '--'], { cwd: cwd()});
  t.ok(output.stderr.toString().match(/standalone/), 'provides error message if command line ends in -- ');
  t.ok(output.status===1, 'output status is 1 when complaining');
  
  output = spawnSync('node', ['index.js', ':8080', '--', 'echo', '"what"'], { cwd: cwd()});
  t.ok(output.stdout.toString().match(/waiting for/), 'is chatty if not quiet');
  t.ok(output.status===1, 'output status is 1 when not successful');

  output = spawnSync('node', ['index.js', '-q', ':8080', '--', 'echo', '"what"'], { cwd: cwd()});
  t.notOk(output.stdout.toString().match(/waiting for/), 'is not chatty if quiet');
  t.ok(output.status===1, 'output status is 1 when not successful');

  output = spawnSync('node', ['index.js', '-q', ':8080', '--help', '--', 'ls'], { cwd: cwd()});
  t.ok(output.stdout.toString().match(/Usage/), 'still provides info if asked for help when quiet');
  t.notOk(output.stdout.toString().match(/package\.json/), 'command is not run');
  t.ok(output.status===0, 'output status is 0 when not complaining');
});

// these need a socket for the test
test('on the command line when command to run errors', async (t) => {
  const serverHost = 'localhost';
  const inUse = (code) => 'EADDRINUSE' === code;
  const failed = (e) => inUse(e.code) ? console.warn('Address in use!') : console.error(e);
  const server = net.createServer();
  const serverPort = 11914;
  server.on('error', failed);
  server.listen(serverPort, serverHost, () => {
    t.comment(`server ${serverPort} started`);
    const output = spawnSync('node', ['index.js', `${serverHost}:${serverPort}`, '--', 'ls', '--quiet'], { cwd: cwd()});
    t.ok(output.stdout.toString().match(/waiting for/), 'is chatty because --quiet was not our option');
    t.ok(output.stderr.toString().match(/illegal option/), 'runs command without eating known options');
    t.ok(output.status===1, 'output status passed through from command (ls complaining about illegal options)');
    server.close();
  });  
});

test('on the command line when command to run succeeds', async (t) => {
  const serverHost = 'localhost';
  const inUse = (code) => 'EADDRINUSE' === code;
  const failed = (e) => inUse(e.code) ? console.warn('Address in use!') : console.error(e);
  const server = net.createServer();
  const serverPort = 11915;
  server.on('error', failed);
  server.listen(serverPort, serverHost, () => {
    t.comment(`server ${serverPort} started`);
    const output = spawnSync('node', ['index.js', `${serverHost}:${serverPort}`, '-q', '--', 'ls', '-l'], { cwd: cwd()});
    t.ok(output.stdout.toString().match(/package\.json/), 'command is run');
    t.ok(output.status===0, 'output status passed through from command (ls works fine)');
    server.close();
  });  
});

test('on the command line when command to run succeeds', async (t) => {
  const serverHost = 'localhost';
  const inUse = (code) => 'EADDRINUSE' === code;
  const failed = (e) => inUse(e.code) ? console.warn('Address in use!') : console.error(e);
  const server = net.createServer();
  const serverPort = 11916;
  server.on('error', failed);
  server.listen(serverPort, serverHost, () => {
    t.comment(`server ${serverPort} started`);
    const output = spawnSync('node', ['index.js', `${serverHost}:${serverPort}`, '-t=0'], { cwd: cwd()});
    t.ok(output.status===0, 'waitstaff exits with 0 / success');
    server.close();
  });  
});

test('on the command line when we timeout', async (t) => {
  const serverHost = 'localhost';
  const serverPort = 11917;
  t.comment(`server ${serverPort} not started`);
  const output = spawnSync('node', ['index.js', `${serverHost}:${serverPort}`, '--', 'ls', '-l'], { cwd: cwd()});
  t.notOk(output.stderr.toString().match(/timed out/), 'reports problem correctly');
});