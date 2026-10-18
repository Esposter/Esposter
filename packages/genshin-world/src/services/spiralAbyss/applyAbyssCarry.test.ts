import type { PartyMember } from "#src/models/party/PartyMember";

import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { applyAbyssCarry } from "#src/services/spiralAbyss/applyAbyssCarry";
import { takeAbyssCarry } from "#src/services/spiralAbyss/takeAbyssCarry";
import { describe, expect, test } from "vitest";

const createMember = (energy: number, healthShare: number): PartyMember => ({
  bondOfLifeClearedShare: 0,
  bondOfLifeShare: 0,
  burstCooldownSeconds: 0,
  elementalState: createElementalState(),
  energy,
  healthShare,
  skillCooldownSeconds: 0,
});

describe(applyAbyssCarry, () => {
  const FIRST_CHARACTER_ID = 1;
  const SECOND_CHARACTER_ID = 2;

  test("health and energy at a clear carry into the next chamber", () => {
    expect.hasAssertions();
    const firstMember = createMember(40, 0.7);
    const characterIdMemberMap = new Map([
      [FIRST_CHARACTER_ID, firstMember],
      [SECOND_CHARACTER_ID, createMember(10, 1)],
    ]);
    const carry = takeAbyssCarry([FIRST_CHARACTER_ID, SECOND_CHARACTER_ID], characterIdMemberMap);
    // The party heals and gains energy after the clear, which the next chamber does not start from
    Object.assign(firstMember, { energy: 60, healthShare: 1 });

    expect(applyAbyssCarry(characterIdMemberMap, carry).get(FIRST_CHARACTER_ID)).toStrictEqual(createMember(40, 0.7));
  });
});
