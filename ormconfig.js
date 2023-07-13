require('dotenv').config();

const {DataSource} = require('typeorm');

const datasource = new DataSource({
  type: 'mysql',
  host: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  entities: ['src/typeorm/entities/*.ts'],
  migrations: ['src/typeorm/migrations/*.ts'],
});

module.exports = datasource;