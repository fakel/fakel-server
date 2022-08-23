const sequelize = require('./sequelize');
const User = require('./models/User');
const Report = require('./models/Report');
const Summoner = require('./models/Summoner');

User.hasMany(Report);
Report.belongsTo(User);

User.hasMany(Summoner);
Summoner.belongsTo(User);

Summoner.hasMany(Report);
Report.hasOne(Summoner);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('Sync done');
  } catch (error) {
    console.log(JSON.stringify(error));
  }
})();

module.exports = {
  User,
  Report,
  Summoner,
};
