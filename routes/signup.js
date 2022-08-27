const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
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
      const { email, username, password } = request.body;

      // Normalize data
      const emailLower = email.toLowerCase();
      const usernameLower = username.toLowerCase();

      const prevUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: emailLower },
            { username: usernameLower },
          ],
        },
      });

      if (prevUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
      }

      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      const user = await User.create({
        email: emailLower,
        username: usernameLower,
        password: encryptedPassword,
      });

      request.log.debug({ user: user.toJSON() });

      const payload = {
        email: emailLower,
        username: usernameLower,
      };

      const token = fastify.jwt.sign({ payload }, { expiresIn: '24h' });

      reply
        .send({ Authorization: token });
    },
  });
}

module.exports = routes;
