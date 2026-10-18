import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";
import { healKitPerStrike } from "#src/services/kit/healKitPerStrike";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const RESOURCE_ID = "test-heals";
const MAXIMUM_HEALS = 5;
const HEAL_HEALTH_SHARE = 0.05;
const MAX_HEALTH = 16_000;
const createCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(healKitPerStrike, () => {
  test("heals the striker on each strike, until the cast's maximum heals are given", () => {
    expect.hasAssertions();
    const combatant = createCombatant();
    const context = createKitTestContext(combatant);
    damagePartyMember(context.party, combatant.characterId, 0.5);
    const strike: KitStrike = { body: context.body, combatant, hit: takeOne(TRAVELER_KIT.elementalSkill.hits) };

    for (let index = 0; index < MAXIMUM_HEALS + 1; index++)
      healKitPerStrike(context, strike, {
        health: HEAL_HEALTH_SHARE * MAX_HEALTH,
        maximumHeals: MAXIMUM_HEALS,
        resourceId: RESOURCE_ID,
      });

    expect(getPartyMember(context.party, combatant.characterId).healthShare).toBeCloseTo(
      0.5 + MAXIMUM_HEALS * HEAL_HEALTH_SHARE,
    );
  });

  test("a cast's heals start again once its count is spent", () => {
    expect.hasAssertions();
    const combatant = createCombatant();
    const context = createKitTestContext(combatant);
    damagePartyMember(context.party, combatant.characterId, 0.5);
    const strike: KitStrike = { body: context.body, combatant, hit: takeOne(TRAVELER_KIT.elementalSkill.hits) };
    const heal = () =>
      healKitPerStrike(context, strike, {
        health: HEAL_HEALTH_SHARE * MAX_HEALTH,
        maximumHeals: MAXIMUM_HEALS,
        resourceId: RESOURCE_ID,
      });
    for (let index = 0; index < MAXIMUM_HEALS; index++) heal();

    spendKitResource(context.kitEffectState, combatant.characterId, RESOURCE_ID);
    heal();

    expect(getPartyMember(context.party, combatant.characterId).healthShare).toBeCloseTo(
      0.5 + (MAXIMUM_HEALS + 1) * HEAL_HEALTH_SHARE,
    );
  });
});
