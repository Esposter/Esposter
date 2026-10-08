import { FishReaction } from "#src/models/fishing/FishReaction";
import { computeFishReaction } from "#src/services/fishing/computeFishReaction";
import { describe, expect, test } from "vitest";

describe(computeFishReaction, () => {
  const fish = { attractRange: 2.4, fleeRange: 1 };
  const NEAR = 0.5;
  const REACH = 2;
  const FAR = 3;

  test("a lure within the flee range scares the fish whatever the bait", () => {
    expect.hasAssertions();

    expect(computeFishReaction(fish, NEAR, true)).toBe(FishReaction.Flees);
    expect(computeFishReaction(fish, NEAR, false)).toBe(FishReaction.Flees);
  });

  test("a lure of the bait the fish takes within its attract range turns it, and any other is ignored", () => {
    expect.hasAssertions();

    expect(computeFishReaction(fish, REACH, true)).toBe(FishReaction.Turns);
    expect(computeFishReaction(fish, REACH, false)).toBe(FishReaction.Ignores);
    expect(computeFishReaction(fish, FAR, true)).toBe(FishReaction.Ignores);
  });
});
