import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { priceReactionContributors } from "#src/services/kit/priceReactionContributors";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createContributor = (kit = TRAVELER_KIT): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit,
  level: 90,
});

describe(priceReactionContributors, () => {
  const DAMAGE = 100;
  // A roll between the base CRIT Rate and the raised one, so only a raised rate crits
  const ROLL = 0.5;

  const price = () => DAMAGE;
  const priceWith = (context: KitContext, reactionType: LunarReactionType | StellarReactionType) =>
    priceReactionContributors(new Set([TRAVELER_CHARACTER_ID]), context, price, {
      element: Element.Electro,
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      reactionType,
    });

  test("a Lunar contributor's CRIT Rate and CRIT DMG take the party reaction bonus that reads its share", () => {
    expect.hasAssertions();
    const contributor = createContributor({
      ...TRAVELER_KIT,
      getPartyReactionBonus: () => ({ criticalDamageBonus: 0.5, criticalRateBonus: 1 }),
    });
    const context = createKitTestContext(contributor, { random: () => ROLL });
    const criticalDamage = contributor.attributes.attributeTotalMap[Attribute.CriticalDamage];

    expect(priceWith(context, LunarReactionType.LunarCharged)).toStrictEqual([DAMAGE * (1 + criticalDamage + 0.5)]);
  });

  test("a Lunar contributor's damage is multiplied by its Elevation last", () => {
    expect.hasAssertions();
    const contributor = createContributor({
      ...TRAVELER_KIT,
      getPartyReactionBonus: () => ({ criticalDamageBonus: 0.5, criticalRateBonus: 1, elevationBonus: 0.2 }),
    });
    const context = createKitTestContext(contributor, { random: () => ROLL });
    const criticalDamage = contributor.attributes.attributeTotalMap[Attribute.CriticalDamage];

    expect(priceWith(context, LunarReactionType.LunarCharged)).toStrictEqual([
      DAMAGE * (1 + criticalDamage + 0.5) * (1 + 0.2),
    ]);
  });

  test("a Lunar contributor with no party reaction bonus rolls its own CRIT only", () => {
    expect.hasAssertions();
    const contributor = createContributor();
    const context = createKitTestContext(contributor, { random: () => ROLL });

    expect(priceWith(context, LunarReactionType.LunarCharged)).toStrictEqual([DAMAGE]);
  });

  test("a Stellar contributor takes none of the party reaction bonus's CRIT", () => {
    expect.hasAssertions();
    const contributor = createContributor({
      ...TRAVELER_KIT,
      getPartyReactionBonus: () => ({ criticalDamageBonus: 0.5, criticalRateBonus: 1 }),
    });
    const context = createKitTestContext(contributor, { random: () => ROLL });

    expect(priceWith(context, StellarReactionType.StellarSwirl)).toStrictEqual([DAMAGE]);
  });
});
