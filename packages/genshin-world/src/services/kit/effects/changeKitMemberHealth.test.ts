import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 16_000 }]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(changeKitMemberHealth, () => {
  const SOURCE_ID = 1;
  const MEMBER_ID = 2;
  const source = createCombatant(SOURCE_ID);
  const characterIdCombatantMap = new Map([
    [MEMBER_ID, createCombatant(MEMBER_ID)],
    [SOURCE_ID, source],
  ]);
  const effects: KitEffect[] = [
    { amount: 0.25, attribute: Attribute.HealingBonus, characterId: SOURCE_ID, kind: "buff", secondsRemaining: 1 },
    {
      amount: 0.75,
      attribute: Attribute.IncomingHealingBonus,
      characterId: MEMBER_ID,
      kind: "buff",
      secondsRemaining: 1,
    },
  ];

  test("heals a member by the HP raised by the source's Healing Bonus and its own Incoming Healing Bonus", () => {
    expect.hasAssertions();
    const party = createParty([SOURCE_ID, MEMBER_ID]);
    getPartyMember(party, MEMBER_ID).healthShare = 0.5;
    changeKitMemberHealth(
      createKitTestContext(source, { characterIdCombatantMap, kitEffectState: { effects }, party }),
      source,
      MEMBER_ID,
      2000,
    );

    expect(party.healthChanges).toStrictEqual([
      {
        bondOfLifeShare: 0,
        characterId: MEMBER_ID,
        healthShare: 0.25,
        overflowHealthShare: 0,
        sourceCharacterId: SOURCE_ID,
      },
    ]);
  });

  test("drains a member by the HP as it is", () => {
    expect.hasAssertions();
    const party = createParty([SOURCE_ID, MEMBER_ID]);
    changeKitMemberHealth(
      createKitTestContext(source, { characterIdCombatantMap, kitEffectState: { effects }, party }),
      source,
      MEMBER_ID,
      -4000,
    );

    expect(party.healthChanges).toStrictEqual([
      {
        bondOfLifeShare: 0,
        characterId: MEMBER_ID,
        healthShare: -0.25,
        overflowHealthShare: 0,
        sourceCharacterId: SOURCE_ID,
      },
    ]);
  });
});
