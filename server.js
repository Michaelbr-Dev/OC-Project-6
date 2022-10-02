/**
 * @file Manage server.
 * @author Michael Briquet <contact@michaelbr-dev.fr>
 *
 * @module Server
 */

/**
 * @description Listening to http requests and responding.
 */
const http = require('http'); // https requires an SSL certificate to be obtained with a domain name.
const app = require('./app');

/**
 * @function normalizePort
 * @description Returns a valid port, whether supplied as a number or a string.
 *              This configures the connection port according to the environment.
 *
 * @param   {number|string} val - Port number (number or string).
 *
 * @returns {number}            Return a valid port number.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (port.isNaN) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

/**
 * @description Add the connection port if it is not declared by the environment.
 *              If no port is provided, we will listen on port 3000.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app); // https requires an SSL certificate to be obtained with a domain name.

/**
 * @function errorHandler
 *
 * @description If the error is not related to the server listening, throw the error.
 *              Otherwise, if the error is related to the server listening, log the error and exit
 *              the process.
 *
 * @param {*} error - The error object that was thrown.
 *
 * @throws Error if error type is not listen.
 */
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
  switch (error.code) {
    case 'EACCES':
      // eslint-disable-next-line no-console
      console.error(`${bind} require elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      // eslint-disable-next-line no-console
      console.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * @description Management of server events for console feedback.
 *              Display errors if there are any.
 */
server.on('error', errorHandler);

/**
 * @description Management of server events for console feedback.
 *              Display the address and port the server is running on.
 */
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${bind}`);
});

/**
 * @description The server is listening to the port defined above.
 */
server.listen(port);
