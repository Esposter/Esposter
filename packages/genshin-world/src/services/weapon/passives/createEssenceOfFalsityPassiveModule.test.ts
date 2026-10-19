import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createEssenceOfFalsityPassiveModule } from "#src/services/weapon/passives/createEssenceOfFalsityPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createSkillUsed = () => ({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const });

describe(createEssenceOfFalsityPassiveModule, () => {
  // Essence of Falsity with synthetic params: 10% CRIT Rate, 50 Elemental Mastery for three seconds after an Elemental
  // Skill, and 20% CRIT DMG for two seconds after Lunar-Bloom DMG, each increased by 50% while both stand
  const essenceOfFalsityPassiveModule = createEssenceOfFalsityPassiveModule([50, 0.2, 3, 2, 0.5, 0.1]);
  const wielder: Combatant = createWielderCombatant();
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const createLunarBloom = () => ({
    enemy,
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ reactionType: ReactionType.LunarBloom }],
    striker: wielder,
  });

  test("the wielder's CRIT Rate is raised by the rank's amount with neither effect standing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 0, attribute: Attribute.ElementalMastery },
      { amount: 0, attribute: Attribute.CriticalDamage },
    ]);
  });

  test("an Elemental Skill gives the wielder Secret of Lies, raising its Elemental Mastery for three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    essenceOfFalsityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 50, attribute: Attribute.ElementalMastery },
      { amount: 0, attribute: Attribute.CriticalDamage },
    ]);

    stepKitSeconds(context, 3.1);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 0, attribute: Attribute.ElementalMastery },
      { amount: 0, attribute: Attribute.CriticalDamage },
    ]);
  });

  test("a Lunar-Bloom DMG the wielder deals gives it Moon of Truth, raising its CRIT DMG for two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    essenceOfFalsityPassiveModule.onKitEvent?.(createLunarBloom(), context, wielder);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 0, attribute: Attribute.ElementalMastery },
      { amount: 0.2, attribute: Attribute.CriticalDamage },
    ]);

    stepKitSeconds(context, 2.1);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 0, attribute: Attribute.ElementalMastery },
      { amount: 0, attribute: Attribute.CriticalDamage },
    ]);
  });

  test("with both effects standing, each raise is increased by the rank's share", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    essenceOfFalsityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);
    essenceOfFalsityPassiveModule.onKitEvent?.(createLunarBloom(), context, wielder);

    expect(
      essenceOfFalsityPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 0.1, attribute: Attribute.CriticalRate },
      { amount: 75, attribute: Attribute.ElementalMastery },
      { amount: 0.2 * 1.5, attribute: Attribute.CriticalDamage },
    ]);
  });
});
