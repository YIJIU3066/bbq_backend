require('dotenv').config();
const knex = require('knex');

var config = {
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        timezone: '+08:00'
    }
};

const connection = knex(config);

module.exports = connection;
