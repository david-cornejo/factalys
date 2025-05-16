const { Client } = require('pg');

async function getConnection() {
  const client = new Client({
    host: 'localhost',
    port: '5432',
    user: 'Admin_timbrella',
    password: 'Timbrella1029.',
    database: 'timbrella_db',
  });

  await client.connect();
  return client;
}

module.exports = getConnection;
