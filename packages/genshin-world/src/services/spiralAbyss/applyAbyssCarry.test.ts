import { createPartyMember } from "#src/services/party/createPartyMember";
import { applyAbyssCarry } from "#src/services/spiralAbyss/applyAbyssCarry";
import { takeAbyssCarry } from "#src/services/spiralAbyss/takeAbyssCarry";
import { describe, expect, test } from "vitest";

describe(applyAbyssCarry, () => {
  const FIRST_CHARACTER_ID = 1;
  const SECOND_CHARACTER_ID = 2;

  test("health and energy at a clear carry into the next chamber", () => {
    expect.hasAssertions();
    const firstMember = { ...createPartyMember(), energy: 40, healthShare: 0.7 };
    const characterIdMemberMap = new Map([
      [FIRST_CHARACTER_ID, firstMember],
      [SECOND_CHARACTER_ID, { ...createPartyMember(), energy: 10, healthShare: 1 }],
    ]);
    const carry = takeAbyssCarry(characterIdMemberMap);
    // The party heals and gains energy after the clear, which the next chamber does not start from
    Object.assign(firstMember, { energy: 60, healthShare: 1 });

    expect(applyAbyssCarry(characterIdMemberMap, carry)).toStrictEqual(
      new Map([
        [FIRST_CHARACTER_ID, { ...createPartyMember(), energy: 40, healthShare: 0.7 }],
        [SECOND_CHARACTER_ID, { ...createPartyMember(), energy: 10, healthShare: 1 }],
      ]),
    );
  });
});
