import type { MockDatabase } from "#src/models/MockDatabase";

import { createMigratedMockDatabase } from "#src/services/createMigratedMockDatabase";
import { getMigrationsDirectory } from "#src/services/getMigrationsDirectory";
import { usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(createMigratedMockDatabase, () => {
  let firstDatabase: MockDatabase;
  let secondDatabase: MockDatabase;

  // Building the template is the first copy's cost, which a test's own timeout would count
  beforeAll(async () => {
    const coreMigrationsDirectory = getMigrationsDirectory("core");
    firstDatabase = await createMigratedMockDatabase(coreMigrationsDirectory);
    secondDatabase = await createMigratedMockDatabase(coreMigrationsDirectory);
  });

  afterAll(async () => {
    await firstDatabase.dispose();
    await secondDatabase.dispose();
  });

  // Each file's database is a copy of one migrated template, so a copy has the schema and no rows, and a write to one
  // Copy is never read from another
  test("a copy starts migrated and empty, and a write to one copy never reaches another", async () => {
    expect.hasAssertions();

    const userId = v7();
    await firstDatabase.db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId });

    expect([await firstDatabase.db.$count(usersInAuth), await secondDatabase.db.$count(usersInAuth)]).toStrictEqual([
      1, 0,
    ]);
  });
});
