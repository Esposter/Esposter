import { assertScopeUnclaimed } from "#src/services/hostedAssets/assertScopeUnclaimed";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(assertScopeUnclaimed, () => {
  test("a scope under a prefix another product's lock declares is refused", () => {
    expect.hasAssertions();

    const sha256 = getContentAddress(Buffer.from(TEST_FILENAME));
    const otherLock = {
      indexes: {},
      objects: { [TEST_FILENAME]: { bytes: 1, extension: ".png", scope: TEST_FILENAME, sha256 } },
    };

    expect(() => {
      assertScopeUnclaimed(`${TEST_FILENAME}/b`, [otherLock]);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: a/b, overlaps a, which another product's lock declares]`,
    );
  });

  test("a scope that is the prefix of a scope another product's lock declares is refused", () => {
    expect.hasAssertions();

    const sha256 = getContentAddress(Buffer.from(TEST_FILENAME));
    const otherLock = {
      indexes: {},
      objects: { [`${TEST_FILENAME}/b`]: { bytes: 1, extension: ".png", scope: `${TEST_FILENAME}/b`, sha256 } },
    };

    expect(() => {
      assertScopeUnclaimed(TEST_FILENAME, [otherLock]);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: a, overlaps a/b, which another product's lock declares]`,
    );
  });
});
