import { CORE_MIGRATIONS_FOLDER, DEV_SEED_PERSIST_ROOT } from "#src/services/devSeed/constants";
import { seedDevDataset } from "#src/services/devSeed/seedDevDataset";
import { createMockDatabase } from "@esposter/db-mock";

// Migrates the local database the dev server reads, then writes the dataset into it. Nothing here reaches a remote
// Database, since the binding is Miniflare's local D1 file, so there is no address to gate
export const runDevSeed = async (): Promise<void> => {
  const { db, dispose } = await createMockDatabase(CORE_MIGRATIONS_FOLDER, DEV_SEED_PERSIST_ROOT);
  await seedDevDataset({ db });
  await dispose();
};
