import type { HostedAssetObject } from "#src/models/HostedAssetObject";

import { getHostedAssetUrl } from "#src/services/getHostedAssetUrl";
import { describe, expect, test } from "vitest";

describe(getHostedAssetUrl, () => {
  const origin = "https://hosted.test";
  const sha256 = "0".repeat(64);
  const object: HostedAssetObject = {
    bytes: 4,
    contentType: "image/png",
    extension: ".png",
    scope: "dungeons",
    sha256,
  };

  test("names an object by its origin, its scope, its sha256 and its extension", () => {
    expect.hasAssertions();

    expect(getHostedAssetUrl(origin, object)).toBe(`https://hosted.test/dungeons/${sha256}.png`);
  });

  test("names changed bytes with a url of their own", () => {
    expect.hasAssertions();

    expect(getHostedAssetUrl(origin, { ...object, sha256: "1".repeat(64) })).not.toBe(
      getHostedAssetUrl(origin, object),
    );
  });
});
