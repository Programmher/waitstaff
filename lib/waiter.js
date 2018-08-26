
const { Socket } = require('net');
const { after } = require('./utils');

class Waiter {

  async connect (host, port) {
    return new Promise((resolve, reject) => {
      const connection = (new Socket()).connect(port, host);
      connection.on('connect', () => resolve(true));
      connection.on('error', reject);
    });
  };

  async wait(host, port) {

    while(true) {
      try {
        if(await this.connect(host, port)) break;
      } catch (e) {}
        await after(50);
    }
  }
}

module.exports = new Waiter();
