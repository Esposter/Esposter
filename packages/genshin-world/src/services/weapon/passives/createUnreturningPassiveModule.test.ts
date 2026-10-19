import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createUnreturningPassiveModule } from "#src/services/weapon/passives/createUnreturningPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
describe(createUnreturningPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: its Movement SPD, ATK and seconds, read from the params' three numbers
  const unreturningPassiveModule = createUnreturningPassiveModule([0.2, 0.3, 3]);
  const createDamageTaken = (attackTag: AttackTag, weakPoint: boolean) => ({
    attackTag,
    enemy,
    hit: { ...TRAVELER_KIT.plungeCollision, weakPoint },
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a charged attack hit on a weak point raises movement speed and ATK for three seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    unreturningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack, true), context, wielder);

    expect(getBuff(kitEffectState, Attribute.MovementSpeed)?.amount).toBeCloseTo(0.2);
    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.3);
  });

  test("a charged attack off a weak point, or a normal attack on one, raises nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    unreturningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack, false), context, wielder);
    unreturningPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack, true), context, wielder);

    expect(getBuff(kitEffectState, Attribute.MovementSpeed)).toBeUndefined();
  });
});
