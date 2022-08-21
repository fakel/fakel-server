const prisma = require('../utils/prisma');

async function routes(fastify/* , options */) {
  fastify.route({
    method: 'GET',
    url: '/summoner/:puuid',
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { puuid } = request.params;
        const summoner = await prisma.summoner.findUnique({
          where: { puuid },
          select: {
            displayName: true,
            internalName: true,
            afk: true,
            inter: true,
            troll: true,
            flamer: true,
            good: true,
            reports: {
              select: {
                createdAt: true,
                comment: true,
                afk: true,
                inter: true,
                troll: true,
                flamer: true,
                good: true,
              },
            },
          },
        });

        if (summoner) {
          reply.send(summoner);
        } else {
          reply.send({ error: 'Summoner not found' });
        }
      } catch (err) {
        reply.send(err);
      }
    },
  });

  fastify.route({
    method: 'POST',
    url: '/summoner',
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { puuid, displayName, internalName } = request.body;
        const summoner = await prisma.summoner.create({
          data: {
            puuid,
            displayName,
            internalName,
          },
        });

        reply.send(summoner);
      } catch (err) {
        reply.send(err);
      }
    },
  });
}

module.exports = routes;