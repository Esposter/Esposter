import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { checkIsGatheringPlaceStanding } from "#src/services/gathering/checkIsGatheringPlaceStanding";
import { describe, expect, test } from "vitest";

describe(checkIsGatheringPlaceStanding, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);

  test("a point never picked stands", () => {
    expect.hasAssertions();
    expect(checkIsGatheringPlaceStanding(undefined, GatheringRespawn.Specialty, epoch)).toBe(true);
  });

  test("a picked point is gone until its respawn, and stands from the moment it comes back", () => {
    expect.hasAssertions();
    const pickedAt = epoch;
    const respawnAt = epoch.add({ hours: 46 });
    expect(
      checkIsGatheringPlaceStanding(pickedAt, GatheringRespawn.Specialty, respawnAt.subtract({ seconds: 1 })),
    ).toBe(false);
    expect(checkIsGatheringPlaceStanding(pickedAt, GatheringRespawn.Specialty, respawnAt)).toBe(true);
  });
});
