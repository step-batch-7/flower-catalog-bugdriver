const { createServer } = require('http');
const { app } = require('./lib/handler');

const server = createServer();
server.on('request', (req, res) => app.serve(req, res));
server.on('error', err => console.log('error occured in server', err));

server.listen(process.argv[2], () =>
  console.log(`server is listening to port :`, server.address().port)
);
