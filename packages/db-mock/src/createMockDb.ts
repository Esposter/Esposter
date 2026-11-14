import type { MockDatabase } from "#src/models/MockDatabase";

import { createMockDatabase } from "#src/services/createMockDatabase";
import { findRepositoryRoot } from "#src/services/findRepositoryRoot";
import { join } from "node:path";

// The migration folders `drizzle.config.ts` writes, one per database. They are found from the working directory rather than
// From `import.meta.url`, which the Nuxt test environment serves over http and so is not a file path a folder can be read from
const getMigrationsDirectory = (databaseName: string) =>
  join(findRepositoryRoot(process.cwd()), "apps", "web", "server", "db", "migrations", databaseName);

// A test file gets one database, shared by every call in it, so a `beforeAll` and a helper can both ask for it
let mockDatabase: Promise<MockDatabase> | undefined;
export const createMockDb = async (): Promise<MockDatabase> => {
  mockDatabase ??= createMockDatabase(getMigrationsDirectory("core"));
  return mockDatabase;
};
