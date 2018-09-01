
const { Socket } = require('net');
const { after } = require('./utils');

class Waiter {

  constructor() {
    this.lastError = undefined;
  }

  async connect (host, port) {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      socket.on('error', (e) => {
        socket.unref();
        reject(e);
      });
      socket.connect(port, host, () => {
        socket.end();
        resolve(true);
      });
    });
  }

  async wait(host, port) {
    let connected = false;
    do {
      try {
        connected = await this.connect(host, port);
        return;
      } catch (e) {
        this.lastError = e;
      }
      await after(50);
    } while(!connected);
  }
}

module.exports = new Waiter();
