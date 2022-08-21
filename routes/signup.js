const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const saltRounds = 10;

async function routes(fastify/* , options */) {
  fastify.route({
    method: 'POST',
    url: '/signup',
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
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        await prisma.user.create({
          data: {
            email,
            username,
            password: encryptedPassword,
          },
        });

        const payload = {
          email,
        };
        const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

        reply
          .send({ Authorization: token })
          .code(200)
          .send('Welcome!');
      } catch (error) {
        reply.send(new Error('Something went wrong'));
      }
    },
  });
}

module.exports = routes;
