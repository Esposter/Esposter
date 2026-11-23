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
      `[InvalidOperationError: Invalid operation: Create, name: a/b, is under a, which another product's lock declares]`,
    );
  });
});
