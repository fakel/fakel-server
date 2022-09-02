require('dotenv').config();
const { inspect } = require('util');
const cors = require('@fastify/cors');
const fastify = require('fastify')({
  logger: {
    level: 'debug',
    file: `logs-${Date.now()}.log`,
    // transport: {
    //   target: 'pino-pretty',
    // },
  },
});

const sequelize = require('./db/sequelize');
require('./db/relations');

sequelize.options.logging = (...args) => {
  fastify.log.info(inspect(args));
};

fastify.register(cors, (/* instance */) => (req, callback) => {
  const corsOptions = {
    origin: '*',
    // strictPreflight: false,
  };

  // do not include CORS headers for requests from localhost
  // if (/^localhost$/m.test(req.headers.origin)) {
  //   corsOptions.origin = false;
  // }

  // callback expects two parameters: error and options
  callback(null, corsOptions);
});

let timeout;

fastify.addHook('onRequest', (request, reply, done) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    request.log.info('No more requests after 10 minutes, exit process');
    process.exit(0);
  }, 10 * 60 * 1000);
  done();
});

fastify.setErrorHandler((error, request, reply) => {
  // eslint-disable-next-line no-param-reassign
  if (!error.statusCode) error.statusCode = 500;

  request.log.debug({
    statusCode: error.statusCode,
    message: error.message,
    stack: error.stack,
    request,
  });

  if (error.statusCode === 500) {
    reply.send(new Error('Something went wrong'));
  } else {
    reply
      .status(error.statusCode)
      .send(error.message);
  }
});

fastify.get('/', (_, reply) => reply.send({ hello: 'Dodge Them All, is alive!' }));

fastify.register(require('./plugins/jwt'));
fastify.register(require('./routes/signup'));
fastify.register(require('./routes/login'));
fastify.register(require('./routes/report'));
fastify.register(require('./routes/summoner'));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
