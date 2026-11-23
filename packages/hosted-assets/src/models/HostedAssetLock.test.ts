import { hostedAssetLockSchema } from "#src/models/HostedAssetLock";
import { TEST_SHA256 } from "#src/services/constants.test";
import { describe, expect, test } from "vitest";

describe("hostedAssetLockSchema", () => {
  const object = { bytes: 0, extension: "", scope: " ", sha256: TEST_SHA256 };
  const recordsLock = { indexes: { "": object }, objects: { " ": object } };
  const filesLock = { indexes: {}, objects: { "": object } };

  test.each([
    ["a product of records", recordsLock],
    ["a product of files", filesLock],
  ])("parses the lock of %s", (_description, lock) => {
    expect.hasAssertions();

    expect(hostedAssetLockSchema.parse(lock)).toStrictEqual(lock);
  });

  test("rejects an object whose entry lacks its sha256", () => {
    expect.hasAssertions();

    const lockWithoutHash = { indexes: {}, objects: { "": { bytes: 0, extension: "", scope: " " } } };

    expect(hostedAssetLockSchema.safeParse(lockWithoutHash).success).toBe(false);
  });
});
