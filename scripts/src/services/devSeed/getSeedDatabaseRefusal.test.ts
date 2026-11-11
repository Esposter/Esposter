import { SeedRefusal } from "#src/models/devSeed/SeedRefusal";
import { SEED_DATABASE_NAME } from "#src/services/devSeed/constants";
import { getSeedDatabaseRefusal } from "#src/services/devSeed/getSeedDatabaseRefusal";
import { describe, expect, test } from "vitest";

describe(getSeedDatabaseRefusal, () => {
  const SEED_DATABASE_URL = `postgres://localhost/${SEED_DATABASE_NAME}`;

  test("the seed's own database on this machine is not refused", () => {
    expect.hasAssertions();
    expect(getSeedDatabaseRefusal(SEED_DATABASE_URL)).toBeUndefined();
  });

  test("another database on this machine is refused as the dev database", () => {
    expect.hasAssertions();
    expect(getSeedDatabaseRefusal("postgres://localhost/a")).toBe(SeedRefusal.DevDatabase);
  });

  test("a database query parameter overrides the path, so the dev database named there is refused", () => {
    expect.hasAssertions();
    expect(getSeedDatabaseRefusal(`${SEED_DATABASE_URL}?database=a`)).toBe(SeedRefusal.DevDatabase);
  });

  test("the seed's database name on a remote server is refused as a non-local database", () => {
    expect.hasAssertions();
    expect(getSeedDatabaseRefusal(`postgres://remote.example/${SEED_DATABASE_NAME}`)).toBe(
      SeedRefusal.NonLocalDatabase,
    );
  });
});
