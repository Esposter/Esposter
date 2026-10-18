import { computeDomainScenePose } from "#src/services/domains/computeDomainScenePose";
import { describe, expect, test } from "vitest";

describe(computeDomainScenePose, () => {
  test("entering a domain fades into its stand-in arena beside the entrance", () => {
    expect.hasAssertions();

    expect(computeDomainScenePose({ heightOffset: 1, position: { x: 100, z: -50 }, rotation: 90 })).toStrictEqual({
      heightOffset: 1,
      point: { x: 130, z: -50 },
      yaw: 90,
    });
  });
});
