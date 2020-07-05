import pgPromise from 'pg-promise';
import { Log, Error } from '@dustinrouillard/fastify-utilities/modules/logger';

const PostgresConfig = {
  Host: process.env.POSTGRES_HOST || '127.0.0.1',
  Port: Number(process.env.POSTGRES_PORT) || 5432,
  User: process.env.POSTGRES_USERNAME || 'postgres',
  Pass: process.env.POSTGRES_PASSWORD || 'docker',
  Database: process.env.POSTGRES_DATABASE || 'postgres',
};

const ConnectionURL = `postgres://${PostgresConfig.User}:${PostgresConfig.Pass}@${PostgresConfig.Host}:${PostgresConfig.Port}/${PostgresConfig.Database}`;

interface IExtensions {
  findLink(code: string): Promise<any>;
}

const ConnectionOptions: pgPromise.IInitOptions<IExtensions> = {
  error(err, e) {
    Error('Error in the postgres connection', err, e);
  },
};

const pgp = pgPromise(ConnectionOptions);
export const PostgresClient = pgp(ConnectionURL);

(async () => {
  await PostgresClient.connect();
  Log(`Connected to postgres database [Database: ${PostgresConfig.Database}]`);
})();
