const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

        const comparison = await bcrypt.compare(password, user.password);

        if (comparison) {
          const payload = {
            email: user.email,
            username: user.username,
          };
          const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

          reply
            .setCookie('token', token, {
              domain: 'fakel.lol',
              path: '/',
              secure: true, // send cookie over HTTPS only
              httpOnly: true,
            })
            .code(200)
            .send('Welcome!');
        } else {
          reply.send(new Error('Email and password does not match'));
        }
      } catch (error) {
        reply.send(error);
      }
    },
  });
}

module.exports = routes;
