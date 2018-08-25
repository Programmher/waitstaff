const { exit } = require('process');

const after = ms => new Promise(resolve => setTimeout(resolve, ms));
const complain = (msg) => {
  console.log(msg);
  exit(1);
};


module.exports = { after, complain };
