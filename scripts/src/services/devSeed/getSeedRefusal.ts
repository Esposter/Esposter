import type { SeedRefusal } from "#src/models/devSeed/SeedRefusal";

import { getSeedDatabaseRefusal } from "#src/services/devSeed/getSeedDatabaseRefusal";
import { getSeedStorageRefusal } from "#src/services/devSeed/getSeedStorageRefusal";

// Both targets, checked before the seed touches either store. The database is checked first, so a refusal names the
// First target that is not the seed's own
export const getSeedRefusal = (databaseName: string, storageConnectionString: string): SeedRefusal | undefined =>
  getSeedDatabaseRefusal(databaseName) ?? getSeedStorageRefusal(storageConnectionString);
