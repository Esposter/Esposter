import { ParticleSource } from "#src/models/party/ParticleSource";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { describe, expect, test } from "vitest";

describe(stepPartyCooldowns, () => {
  test("lowers every member's cooldowns of the deployed team, none below zero", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    party.characterIdMemberMap.set(1, { ...createPartyMember(), burstCooldownSeconds: 1, skillCooldownSeconds: 0.5 });
    party.characterIdMemberMap.set(2, { ...createPartyMember(), skillCooldownSeconds: 2 });
    stepPartyCooldowns(party, 0.75);

    expect([getPartyMember(party, 1), getPartyMember(party, 2)]).toStrictEqual([
      { ...createPartyMember(), burstCooldownSeconds: 0.25, skillCooldownSeconds: 0 },
      { ...createPartyMember(), skillCooldownSeconds: 1.25 },
    ]);
  });

  test("a burst and a particle cooldown run out on the step their seconds do, not one step late", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.characterIdMemberMap.set(1, { ...createPartyMember(), burstCooldownSeconds: 5 });
    party.particleCooldownSecondsMap.set(ParticleSource.HighVoltage, 5);
    for (let step = 0; step < 300; step++) stepPartyCooldowns(party, FIXED_STEP_SECONDS);

    expect([
      getPartyMember(party, 1).burstCooldownSeconds,
      party.particleCooldownSecondsMap.get(ParticleSource.HighVoltage),
    ]).toStrictEqual([0, 0]);
  });
});
