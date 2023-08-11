import { DataSource, DataSourceOptions, EntityTarget, ObjectLiteral } from 'typeorm';
const date = require('date-and-time');

import { dbOptions } from '../config/configuration';
import { Metric } from '../typeorm/entities/Metric';
import { App, Log, User } from 'src/typeorm/entities';

const datasource = new DataSource({ ...dbOptions(), entities: [Metric, App, User, Log] });

const momentFormat = 'YYYY-MM-DD HH:mm:ss';

const now = () => date.format(new Date(), momentFormat);

type LogStat = {
  weight: number;
  level: string;
  createdAt: string;
};

async function checkTableExists(table: string | EntityTarget<ObjectLiteral>) {
  if (typeof table == 'string') {
    const queryRunner = datasource.manager.createQueryBuilder().select('*').from('information_schema.tables', 'tables');

    queryRunner.where('table_schema = :schema AND table_name = :table', { schema: process.env.SQL_DATABASE, table });
    const result = await queryRunner.getRawOne();

    if (result) {
      console.log('Table exists');
      return true;
    } else {
      console.log('Table does not exist');
      return false;
    }
  } else {
    return datasource.hasMetadata('metrics');
  }
}

async function createMetricsTable() {
  try {
    const query = datasource.manager.createQueryBuilder();
    await datasource.manager.query(
      "CREATE TABLE `metrics` (`id` int NOT NULL AUTO_INCREMENT, `level` enum ('info', 'warn', 'error', 'debug', 'fatal', 'unknown') NOT NULL, `weight` int NOT NULL DEFAULT '0', `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), `appId` int NULL, `saveDate` datetime, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
  } catch (err) {}
}

async function saveLogMetrics(stats: LogStat[], appId?: number) {
  // console.log(stats.length);

  let query = 'INSERT INTO `metrics` (`level`, `weight`, `saveDate`, `createdAt`, `updatedAt`, `appId`) VALUES ';
  const values = [];

  const params = [];

  for (const stat of stats) {
    params.push('(?, ?, ?, ?, ?, ?)');
    // query += '(?, ?, ?, ?, ?), ';
    // query += values.map(() => '(?, ?, ?, ?, ?)').join(', ');
    values.push(stat.level, stat.weight, stat.createdAt, now(), now(), appId);
  }

  query += params.join(', ');

  // console.log(query);
  // console.log(values);

  try {
    await datasource.manager.query(query, values);
  } catch (err) {
    console.error(err);
  }
}

async function* appGenerator(count: number) {
  let current = 1;
  while (current <= count) {
    try {
      const query = datasource.createQueryBuilder(App, 'app');

      query
        .select('*')
        .orderBy('app.id')
        .limit(count)
        .skip((current - 1) * count);
      const apps = await query.getRawMany<App>();

      current += 1;

      if (apps.length < count) {
        if (apps.length === 0) break;

        yield apps;
        break;
      }

      yield apps;
    } catch (err) {
      console.error(err);
      yield undefined;
      break;
    }
  }
}

const getLogStats = async (app: Partial<App>, timebound = false) => {
  const manager = datasource.manager;
  const time = date.format(date.addMinutes(new Date(), -30), momentFormat);

  console.log(app);

  const query = manager.createQueryBuilder(Log, 'log');

  query
    .select('count(level)', 'weight')
    .addSelect('max(log.createdAt)', 'createdAt')
    .addSelect('level', 'level')
    .where('log.appId = :appId', { appId: app.id });

  console.log(query.getQuery());

  if (timebound) {
    query.andWhere('log.createdAt >= :time', { time });
  }

  query.groupBy('level');

  const stats = await query.getRawMany();

  console.log(stats.length);

  if (stats.length > 0) await saveLogMetrics(stats, app.id as number);
};

export const gatherMetrics = async () => {
  try {
    if (!datasource.isInitialized) {
      await datasource.initialize();
    }

    const tableExists = await checkTableExists('metrics');

    // const manager = datasource.manager;
    // const { count } = await manager.query('SELECT count(id) as count from apps where token is not null');
    const timebound = process.env.NODE_ENV != 'development';

    for await (const chunk of appGenerator(20)) {
      chunk.forEach(async (app) => await getLogStats(app, timebound));
    }
  } catch (err) {
    console.error(err);
  }
};

export class MetricsCollator {
  protected datasource: DataSource;

  constructor(datasourceOptions?: DataSourceOptions) {
    if (datasourceOptions) {
      this.datasource = new DataSource(datasourceOptions);
    } else {
      this.datasource = new DataSource(dbOptions());
    }
  }
}
