import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
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
const createStrike = (): KitStrike => ({
  attackTag: AttackTag.NormalAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});

describe(createFocusPassiveModule, () => {
  test("each hit the wielder deals that is not critical adds a stack, and each strike it makes is rolled with a stack's CRIT Rate", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);

    expect(
      focusPassiveModule.getStrikeCriticalRateBonus?.(
        createStrike(),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.08 * 2);
  });

  test("the stacks stop at five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 6; hit++) focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);

    expect(
      focusPassiveModule.getStrikeCriticalRateBonus?.(
        createStrike(),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.08 * 5);
  });

  test("a critical hit removes every stack and adds none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 3; hit++) focusPassiveModule.onKitEvent?.(createDamageTaken(false), context, wielder);
    focusPassiveModule.onKitEvent?.(createDamageTaken(true), context, wielder);

    expect(
      focusPassiveModule.getStrikeCriticalRateBonus?.(
        createStrike(),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });
});
