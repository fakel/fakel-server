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
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, password } = request.body;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        await prisma.user.create({
          data: {
            email,
            password: encryptedPassword,
          },
        });

        const payload = {
          email,
        };
        const token = fastify.jwt.sign({ payload });

        reply
          .setCookie('token', token, {
            domain: 'fakel.lol',
            path: '/',
            secure: true, // send cookie over HTTPS only
            httpOnly: true,
          })
          .code(200)
          .send('Welcome!');
      } catch (error) {
        reply.send(error);
      }
    },
  });
}

module.exports = routes;
