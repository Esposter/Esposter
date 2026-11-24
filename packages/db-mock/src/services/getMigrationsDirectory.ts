import { DATABASE_MIGRATIONS_DIRECTORY } from "@esposter/configuration/constants";
import { findRepositoryRoot } from "@esposter/shared-node/find-repository-root";
import { join } from "node:path";

// The migration folders `drizzle.config.ts` writes, one per database. They are found from the working directory rather
// Than from `import.meta.url`, which the Nuxt test environment serves over http and so is not a file path a folder can
// Be read from
export const getMigrationsDirectory = (databaseName: string) =>
  join(findRepositoryRoot(process.cwd()), DATABASE_MIGRATIONS_DIRECTORY, databaseName);
