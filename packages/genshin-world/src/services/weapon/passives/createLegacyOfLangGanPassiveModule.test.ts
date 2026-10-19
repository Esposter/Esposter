import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createLegacyOfLangGanPassiveModule } from "#src/services/weapon/passives/createLegacyOfLangGanPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createLegacyOfLangGanPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Legacy of Lang-Gan at its first rank: the Lunar-Crystallize DMG its wielder deals rises by 64% for five seconds
  // After its Elemental Skill
  const passiveModule = createLegacyOfLangGanPassiveModule([0.64, 5]);
  const wielder = createCombatant(TRAVELER_CHARACTER_ID);
  const other = createCombatant(OTHER_CHARACTER_ID);
  const priceReaction = (
    context: KitContext,
    combatant: Combatant,
    reactionType: LunarReactionType | TransformativeReactionType,
  ): number =>
    passiveModule.getPartyReactionBonus?.(wielder, { combatant, element: Element.Geo, enemy, reactionType }, context)
      ?.damageBonus ?? 0;
  const createSkilledContext = (): KitContext => {
    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
    return context;
  };

  test("the wielder's Lunar-Crystallize DMG rises by 64% after its Elemental Skill", () => {
    expect.hasAssertions();

    const context = createSkilledContext();

    expect(priceReaction(context, wielder, LunarReactionType.LunarCrystallize)).toBe(0.64);
    expect(priceReaction(context, wielder, LunarReactionType.LunarCharged)).toBe(0);
    expect(priceReaction(context, other, LunarReactionType.LunarCrystallize)).toBe(0);
  });

  test("it ends after five seconds, and nothing rises before the skill", () => {
    expect.hasAssertions();

    const unskilledDamageBonus = priceReaction(
      createKitTestContext(wielder),
      wielder,
      LunarReactionType.LunarCrystallize,
    );
    const context = createSkilledContext();
    stepKitSeconds(context, 5.1);

    expect(unskilledDamageBonus).toBe(0);
    expect(priceReaction(context, wielder, LunarReactionType.LunarCrystallize)).toBe(0);
  });
});
