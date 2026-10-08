import { computeLightningBolt } from "#src/atmosphere/computeLightningBolt";
import { describe, expect, test } from "vitest";

describe(computeLightningBolt, () => {
  const lightningBoltOptions = { branchCount: 1, height: 3, roughness: 1, seed: 0, segmentCount: 3, width: 1 };

  test("is the same bolt for the same options", () => {
    expect.hasAssertions();

    expect(computeLightningBolt(lightningBoltOptions)).toStrictEqual(computeLightningBolt(lightningBoltOptions));
  });

  test("strikes the origin and climbs its channel to the cloud base", () => {
    expect.hasAssertions();

    const { positions } = computeLightningBolt(lightningBoltOptions);
    // The channel's last segment's far end, its third vertex
    const topOffset = ((lightningBoltOptions.segmentCount - 1) * 4 + 2) * 3;

    expect({ strike: [...positions.subarray(0, 3)], top: positions[topOffset + 1] }).toStrictEqual({
      strike: [0, 0, 0],
      top: lightningBoltOptions.height,
    });
  });
});
