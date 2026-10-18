import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { CHORD_HARMONIC_ID } from "#src/services/weapon/passives/constants";
import { createChordPassiveModule } from "#src/services/weapon/passives/createChordPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// The Flute's Chord with synthetic params: a 200% ATK burst, from one harmonic a hit
const chordPassiveModule = createChordPassiveModule([0, 2]);
const createDamageTaken = (attackTag: AttackTag) => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createChordPassiveModule, () => {
  test("the fifth harmonic queues the burst at the rank's multiplier and clears the count", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 4; hit++) {
      chordPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
      stepKitSeconds(context, 0.6);
    }
    chordPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([2]);
    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, CHORD_HARMONIC_ID)?.stacks).toBe(0);
  });

  test("a hit within half a second of the last harmonic gains none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    chordPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    chordPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, CHORD_HARMONIC_ID)?.stacks).toBe(1);
  });

  test("an elemental skill's hit gains no harmonic", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    chordPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(findKitStatus(context.kitEffectState.effects, TRAVELER_CHARACTER_ID, CHORD_HARMONIC_ID)).toBeUndefined();
  });
});
