import type { RestorativePower } from "#src/models/statue/RestorativePower";

import { REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { autoRecoverParty } from "#src/services/statue/autoRecoverParty";
import { describe, expect, test } from "vitest";

describe(autoRecoverParty, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const FALLEN_CHARACTER_ID = 1;
  const HURT_CHARACTER_ID = 2;
  const MAX_HEALTH = 10_000;
  const THRESHOLD_HEALTH_SHARE = 0.5;
  const getMaxHealth = (): number => MAX_HEALTH;

  test("members under the threshold are healed when the pool holds enough", () => {
    expect.hasAssertions();

    const party = createParty([FALLEN_CHARACTER_ID, HURT_CHARACTER_ID]);
    damagePartyMember(party, FALLEN_CHARACTER_ID, 1);
    damagePartyMember(party, HURT_CHARACTER_ID, 0.8);
    const power: RestorativePower = { amount: 6000, changedAt: epoch };

    const { amount } = autoRecoverParty(party, power, THRESHOLD_HEALTH_SHARE, getMaxHealth);

    expect(amount).toBeCloseTo(1500);
    expect(getPartyMember(party, FALLEN_CHARACTER_ID).healthShare).toBeCloseTo(THRESHOLD_HEALTH_SHARE);
    expect(getPartyMember(party, HURT_CHARACTER_ID).healthShare).toBeCloseTo(THRESHOLD_HEALTH_SHARE);
  });

  test("a pool short of the threshold heals the first slots first", () => {
    expect.hasAssertions();

    const party = createParty([FALLEN_CHARACTER_ID, HURT_CHARACTER_ID]);
    damagePartyMember(party, FALLEN_CHARACTER_ID, 1);
    damagePartyMember(party, HURT_CHARACTER_ID, 0.8);
    const power: RestorativePower = { amount: 1000, changedAt: epoch };

    expect(autoRecoverParty(party, power, THRESHOLD_HEALTH_SHARE, getMaxHealth)).toStrictEqual({ ...power, amount: 0 });
    expect(getPartyMember(party, FALLEN_CHARACTER_ID).healthShare).toBeCloseTo(REVIVE_HEALTH_SHARE + 0.1);
    expect(getPartyMember(party, HURT_CHARACTER_ID).healthShare).toBeCloseTo(0.2);
  });

  test("standing by a statue for two seconds revives the fallen", () => {
    expect.hasAssertions();

    const party = createParty([FALLEN_CHARACTER_ID]);
    damagePartyMember(party, FALLEN_CHARACTER_ID, 1);
    const power: RestorativePower = { amount: 0, changedAt: epoch };

    expect(autoRecoverParty(party, power, THRESHOLD_HEALTH_SHARE, getMaxHealth)).toStrictEqual(power);
    expect(getPartyMember(party, FALLEN_CHARACTER_ID).healthShare).toBeCloseTo(REVIVE_HEALTH_SHARE);
  });
});
