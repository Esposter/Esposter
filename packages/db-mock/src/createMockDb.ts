import type { MockDatabase } from "#src/models/MockDatabase";

import { createMigratedMockDatabase } from "#src/services/createMigratedMockDatabase";
import { getMigrationsDirectory } from "#src/services/getMigrationsDirectory";

// A test file gets one database, shared by every call in it, so a `beforeAll` and a helper can both ask for it
let mockDatabase: Promise<MockDatabase> | undefined;
export const createMockDb = async (): Promise<MockDatabase> => {
  mockDatabase ??= createMigratedMockDatabase(getMigrationsDirectory("core"));
  return mockDatabase;
};
