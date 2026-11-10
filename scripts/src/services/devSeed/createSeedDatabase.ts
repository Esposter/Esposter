import { withDatabaseName } from "#src/services/devSeed/withDatabaseName";
import { takeOne } from "@esposter/shared";
import postgres from "postgres";

// The server's own default database, which exists on every Postgres server and is where a missing database is created from
const SERVER_DEFAULT_DATABASE_NAME = "postgres";

// Creates the seed's database on the server the address names when it is absent. The name is the seed's own constant,
// Already gated, so it is interpolated into the statement, which takes no parameter for a database name
export const createSeedDatabase = async (databaseUrl: string, databaseName: string): Promise<void> => {
  const client = postgres(withDatabaseName(databaseUrl, SERVER_DEFAULT_DATABASE_NAME), { max: 1 });
  const { exists } = takeOne(
    await client<
      { exists: boolean }[]
    >`SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ${databaseName}) AS exists`,
  );
  if (!exists) await client.unsafe(`CREATE DATABASE "${databaseName}"`);
  await client.end();
};
