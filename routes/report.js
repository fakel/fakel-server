const crypto = require('crypto');
const sequelize = require('../db/sequelize');
const { User, Report, Summoner } = require('../db/relations');

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

        const reputationChanges = deltas.reduce((changes, tag) => {
          if (request.body[tag]) {
            return { ...changes, [tag]: sequelize.literal(`${tag} + 1`) };
          } return changes;
        }, {});

        const newSummonerValues = deltas.reduce((operation, tag) => {
          if (request.body[tag]) {
            return { ...operation, [tag]: 1 };
          } return { ...operation, [tag]: 0 };
        }, {});

        const result = await sequelize.transaction(async (t) => {
          const userInfo = await User.findOne({
            where: { email: user.payload.email },
            transaction: t,
          });

          if (!userInfo) {
            throw new Error('User not found');
          }

          const summoner = await Summoner.findOne({
            where: { id: summonerId },
          }, { transaction: t });

          if (summoner) {
            await summoner.update(reputationChanges, { transaction: t });
          } else {
            await Summoner.create({
              id: summonerId,
              displayName,
              internalName,
              region,
              ...newSummonerValues,
            }, { transaction: t });
          }

          const toHash = `${region}-${gameId}-${summonerId}-${userInfo.get('id')}`;

          const hash = crypto.createHash('md5').update(toHash).digest('base64');

          const report = await Report.create({
            id: hash,
            comment,
            afk,
            inter,
            troll,
            flamer,
            good,
            gameId,
            region,
            userId: userInfo.get('id'),
            summonerId,
          }, { transaction: t });

          request.log.info(JSON.stringify(report, null, 2));

          await userInfo.increment({ reportsDone: 1 }, { transaction: t });
        });

        request.log.info(JSON.stringify(result, null, 2));

        reply.send('Reported!');
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
