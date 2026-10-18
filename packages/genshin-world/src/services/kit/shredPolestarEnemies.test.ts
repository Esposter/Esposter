import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { shredPolestarEnemies } from "#src/services/kit/shredPolestarEnemies";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { tickEnemyStatuses } from "#src/services/kit/tickEnemyStatuses";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createEnemyAt = (x: number) => createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, "");
// Steps the team's effects by the given steps, then the enemies' statuses tick as the world's kit step runs them
const stepKit = (context: KitContext, steps: number) => {
  for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    tickEnemyStatuses(context.enemyMap.values(), FIXED_STEP_SECONDS, context.outbox);
  }
};

describe(shredPolestarEnemies, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };
  const STELLAR_CONDUCT = { element: Element.Cryo, reactionType: ReactionType.StellarConduct };
  const ORIGIN = { x: 0, z: 0 };

  test("a field lowers the enemies' Physical RES by 40%", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(3);
    const enemyKind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
    const before = getEnemyResistance(enemyKind, enemy, undefined);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]) });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);

    stepKit(context, 1);

    expect(getEnemyResistance(enemyKind, enemy, undefined)).toBeCloseTo(before - 0.4);
  });

  test("an enemy outside the field keeps its Physical RES", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(30);
    const enemyKind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
    const before = getEnemyResistance(enemyKind, enemy, undefined);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]) });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);

    stepKit(context, 1);

    expect(getEnemyResistance(enemyKind, enemy, undefined)).toBeCloseTo(before);
  });

  test("a standing field refreshes an enemy's reduction on each step rather than doubling it", () => {
    expect.hasAssertions();
    const enemy = createEnemyAt(3);
    const enemyKind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
    const before = getEnemyResistance(enemyKind, enemy, undefined);
    const context = createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]) });
    addPolestarField(context.kitEffectState, TRAVELER_CHARACTER_ID, [STELLAR_CONDUCT], ORIGIN);

    stepKit(context, 2);

    expect(enemy.statuses).toHaveLength(1);
    expect(getEnemyResistance(enemyKind, enemy, undefined)).toBeCloseTo(before - 0.4);
  });
});
