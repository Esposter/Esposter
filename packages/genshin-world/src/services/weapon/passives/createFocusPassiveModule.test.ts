import type { Combatant } from "#src/models/kit/Combatant";
import type { Enemy } from "#src/models/enemy/Enemy";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeLunarCharged } from "#src/services/kit/strikeLunarCharged";
import { createParty } from "#src/services/party/createParty";
import { createFocusPassiveModule } from "#src/services/weapon/passives/createFocusPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Focus at its first rank: eight per cent CRIT Rate a stack
const focusPassiveModule = createFocusPassiveModule([0.08]);
const createDamageTaken = (isCritical: boolean) => ({
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createFocusPassiveModule, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;

  test("each hit the wielder deals that is not critical adds a stack, and the stacks are a CRIT Rate bonus on the wielder", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);

    expect(focusPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.08 * 2, attribute: Attribute.CriticalRate },
    ]);
  });

  test("the stacks stop at five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 6; hit++) focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);

    expect(focusPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.08 * 5, attribute: Attribute.CriticalRate },
    ]);
  });

  test("a critical hit removes every stack and adds none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 3; hit++) focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(true), context, wielder);

    expect(focusPassiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0, attribute: Attribute.CriticalRate },
    ]);
  });

  test("a Lunar reaction the wielder contributes to rolls with the stacks' CRIT Rate", () => {
    expect.hasAssertions();

    // The wielder at level 90 with Focus on its kit and a CRIT DMG of 100%, so a critical hit doubles its damage
    const focusWielder: Combatant = {
      ...wielder,
      attributes: computeCharacterAttributes([{ attribute: Attribute.CriticalDamage, value: 1 }]),
      kit: { ...TRAVELER_KIT, getPassiveBonuses: focusPassiveModule.getPassiveBonuses },
      level: LEVEL,
    };
    // The damage a Lunar-Charged strike deals to a sturdy enemy once the wielder holds two stacks, rolled as given
    const getStackedDamage = (roll: number): number => {
      const sturdyEnemy: Enemy = {
        ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        health: STURDY_HEALTH,
        maxHealth: STURDY_HEALTH,
      };
      const context = createKitTestContext(focusWielder, {
        characterIdCombatantMap: new Map([[focusWielder.characterId, focusWielder]]),
        enemyMap: new Map([["", sturdyEnemy]]),
        enemyTables,
        party: createParty([focusWielder.characterId]),
        random: () => roll,
      });
      // Two non-critical hits add two stacks, lifting the CRIT Rate from none to 16%
      focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, focusWielder);
      focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, focusWielder);
      const lunarReactionTypes = [LunarReactionType.LunarCharged];
      applyElement(sturdyEnemy.elementalState, Element.Hydro, 1, {
        lunarReactionTypes,
        sourceId: focusWielder.characterId,
      });
      applyElement(sturdyEnemy.elementalState, Element.Electro, 1, {
        lunarReactionTypes,
        sourceId: focusWielder.characterId,
      });
      strikeLunarCharged(sturdyEnemy, context);
      return STURDY_HEALTH - sturdyEnemy.health;
    };

    // A roll of 10% lands under the stacked 16% CRIT Rate, so the reaction is critical; a roll of 99% lands over it
    expect(getStackedDamage(0.1)).toBeCloseTo(2 * getStackedDamage(0.99));
  });
});
