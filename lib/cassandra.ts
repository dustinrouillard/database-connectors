import { Client, types } from 'cassandra-driver';
import { Log } from '@dustinrouillard/fastify-utilities/modules/logger';

const CassandaraConfig = {
  Host: process.env.CASSANDRA_HOST || '127.0.0.1',
  Port: Number(process.env.CASSANDRA_PORT) || 9042,
  User: process.env.CASSANDRA_USERNAME || 'cassandra',
  Pass: process.env.CASSANDRA_PASSWORD || 'docker',
  Keyspace: process.env.CASSANDRA_KEYSPACE || 'cassandra',
  Datacenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
};

export const CassandraClient = new Client({
  contactPoints: [`${CassandaraConfig.Host}:${CassandaraConfig.Port}`],
  localDataCenter: CassandaraConfig.Datacenter,
  keyspace: CassandaraConfig.Keyspace,
  credentials: {
    username: CassandaraConfig.User,
    password: CassandaraConfig.Pass,
  },
});

(async () => {
  await CassandraClient.connect();
  Log(`Connected to Cassandra [Keyspace: ${CassandaraConfig.Keyspace}]`);
})();

export { types as Types };
