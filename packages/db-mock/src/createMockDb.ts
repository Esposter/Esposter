import type { MockDatabase } from "#src/models/MockDatabase";

import { createMockDatabase } from "#src/services/createMockDatabase";
import { fileURLToPath } from "node:url";

// The migration folders `drizzle.config.ts` writes, one per database. This file sits directly under the package's `src`,
// and `dist` is one folder deep the same way, so three levels up is the repository root from either
const CORE_MIGRATIONS_DIRECTORY = fileURLToPath(new URL("../../../apps/web/server/db/migrations", import.meta.url));
const STREAMS_MIGRATIONS_DIRECTORY = fileURLToPath(
  new URL("../../../apps/web/server/db/migrations-streams", import.meta.url),
);

// A test file gets one database, shared by every call in it, so a `beforeAll` and a helper can both ask for it
let mockDatabase: Promise<MockDatabase> | undefined;
export const createMockDb = async (): Promise<MockDatabase> => {
  mockDatabase ??= createMockDatabase(CORE_MIGRATIONS_DIRECTORY, STREAMS_MIGRATIONS_DIRECTORY);
  return mockDatabase;
};
