import bcrypt from 'bcrypt';
import { DataSourceOptions } from 'typeorm';

export default {
  bcrypt: bcrypt,
};

export const dbOptions = (): DataSourceOptions => ({
  type: (process.env.DB_TYPE as any) || 'mysql',
  host: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  username: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  cache: true,
});
