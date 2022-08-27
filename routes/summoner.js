// const sequelize = require('../db/sequelize');
const { Summoner, Report, User } = require('../db/relations');

async function routes(fastify/* , options */) {
  fastify.route({
    method: 'GET',
    url: '/summoner/:id',
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const summoner = await Summoner.findOne({
        where: { id },
        attributes: [
          'displayName',
          'internalName',
          'region',
          'afk',
          'inter',
          'troll',
          'flamer',
          'good'],
        include: [
          {
            model: Report,
            attributes: [
              'createdAt',
              'comment',
              'afk',
              'inter',
              'troll',
              'flamer',
              'good',
              'gameId',
              'region',
            ],
          }],
      });

      if (summoner) {
        reply.send(summoner);
      } else {
        const error = new Error('Summoner not found');
        error.statusCode = 404;
        throw error;
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/summoner',
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      const {
        id,
        displayName,
        internalName,
        region,
        self = false,
      } = request.body;

      const { user } = request;

      const userInfo = await User.findOne({
        where: { email: user.payload.email },
      });

        const summoner = await Summoner.create({
          id,
          displayName,
          internalName,
          region,
          user: self ? userInfo.get('id') : undefined,
        }, {
          attributes: [
            'id',
            'createdAt',
            'displayName',
            'internalName',
            'afk',
            'inter',
            'troll',
            'flamer',
            'good',
          ],
        });


      reply.send(summoner);
    },
  });
}

module.exports = routes;
