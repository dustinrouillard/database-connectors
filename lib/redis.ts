import Redis, { RedisOptions, ClusterNode, ClusterStatic } from 'ioredis';

import { Log, Error } from '@dustinrouillard/fastify-utilities/modules/logger';

const RedisConfig = {
  Host: process.env.REDIS_HOST || '127.0.0.1',
  Port: Number(process.env.REDIS_PORT) || 6379,
  Database: Number(process.env.REDIS_DATABASE) || 0,
  Cluster: !!process.env.REDIS_CLUSTER,
  Auth: process.env.REDIS_AUTH || '',
};

let RedisConstructor: ClusterStatic | typeof Redis;
if (RedisConfig.Cluster) RedisConstructor = Redis.Cluster;
else RedisConstructor = Redis;

let RedisHost = { host: RedisConfig.Host, port: RedisConfig.Port };
let RedisOptions: RedisOptions = { lazyConnect: true, db: RedisConfig.Database, password: RedisConfig.Auth };

let ClusterHost: ClusterNode[] = [RedisHost];
if (!RedisConfig.Cluster) RedisOptions = { ...RedisHost, ...RedisOptions };

let HostOrOptions = RedisConfig.Cluster ? ClusterHost : (RedisOptions as ClusterNode[]);
let ConfigOrNone = RedisConfig.Cluster ? RedisOptions : undefined;

export const RedisClient = new RedisConstructor(HostOrOptions, ConfigOrNone);

(async () => {
  try {
    await RedisClient.connect(() => {});
    Log(`Connection opened to redis ${RedisConfig.Cluster ? 'cluster' : 'server'} [Database: ${RedisConfig.Database}]`);
  } catch (error) {
    Error('Error with the redis database connection', error);
  }
})();
