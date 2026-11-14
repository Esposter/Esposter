import {
  CORE_MIGRATIONS_FOLDER,
  DEV_SEED_PERSIST_ROOT,
  STREAMS_MIGRATIONS_FOLDER,
} from "#src/services/devSeed/constants";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { StreamTableClient } from "@esposter/db";
import { createMockDatabase } from "@esposter/db-mock";
import { StreamTable } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/d1";

// Migrates both local databases the dev server reads, then writes the dataset into them. Nothing here reaches a remote
// Database, since the bindings are Miniflare's local D1 files, so there is no address to gate
export const runDevSeed = async (): Promise<void> => {
  const { db, dispose, streamsDb } = await createMockDatabase(
    CORE_MIGRATIONS_FOLDER,
    STREAMS_MIGRATIONS_FOLDER,
    DEV_SEED_PERSIST_ROOT,
  );
  await seedDevDataset({ db, messageClient: new StreamTableClient(drizzle(streamsDb), StreamTable.Messages) });
  await dispose();
};
