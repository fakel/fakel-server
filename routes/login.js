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

      request.log.debug({ user: user.toJSON() });

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const comparison = await bcrypt.compare(password, user.password);

      if (comparison) {
        const payload = {
          email: user.email,
          username: user.username,
        };
        const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

        reply
          .send({ Authorization: token });
        return;
      }

      const error = new Error('Email/Username and password does not match');
      error.statusCode = 400;
      throw error;
    },
  });
}

module.exports = routes;
