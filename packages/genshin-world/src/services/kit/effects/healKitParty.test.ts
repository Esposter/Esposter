import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NOELLE_CHARACTER_ID } from "#src/services/character/constants";
import { createNoelleKit } from "#src/services/kit/characters/noelleKit";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NOELLE_KIT = createNoelleKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [NOELLE_CHARACTER_ID]));

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

  test("heals each party member by the flat HP and DEF share, each over its own Max HP, on a passing roll under a shield", () => {
    expect.hasAssertions();
    const noelle = createCombatant(NOELLE_CHARACTER_ID, 10_000);
    const member = createCombatant(MEMBER_ID, 20_000);
    const party = createParty([NOELLE_CHARACTER_ID, MEMBER_ID]);
    for (const characterId of [NOELLE_CHARACTER_ID, MEMBER_ID]) getPartyMember(party, characterId).healthShare = 0.5;
    const healParty = { chance: () => 0.5, defenseShare: 0.2128, flatHealth: 102.7 };

    const isHealed = healKitParty(
      party,
      new Map([
        [MEMBER_ID, member],
        [NOELLE_CHARACTER_ID, noelle],
      ]),
      [SHIELD],
      noelle,
      { ...NOELLE_HIT, healParty },
      () => 0,
    );

    const healedHp = healParty.flatHealth + healParty.defenseShare * noelle.attributes.defense;
    expect(isHealed).toBe(true);
    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBeCloseTo(
      0.5 + healedHp / noelle.attributes.maxHealth,
      5,
    );
    expect(getPartyMember(party, MEMBER_ID).healthShare).toBeCloseTo(0.5 + healedHp / member.attributes.maxHealth, 5);
  });

  test("neither rolls nor heals without a shield, nor on a failing roll", () => {
    expect.hasAssertions();
    const noelle = createCombatant(NOELLE_CHARACTER_ID, 10_000);
    const party = createParty([NOELLE_CHARACTER_ID]);
    const combatants = new Map([[NOELLE_CHARACTER_ID, noelle]]);
    const hit = { ...NOELLE_HIT, healParty: { chance: () => 0.5, defenseShare: 0.2128, flatHealth: 102.7 } };

    expect(healKitParty(party, combatants, [], noelle, hit, () => 0)).toBe(false);
    expect(healKitParty(party, combatants, [SHIELD], noelle, hit, () => 0.9)).toBe(false);
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

    const isHealed = healKitParty(
      party,
      new Map([[NOELLE_CHARACTER_ID, striker]]),
      [],
      striker,
      { ...NOELLE_HIT, healParty },
      () => 0,
    );

    expect(isHealed).toBe(true);
    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBeCloseTo(
      0.5 + (healParty.attackShare * striker.attributes.attack) / striker.attributes.maxHealth,
      5,
    );
  });
});
