const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../db/models/User');

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

        // Normalize data
        const emailLower = email.toLowerCase();
        const usernameLower = username.toLowerCase();

        const user = await User.findOne({
          where: {
            [Op.or]: [
              { email: emailLower },
              { username: usernameLower },
            ],
          },
        });

        request.log.debug(`User found  ${JSON.stringify(user.toJSON())}`);

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
            .code(200);
          return;
        }
        reply.send(new Error('Email and password does not match'));
        return;
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
