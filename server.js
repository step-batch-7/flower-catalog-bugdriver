const { createServer } = require('http');
const { parse } = require('querystring');
const { pickHandler } = require('./app');

const handleRequest = function(req, res) {
  req.setEncoding('utf8');
  const handler = pickHandler(req);
  handler(req, res);
};

const server = createServer();
server.on('request', handleRequest);
server.on('error', err => console.log('error occured in server', err));

server.listen(process.argv[2], () =>
  console.log(`server is listening to port :`, server.address().port)
);
