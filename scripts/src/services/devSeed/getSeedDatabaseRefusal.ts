import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { SEED_DATABASE_NAME } from "#src/services/devSeed/constants";

// The seed writes to its own database and to no other, so a target named anything else is the owner's dev database
export const getSeedDatabaseRefusal = (databaseName: string): SeedRefusal | undefined =>
  databaseName === SEED_DATABASE_NAME ? undefined : SeedRefusal.DevDatabase;
