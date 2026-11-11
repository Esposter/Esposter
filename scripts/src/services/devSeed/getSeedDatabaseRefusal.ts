import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { SEED_DATABASE_NAME } from "#src/services/devSeed/constants";
import { getDatabaseName } from "#src/services/devSeed/getDatabaseName";
import { checkIsLocalUrl } from "@esposter/shared";

// The seed writes to its own database on a server on this machine and to no other, so an address off this machine is a
// Remote server, and a database on this machine named anything else is the owner's dev database
export const getSeedDatabaseRefusal = (databaseUrl: string): SeedRefusal | undefined => {
  if (!checkIsLocalUrl(databaseUrl)) return SeedRefusal.NonLocalDatabase;
  return getDatabaseName(databaseUrl) === SEED_DATABASE_NAME ? undefined : SeedRefusal.DevDatabase;
};
