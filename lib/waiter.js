
const { Socket } = require('net');
const { cwd, env } = require('process');
const { execSync } = require('child_process');
const { after } = require('./utils');

module.exports = async (host, port, command, quiet) => {

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
    if(!quiet) console.log(`Running \`${command}\``);
    execSync(command, { cwd: cwd(), stdio: 'inherit', env });
  }
};



