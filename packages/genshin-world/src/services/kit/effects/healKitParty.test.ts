import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NOELLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NOELLE_CHARACTER_ID);

describe(healKitParty, () => {
  const NOELLE_HIT = takeOne(NOELLE_KIT.elementalSkill.hits);
  const SHIELD: KitEffect = {
    characterId: NOELLE_CHARACTER_ID,
    element: undefined,
    health: 1000,
    kind: "shield",
    secondsRemaining: 12,
  };

  const MEMBER_ID = 10_000_032;
  const createCombatant = (characterId: number, maxHealth: number): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseDefense, value: 800 },
      { attribute: Attribute.BaseHealth, value: maxHealth },
    ]),
    characterId,
    constellationCount: 0,
    elementalResonances: [],
    kit: NOELLE_KIT,
    level: 90,
  });

  test("heals each member of the deployed team by the flat HP and DEF share, each over its own Max HP, on a passing roll under a shield", () => {
    expect.hasAssertions();
    const noelle = createCombatant(NOELLE_CHARACTER_ID, 10_000);
    const member = createCombatant(MEMBER_ID, 20_000);
    const party = createParty([NOELLE_CHARACTER_ID, MEMBER_ID]);
    for (const characterId of [NOELLE_CHARACTER_ID, MEMBER_ID]) getPartyMember(party, characterId).healthShare = 0.5;
    const healParty = { chance: () => 0.5, defenseShare: 0.2128, flatHealth: 102.7 };
    const isHealed = healKitParty(
      createKitTestContext(noelle, {
        characterIdCombatantMap: new Map([
          [MEMBER_ID, member],
          [NOELLE_CHARACTER_ID, noelle],
        ]),
        kitEffectState: { effects: [SHIELD] },
        party,
      }),
      noelle,
      noelle,
      { ...NOELLE_HIT, healParty },
    );

    const healedHp = healParty.flatHealth + healParty.defenseShare * noelle.attributes.defense;
    expect(isHealed).toBe(true);
    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBeCloseTo(
      0.5 + healedHp / noelle.attributes.maxHealth,
      5,
    );
    expect(getPartyMember(party, MEMBER_ID).healthShare).toBeCloseTo(0.5 + healedHp / member.attributes.maxHealth, 5);
  });

  test("neither rolls nor heals without a shield the striker cast, a Crystallize shield being none, nor on a failing roll", () => {
    expect.hasAssertions();
    const noelle = createCombatant(NOELLE_CHARACTER_ID, 10_000);
    const party = createParty([NOELLE_CHARACTER_ID]);
    const hit = { ...NOELLE_HIT, healParty: { chance: () => 0.5, defenseShare: 0.2128, flatHealth: 102.7 } };
    const createContext = (effects: KitEffect[], random = () => 0) =>
      createKitTestContext(noelle, { kitEffectState: { effects }, party, random });

    expect(healKitParty(createContext([]), noelle, noelle, hit)).toBe(false);
    expect(healKitParty(createContext([{ ...SHIELD, isCrystallize: true }]), noelle, noelle, hit)).toBe(false);
    expect(
      healKitParty(
        createContext([SHIELD], () => 0.9),
        noelle,
        noelle,
        hit,
      ),
    ).toBe(false);
    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBe(1);
  });

  test("an unshielded heal rolls without a shield, healing by the striker's ATK share", () => {
    expect.hasAssertions();
    const striker: Combatant = {
      ...createCombatant(NOELLE_CHARACTER_ID, 10_000),
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseAttack, value: 1000 },
        { attribute: Attribute.BaseHealth, value: 10_000 },
      ]),
    };
    const party = createParty([NOELLE_CHARACTER_ID]);
    getPartyMember(party, NOELLE_CHARACTER_ID).healthShare = 0.5;
    const healParty = {
      attackShare: 0.15,
      chance: () => 0.5,
      defenseShare: 0,
      flatHealth: 0,
      isUnshielded: true as const,
    };

    const isHealed = healKitParty(createKitTestContext(striker, { party }), striker, striker, {
      ...NOELLE_HIT,
      healParty,
    });

    expect(isHealed).toBe(true);
    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBeCloseTo(
      0.5 + (healParty.attackShare * striker.attributes.attack) / striker.attributes.maxHealth,
      5,
    );
  });
});
