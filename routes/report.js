const crypto = require('crypto');
const { inspect } = require('util');
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
        const error = new Error('Comment is too long');
        error.statusCode = 400;
        throw error;
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
        const userInfo = await User.findOne(
          {
            where: { email: user.payload.email },
          },
          {
            transaction: t,
            logging: request.log.info,
          },
        );

        if (!userInfo) {
          const error = new Error('User not found');
          error.statusCode = 404;
          throw error;
        }

        const userId = userInfo.get('id');

        const summoner = await Summoner.findOne({
          where: { id: summonerId },
        }, {
          transaction: t,
          logging: request.log.info,
        });

        if (summoner) {
          await summoner.update(reputationChanges, {
            transaction: t,
            logging: request.log.info,
          });
        } else {
          await Summoner.create({
            id: summonerId,
            displayName,
            internalName,
            region,
            ...newSummonerValues,
          }, {
            transaction: t,
            logging: request.log.info,
          });
        }

        const toHash = `${region}-${gameId}-${summonerId}-${userId}`;

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
          userId,
          summonerId,
        }, {
          transaction: t,
          logging: request.log.info,
        });

        request.log.info(report.toJSON());

        await userInfo.increment({
          reportsDone: 1,
        }, {
          transaction: t,
          logging: request.log.info,
        });
      });

      request.log.info(inspect(result));

      reply.send('Reported!');
    },
  });
}

module.exports = routes;
