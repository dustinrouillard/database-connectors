import { Client, DseClientOptions, types } from 'cassandra-driver';
import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

const CassandaraConfig = {
  Host: process.env.CASSANDRA_HOST || '127.0.0.1',
  Port: Number(process.env.CASSANDRA_PORT) || 9042,
  User: process.env.CASSANDRA_USERNAME as string,
  Pass: process.env.CASSANDRA_PASSWORD as string,
  Keyspace: process.env.CASSANDRA_KEYSPACE || 'cassandra',
  Datacenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
};

const config: DseClientOptions = {
  contactPoints: [`${CassandaraConfig.Host}:${CassandaraConfig.Port}`],
  localDataCenter: CassandaraConfig.Datacenter,
  keyspace: CassandaraConfig.Keyspace,
};

if (CassandaraConfig.User && CassandaraConfig.Pass) config.credentials = { username: CassandaraConfig.User, password: CassandaraConfig.Pass };

export const CassandraClient = new Client(config);

(async () => {
  await CassandraClient.connect();
  Log(`Connected to Cassandra [Keyspace: ${CassandaraConfig.Keyspace}]`);
})();

export { types as Types };
