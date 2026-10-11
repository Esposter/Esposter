import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { ASCENDANT_GLEAM_STATUS_ID } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createCombatant = (
  characterId: number,
  kit: Kit,
  element?: Element,
  attributeLines: AttributeLine[] = [],
): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes(attributeLines),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit,
  level: 90,
});

describe(getPartyMoonsign, () => {
  const PARTY_CHARACTER_IDS = [1, 2, 3, 4];
  const ELEMENTAL_MASTERY_BONUS = 0.0001;
  const FLAT_BONUS = 0.07;
  // A Lunar-Bloom Benediction scaling on Elemental Mastery, and a flat one on Lunar-Bloom and Lunar-Charged beside it,
  // With an Electro character of 2,000 ATK outside the Moonsign
  const characterIdCombatantMap = new Map([
    [
      1,
      createCombatant(1, {
        ...TRAVELER_KIT,
        moonsignBenediction: {
          getBaseDamageBonus: ({ attributes }) =>
            attributes.attributeTotalMap[Attribute.ElementalMastery] * ELEMENTAL_MASTERY_BONUS,
          lunarReactionTypes: [LunarReactionType.LunarBloom],
        },
      }),
    ],
    [
      2,
      createCombatant(2, {
        ...TRAVELER_KIT,
        moonsignBenediction: {
          getBaseDamageBonus: () => FLAT_BONUS,
          lunarReactionTypes: [LunarReactionType.LunarBloom, LunarReactionType.LunarCharged],
        },
      }),
    ],
    [3, createCombatant(3, TRAVELER_KIT, Element.Electro, [{ attribute: Attribute.Attack, value: 2000 }])],
    [4, createCombatant(4, TRAVELER_KIT)],
  ]);
  const party = createParty(PARTY_CHARACTER_IDS);

  test("turns each Benediction's reactions Lunar, adding up the bonuses two give one, each from its holder's buffed stats", () => {
    expect.hasAssertions();

    const effects: KitEffect[] = [
      { amount: 100, attribute: Attribute.ElementalMastery, characterId: 1, kind: "buff", secondsRemaining: 1 },
    ];

    expect(getPartyMoonsign(characterIdCombatantMap, effects, party)).toStrictEqual({
      baseDamageBonusMap: {
        [LunarReactionType.LunarBloom]: expect.closeTo(100 * ELEMENTAL_MASTERY_BONUS + FLAT_BONUS),
        [LunarReactionType.LunarCharged]: FLAT_BONUS,
      },
      level: MoonsignLevel.AscendantGleam,
      lunarReactionTypes: [LunarReactionType.LunarBloom, LunarReactionType.LunarCharged],
      reactionBonus: 0,
    });
  });

  test("gives every Lunar damage the bonus of the Ascendant Gleam a member lit, and none from it below Ascendant Gleam", () => {
    expect.hasAssertions();

    const effects: KitEffect[] = [
      { characterId: 3, id: ASCENDANT_GLEAM_STATUS_ID, kind: "status", secondsRemaining: 1 },
    ];

    expect({
      ascendantGleam: getPartyMoonsign(characterIdCombatantMap, effects, party).reactionBonus,
      nascentGleam: getPartyMoonsign(characterIdCombatantMap, effects, createParty([1, 3])).reactionBonus,
    }).toStrictEqual({ ascendantGleam: expect.closeTo(0.18), nascentGleam: 0 });
  });

  test("turns nothing Lunar for a team with no Moonsign character", () => {
    expect.hasAssertions();

    expect(getPartyMoonsign(characterIdCombatantMap, [], createParty([3, 4]))).toStrictEqual({
      baseDamageBonusMap: {},
      lunarReactionTypes: [],
      reactionBonus: 0,
    });
  });
});
