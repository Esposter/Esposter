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
});
