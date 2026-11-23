import { hostedAssetLockSchema } from "#src/models/HostedAssetLock";
import { describe, expect, test } from "vitest";

describe("hostedAssetLockSchema", () => {
  const sha256 = "0".repeat(64);
  const recordsLock = {
    indexes: { "books/index": { bytes: 2, extension: ".json", scope: "books", sha256 } },
    objects: { "stats/characters": { bytes: 3, extension: ".json", scope: "stats", sha256 } },
  };
  const filesLock = {
    indexes: {},
    objects: { SceneBattleForestBackground: { bytes: 4, extension: ".png", scope: "dungeons", sha256 } },
  };

  test.each([
    ["a product of records", recordsLock],
    ["a product of files", filesLock],
  ])("parses the lock of %s", (_description, lock) => {
    expect.hasAssertions();

    expect(hostedAssetLockSchema.parse(lock)).toStrictEqual(lock);
  });

  test("rejects an object whose entry lacks its sha256", () => {
    expect.hasAssertions();

    const lockWithoutHash = {
      indexes: {},
      objects: { SceneBattleForestBackground: { bytes: 4, extension: ".png", scope: "dungeons" } },
    };

    expect(hostedAssetLockSchema.safeParse(lockWithoutHash).success).toBe(false);
  });
});
