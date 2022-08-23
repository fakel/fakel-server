const bcrypt = require('bcrypt');
const User = require('../db/models/User');

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

        // Normalize data
        const emailLower = email.toLowerCase();
        const usernameLower = username.toLowerCase();

        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
          emailLower,
          usernameLower,
          password: encryptedPassword,
        });

        request.log.debug(`User created ${JSON.stringify(user.toJSON())}`);

        const payload = {
          emailLower,
        };
        const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

        reply
          .send({ Authorization: token })
          .code(200);
      } catch ({ stack, message }) {
        request.log.debug(JSON.stringify({
          stack,
          message,
        }, null, 2));
        reply.send(new Error('Something went wrong'));
      }
    },
  });
}

module.exports = routes;
