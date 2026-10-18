import type { Seelie } from "#src/models/puzzle/Seelie";

import { ChestKind } from "#src/models/chest/ChestKind";
import { SeelieState } from "#src/models/puzzle/SeelieState";
import { computeSeelieChestPlaces } from "#src/services/puzzle/computeSeelieChestPlaces";
import { SEELIE_RETURN_SECONDS, SEELIE_ROUTE_SECONDS } from "#src/services/puzzle/constants";
import { stepSeelie } from "#src/services/puzzle/stepSeelie";
import { describe, expect, test } from "vitest";

describe(stepSeelie, () => {
  const START = { x: 0, z: 0 };
  const COURT = { x: 10, z: 0 };
  const createSeelie = (state: SeelieState): Seelie => ({
    court: COURT,
    id: "seelie",
    progress: 0,
    start: START,
    state,
    unfollowedSeconds: 0,
  });

  test("is led once followed while resting", () => {
    expect.hasAssertions();

    const seelie = createSeelie(SeelieState.Resting);
    stepSeelie(seelie, 1, true);

    expect(seelie.state).toBe(SeelieState.Led);
  });

  test("stays at rest when not followed", () => {
    expect.hasAssertions();

    const seelie = createSeelie(SeelieState.Resting);
    stepSeelie(seelie, 1, false);

    expect({ progress: seelie.progress, state: seelie.state }).toStrictEqual({
      progress: 0,
      state: SeelieState.Resting,
    });
  });

  test("a followed Seelie reaches its court and spawns its chest", () => {
    expect.hasAssertions();

    const seelie = createSeelie(SeelieState.Led);
    stepSeelie(seelie, SEELIE_ROUTE_SECONDS, true);

    expect({ chestPlaces: computeSeelieChestPlaces([seelie]), state: seelie.state }).toStrictEqual({
      chestPlaces: [{ id: `seelie-chest-${seelie.id}`, kind: ChestKind.Exquisite, position: COURT }],
      state: SeelieState.Settled,
    });
  });

  test("a Seelie left unfollowed returns to its start", () => {
    expect.hasAssertions();

    const seelie = createSeelie(SeelieState.Led);
    seelie.progress = 0.5;
    stepSeelie(seelie, SEELIE_RETURN_SECONDS, false);

    expect({
      progress: seelie.progress,
      state: seelie.state,
      unfollowedSeconds: seelie.unfollowedSeconds,
    }).toStrictEqual({ progress: 0, state: SeelieState.Resting, unfollowedSeconds: 0 });
  });

  test("stays settled in its court whatever follows it", () => {
    expect.hasAssertions();

    const seelie = createSeelie(SeelieState.Settled);
    seelie.progress = 1;
    stepSeelie(seelie, SEELIE_RETURN_SECONDS, false);

    expect({ progress: seelie.progress, state: seelie.state }).toStrictEqual({
      progress: 1,
      state: SeelieState.Settled,
    });
  });
});
