const { config } = require('./../config/config');
const dotenv = require('dotenv');
dotenv.config();

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dBHost}:${config.dBPort}/${config.dBName}`;
console.log(`Connecting to database: ${URI}`);

module.exports = {
  development: {
    url: URI,
    dialect: 'postgres',
  },
  production: {
    url: URI,
    dialect: 'postgres',
  },
};
