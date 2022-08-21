const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');

async function routes(fastify/* , options */) {
  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, username, password } = request.body;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { username },
            ],
          },
        });

        if (!user) {
          reply.code(401).send('User not found');
          return;
        }

        const comparison = await bcrypt.compare(password, user.password);

        if (comparison) {
          const payload = {
            email: user.email,
            username: user.username,
          };
          const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

          reply
            .send({ Authorization: token })
            .code(200)
            .send('Welcome!');
        } else {
          reply.send(new Error('Email and password does not match'));
        }
      } catch (error) {
        reply.send(new Error('Something went wrong'));
      }
    },
  });
}

module.exports = routes;
