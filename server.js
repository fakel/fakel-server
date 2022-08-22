require('dotenv').config();
const fastify = require('fastify')({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
    },
  },
});
const cors = require('@fastify/cors');

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
