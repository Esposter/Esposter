import type { SeedRefusal } from "#src/models/devSeed/SeedRefusal";

import { MIGRATIONS_FOLDER } from "#src/services/devSeed/constants";
import { createSeedDatabase } from "#src/services/devSeed/createSeedDatabase";
import { getDatabaseName } from "#src/services/devSeed/getDatabaseName";
import { getSeedRefusal } from "#src/services/devSeed/getSeedRefusal";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { getTableClient } from "@esposter/db";
import { AzureTable, relations } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// Gates the run's two targets before anything is created, then creates the seed's database, migrates it and seeds it.
// Both stores are the run's own: the database the address names and the storage connection string the run started
export const runDevSeed = async (
  databaseUrl: string,
  storageConnectionString: string,
): Promise<SeedRefusal | undefined> => {
  const databaseName = getDatabaseName(databaseUrl);
  const refusal = getSeedRefusal(databaseName, storageConnectionString);
  if (refusal) return refusal;
  await createSeedDatabase(databaseUrl, databaseName);
  const client = postgres(databaseUrl);
  const db = drizzle({ client, relations });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  const messageClient = await getTableClient(storageConnectionString, AzureTable.Messages);
  const messageAscendingClient = await getTableClient(storageConnectionString, AzureTable.MessagesAscending);
  const seedRefusal = await seedDevDataset({
    databaseName,
    db,
    messageAscendingClient,
    messageClient,
    storageConnectionString,
  });
  await client.end();
  return seedRefusal;
};
