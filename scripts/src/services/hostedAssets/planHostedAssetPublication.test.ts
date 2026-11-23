import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(planHostedAssetPublication, () => {
  // The JSON of "é" is four UTF-8 bytes against its three characters, so a size counted in characters would differ
  test("sizes a lock entry by the UTF-8 bytes of the JSON its hash names", () => {
    expect.hasAssertions();

    const { lock } = planHostedAssetPublication({ indexes: {}, objects: { "stats/weapons": "é" } });

    expect(lock.objects["stats/weapons"]).toStrictEqual({
      bytes: 4,
      extension: ".json",
      scope: "stats/weapons",
      sha256: getContentAddress(Buffer.from(JSON.stringify("é"))),
    });
  });
});
