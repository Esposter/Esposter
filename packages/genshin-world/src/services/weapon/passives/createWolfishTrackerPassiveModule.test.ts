import type { Combatant } from "#src/models/kit/Combatant";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWolfishTrackerPassiveModule } from "#src/services/weapon/passives/createWolfishTrackerPassiveModule";
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
// Wolf's Gravestone at its first rank: twenty per cent ATK for the wielder, and forty per cent for the team on a weak hit
const wolfishTrackerPassiveModule = createWolfishTrackerPassiveModule([0.2, 0.4]);
const weakEnemy: Enemy = { ...enemy, health: enemy.maxHealth * 0.2 };
const createNormalAttackDamageTaken = (target: Enemy): KitEvent => ({
  attackTag: AttackTag.NormalAttack,
  enemy: target,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: wielder,
});

describe(createWolfishTrackerPassiveModule, () => {
  test("the rank's ATK share is a passive bonus on the wielder", () => {
    expect.hasAssertions();

    expect(wolfishTrackerPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
    ]);
  });

  test("a hit on an enemy under thirty per cent of its HP raises the team's ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wolfishTrackerPassiveModule.onKitEvent?.(createNormalAttackDamageTaken(weakEnemy), context, wielder);

    const buff = context.kitEffectState.effects.find((effect) => effect.kind === "buff");
    expect(buff).toStrictEqual({
      amount: 0.4,
      attribute: Attribute.AttackPercent,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
      source: "wolfishTracker",
    });
  });

  test("a hit on an enemy at or above thirty per cent of its HP raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wolfishTrackerPassiveModule.onKitEvent?.(createNormalAttackDamageTaken(enemy), context, wielder);

    expect(context.kitEffectState.effects).toHaveLength(0);
  });

  test("a weak hit inside the thirty-second cooldown raises no team ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wolfishTrackerPassiveModule.onKitEvent?.(createNormalAttackDamageTaken(weakEnemy), context, wielder);
    stepKitSeconds(context, 20);
    wolfishTrackerPassiveModule.onKitEvent?.(createNormalAttackDamageTaken(weakEnemy), context, wielder);

    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toHaveLength(0);
  });
});
