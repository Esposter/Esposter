import { planHostedAssetPublication } from "#src/services/hostedAssets/planHostedAssetPublication";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(planHostedAssetPublication, () => {
  const STATS_WEAPONS_KEY = "stats/weapons";

  // The JSON of "é" is four UTF-8 bytes against its three characters, so a size counted in characters would differ
  test("sizes a lock entry by the UTF-8 bytes of the JSON its hash names", () => {
    expect.hasAssertions();

    const { lock } = planHostedAssetPublication({ indexes: {}, objects: { [STATS_WEAPONS_KEY]: "é" } });

    expect(lock.objects[STATS_WEAPONS_KEY]).toStrictEqual({
      bytes: 4,
      extension: ".json",
      scope: STATS_WEAPONS_KEY,
      sha256: getContentAddress(Buffer.from(JSON.stringify("é"))),
    });
  });
});
