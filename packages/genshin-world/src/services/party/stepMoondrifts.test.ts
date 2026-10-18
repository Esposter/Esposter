import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createParty } from "#src/services/party/createParty";
import { stepMoondrifts } from "#src/services/party/stepMoondrifts";
import { describe, expect, test } from "vitest";

describe(stepMoondrifts, () => {
  test("runs down each Moondrift and the Harmony's cooldown, a Moondrift whose seconds ran out gone", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.lunarCrystallize.harmonyCooldownSeconds = 0.25;
    party.lunarCrystallize.moondrifts = [
      { position: { x: 0, z: 0 }, secondsRemaining: 0.5 },
      { position: { x: 1, z: 0 }, secondsRemaining: 2 },
    ];
    stepMoondrifts(party, 0.5);

    expect(party.lunarCrystallize).toStrictEqual({
      contributorIds: new Set(),
      count: 0,
      harmonyCooldownSeconds: 0,
      moondrifts: [{ position: { x: 1, z: 0 }, secondsRemaining: 1.5 }],
    });
  });

  test("runs a Moondrift and the Harmony's cooldown down to none on the frame they fall due, not a frame later", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.lunarCrystallize.harmonyCooldownSeconds = 0.5;
    party.lunarCrystallize.moondrifts = [{ position: { x: 0, z: 0 }, secondsRemaining: 0.5 }];
    for (let frame = 0; frame < 30; frame++) stepMoondrifts(party, FIXED_STEP_SECONDS);

    expect(party.lunarCrystallize).toStrictEqual({
      contributorIds: new Set(),
      count: 0,
      harmonyCooldownSeconds: 0,
      moondrifts: [],
    });
  });
});
