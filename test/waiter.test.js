const test = require('blue-tape');
const net = require('net');
const Waiter = require('../lib/waiter');
const serverHost = 'localhost';

const inUse = (code) => 'EADDRINUSE' === code;
const failed = (e) => inUse(e.code) ? console.warn('Address in use!') : console.error(e);

class Timer {
  start() {
    this.startTime = Date.now();
    return this;
  }
  stop() {
    this.stopTime = Date.now();
    return this;
  }
  time() {
    if(this.startTime && this.stopTime) {
      return this.stopTime - this.startTime;
    }
    return undefined;
  }
  seconds() {
    const time = this.time();
    if(time===undefined) return undefined;
    return time / 1000;
  }
}

test('waiter connect on 11911', async (t) => {
  const server = net.createServer();
  const serverPort = 11911;
  server.on('error', failed);
  await t.shouldFail(Waiter.connect(serverHost, serverPort), /ECONNREFUSED/, 'fails when no server 11911 exists');
  server.listen(serverPort, serverHost, async () => {
    t.comment('server 11911 started');
    const connection = await Waiter.connect(serverHost, serverPort);
    t.equal(connection, true, 'succeeded when server 11911 is present');
    server.close();
  });
});

test('waiter wait immediate', async (t) => {
  const server = net.createServer();
  const serverPort = 11912;
  server.on('error', failed);
  await t.shouldFail(Waiter.connect(serverHost, serverPort), /ECONNREFUSED/, `connect fails when no server ${serverPort} exists`);
  const timer = new Timer().start();
  const success = () => {
    timer.stop();
    t.comment(`Took ${timer.time()} milliseconds to resolve connection to server ${serverPort}`);
    server.close();
  };
  const listening = () => t.comment(`server ${serverPort} started`);
  server.listen(serverPort, serverHost, listening);
  // started listener immediately
  setTimeout(() => Waiter.wait(serverHost, serverPort).then(success), 10);
});

test('waiter wait for 200ms', async (t) => {
  const server = net.createServer();
  const serverPort = 11913;
  server.on('error', failed);
  await t.shouldFail(Waiter.connect(serverHost, serverPort), /ECONNREFUSED/, `connect fails when no server ${serverPort} exists`);
  const timer = new Timer().start();
  const success = () => {
    timer.stop();
    t.comment(`Took ${timer.time()} milliseconds to resolve connection to server ${serverPort}`);
    server.close();
  };
  const listening = () => t.comment(`server ${serverPort} started`);
  Waiter.wait(serverHost, serverPort).then(success);
  // waiting for 200ms before we start the listener
  setTimeout(() => server.listen(serverPort, serverHost, listening), 100);
});
