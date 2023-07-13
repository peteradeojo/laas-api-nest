const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { SQL_HOST, SQL_PORT, SQL_USER, SQL_PASSWORD, SQL_DATABASE } = process.env;

const config = {
  type: 'mysql',
  host: SQL_HOST,
  port: SQL_PORT,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DATABASE,
  entities: ['src/typeorm/entities/**/*.ts'],
  migrations: ['src/typeorm/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'src/typeorm/migrations',
  },
};

const configString = JSON.stringify(config, null, 2);

fs.writeFileSync('ormconfig.json', configString);