import { Log, Error } from '@dustinrouillard/fastify-utilities/modules/logger';

import { RedisClient, RedisConfig } from './constructor';

export * from './request';
export * from './constructor';

(async () => {
  try {
    await RedisClient.connect(() => {});
    Log(`Connection opened to redis ${RedisConfig.Cluster ? 'cluster' : 'server'} [Database: ${RedisConfig.Database}]`);
  } catch (error) {
    Error('Error with the redis database connection', error);
  }
})();
