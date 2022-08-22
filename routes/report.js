const prisma = require('../utils/prisma');

const deltas = [
  'afk',
  'inter',
  'troll',
  'flamer',
  'good',
];

async function routes(fastify/* , options */) {
  fastify.route({
    method: 'POST',
    url: '/report',
    schema: {
      body: {
        type: 'object',
        properties: {
          gameId: { type: 'string' },
          region: { type: 'string' },
          summonerId: { type: 'string' },
          displayName: { type: 'string' },
          internalName: { type: 'string' },
          comment: { type: 'string' },
          afk: { type: 'boolean' },
          inter: { type: 'boolean' },
          troll: { type: 'boolean' },
          flamer: { type: 'boolean' },
          good: { type: 'boolean' },
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const {
          gameId,
          region,
          summonerId,
          displayName,
          internalName,
          comment,
          afk,
          inter,
          troll,
          flamer,
          good,
        } = request.body;

        const { user } = request;

        if (comment.length > 250) {
          reply.send({ error: 'Comment is too long' });
          return;
        }

        const reputationChanges = deltas.reduce((operation, tag) => {
          if (request.body[tag]) {
            return { ...operation, [tag]: { increment: 1 } };
          } return operation;
        }, {});

        const newSummonerValues = deltas.reduce((operation, tag) => {
          if (request.body[tag]) {
            return { ...operation, [tag]: 1 };
          } return { ...operation, [tag]: 0 };
        }, {});

        await prisma.$transaction([
          prisma.summoner.upsert({
            where: {
              puuid: summonerId,
            },
            update: reputationChanges,
            create: {
              puuid: summonerId,
              displayName,
              internalName,
              region,
              ...newSummonerValues,
            },
          }),
          prisma.report.create({
            data: {
              comment,
              afk,
              inter,
              troll,
              flamer,
              good,
              gameId,
              region,
              author: {
                connect: {
                  email: user.payload.email,
                },
              },
              summoner: {
                connect: {
                  puuid: summonerId,
                },
              },
            },
          }),
          prisma.user.update({
            where: {
              email: user.payload.email,
            },
            data: {
              reportsDone: {
                increment: 1,
              },
            },
          }),
        ]);

        reply.send('Reported!');
      } catch (error) {
        reply.send(new Error('Something went wrong'));
      }
    },
  });
}

module.exports = routes;
