import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createRadianceOfTheDeepsPassiveModule } from "#src/services/weapon/passives/createRadianceOfTheDeepsPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { stepPassiveSeconds } from "#src/services/weapon/passives/stepPassiveSeconds.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createRadianceOfTheDeepsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Radiance of the Deeps at its first rank: three states raising DMG dealt by 6%, 10% and 14%, switched by each attack
  // The Wielder hits with, once every seven seconds, the wielder off the field too
  const passiveModule = createRadianceOfTheDeepsPassiveModule([7, 0.06, 0.1, 0.14]);
  const hitWith = (context: KitContext, striker: typeof wielder) =>
    passiveModule.onKitEvent?.(createWeaponDamageTaken(striker, AttackTag.NormalAttack, enemy), context, wielder);
  const readDamageBonus = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)?.[0]?.amount;

  test("the wielder starts in Evengleam, raising DMG dealt by the rank's first amount", () => {
    expect.hasAssertions();

    expect(readDamageBonus(createKitTestContext(wielder))).toBe(0.06);
  });

  test("each hit of the wielder's switches to the next state, once every seven seconds, through the three in turn", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, wielder);
    hitWith(context, wielder);

    expect(readDamageBonus(context)).toBe(0.1);

    stepPassiveSeconds(context, passiveModule, wielder, 7.1);
    hitWith(context, wielder);

    expect(readDamageBonus(context)).toBe(0.14);

    stepPassiveSeconds(context, passiveModule, wielder, 7.1);
    hitWith(context, wielder);

    expect(readDamageBonus(context)).toBe(0.06);
  });

  test("another member's hit switches nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, other);

    expect(readDamageBonus(context)).toBe(0.06);
  });
});
