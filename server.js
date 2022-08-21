const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cookie'));
fastify.register(require('./plugins/jwt'));
fastify.register(require('./routes/signup'));

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
