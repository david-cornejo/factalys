const { Sequelize } = require('sequelize');

const { config } = require('./../config/config');
const setupModels = require('./../db/models');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dBHost}:${config.dBPort}/${config.dBName}`;

const sequelize = new Sequelize(URI, { dialect: 'postgres', logging: false });

// ✅ Exporta ambos: sequelize y models
setupModels(sequelize);
const models = sequelize.models;

module.exports = {
  sequelize,
  models,
};