import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(hitPartyMember, () => {
  const MAX_HEALTH = 1000;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: MAX_HEALTH }]),
    characterId: 1,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const characterIdCombatantMap = new Map([[1, combatant]]);

  test("should lose the share of max HP the shields do not absorb", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const shield: KitShield = { characterId: 2, health: 50, kind: "shield", secondsRemaining: 10 };

    hitPartyMember(party, combatant, { effects: [shield] }, characterIdCombatantMap, 100);

    expect(shield.health).toBe(0);
    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - 50 / MAX_HEALTH);
  });

  test("a Shield Strength buff on the member on the field raises what the team's shields absorb", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const shield: KitShield = { characterId: 2, health: 50, kind: "shield", secondsRemaining: 10 };
    const buff: KitBuff = {
      amount: 0.25,
      attribute: Attribute.ShieldStrength,
      characterId: 1,
      kind: "buff",
      secondsRemaining: 12,
    };

    hitPartyMember(party, combatant, { effects: [shield, buff] }, characterIdCombatantMap, 100);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - (100 - 50 * 1.25) / MAX_HEALTH);
  });

  test("should lose the whole hit's share of max HP with no shield up", () => {
    expect.hasAssertions();

    const party = createParty([1]);

    hitPartyMember(party, combatant, { effects: [] }, characterIdCombatantMap, 100);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - 100 / MAX_HEALTH);
  });

  test("a health change from a hit carries the hit's element, and a drain carries none", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    hitPartyMember(party, combatant, { effects: [] }, characterIdCombatantMap, 250, Element.Pyro);
    damagePartyMember(party, 1, 0.25, { sourceCharacterId: 2 });

    expect(party.healthChanges).toStrictEqual([
      { bondOfLifeShare: 0, characterId: 1, element: Element.Pyro, healthShare: -0.25, overflowHealthShare: 0 },
      { bondOfLifeShare: 0, characterId: 1, healthShare: -0.25, overflowHealthShare: 0, sourceCharacterId: 2 },
    ]);
  });
});
