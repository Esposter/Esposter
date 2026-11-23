import type { HostedAssetObject } from "#src/models/HostedAssetObject";

import { TEST_ORIGIN, TEST_SHA256 } from "#src/services/constants.test";
import { getHostedAssetUrl } from "#src/services/getHostedAssetUrl";
import { describe, expect, test } from "vitest";

describe(getHostedAssetUrl, () => {
  const object: HostedAssetObject = { bytes: 4, extension: ".png", scope: "dungeons", sha256: TEST_SHA256 };

  test("names an object by its origin, its scope, its sha256 and its extension", () => {
    expect.hasAssertions();

    expect(getHostedAssetUrl(TEST_ORIGIN, object)).toBe(`${TEST_ORIGIN}/dungeons/${TEST_SHA256}.png`);
  });
});
