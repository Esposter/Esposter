import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMemberWithPower } from "#src/services/statue/healPartyMemberWithPower";
import { describe, expect, test } from "vitest";

describe(healPartyMemberWithPower, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const CHARACTER_ID = 1;
  const MAX_HEALTH = 10_000;
  const power: RestorativePower = { amount: 5000, changedAt: epoch };

  test("a click heals a tenth of the Max HP from the pool", () => {
    expect.hasAssertions();

    const party = createParty([CHARACTER_ID]);
    damagePartyMember(party, CHARACTER_ID, 0.5);

    expect(healPartyMemberWithPower(party, CHARACTER_ID, MAX_HEALTH, power)).toStrictEqual({ ...power, amount: 4000 });
    expect(getPartyMember(party, CHARACTER_ID).healthShare).toBeCloseTo(0.6);
  });

  test("the pool pays only what it holds when that is less", () => {
    expect.hasAssertions();

    const party = createParty([CHARACTER_ID]);
    damagePartyMember(party, CHARACTER_ID, 0.5);

    expect(healPartyMemberWithPower(party, CHARACTER_ID, MAX_HEALTH, { ...power, amount: 300 })).toStrictEqual({
      ...power,
      amount: 0,
    });
    expect(getPartyMember(party, CHARACTER_ID).healthShare).toBeCloseTo(0.53);
  });

  test("a fallen member is not healed by a click, and the pool is kept", () => {
    expect.hasAssertions();

    const party = createParty([CHARACTER_ID]);
    damagePartyMember(party, CHARACTER_ID, 1);

    expect(healPartyMemberWithPower(party, CHARACTER_ID, MAX_HEALTH, power)).toStrictEqual(power);
    expect(getPartyMember(party, CHARACTER_ID).healthShare).toBe(0);
  });
});
