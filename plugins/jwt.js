const jwt = require('@fastify/jwt');
const fp = require('fastify-plugin');

module.exports = fp(async (fastify/* , opts */) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
