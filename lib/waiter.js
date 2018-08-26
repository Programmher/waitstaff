
const { Socket } = require('net');
const { after } = require('./utils');

class Waiter {

  constructor() {
    this.lastError = undefined;
  }

  async connect (host, port) {
    return new Promise((resolve, reject) => {
      const connection = (new Socket()).connect(port, host);
      connection.on('connect', () => resolve(true));
      connection.on('error', reject);
    });
  }

  async wait(host, port) {
    let connected = false;
    do {
      try {
        connected = await this.connect(host, port);
      } catch (e) {
        this.lastError = e;
      }
      await after(50);
    } while(!connected);
  }
}

module.exports = new Waiter();
