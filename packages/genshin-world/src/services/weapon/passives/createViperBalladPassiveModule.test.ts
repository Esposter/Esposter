import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createViperBalladPassiveModule } from "#src/services/weapon/passives/createViperBalladPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// The stacks of the one status that counts them, as Hymn of the Pure is held
const getHymnStacks = (context: KitContext) =>
  context.kitEffectState.effects.find(
    (effect): effect is KitStatus => effect.kind === "status" && effect.stacks !== undefined,
  )?.stacks;

describe(createViperBalladPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Viper's Ballad at its first rank: a stack of Hymn of the Pure for each Elemental Skill or Burst hit, once every
  // 0.03 seconds, three at most, and at three the team gets 24% Stellar Glimmer reaction DMG for twelve seconds, with
  // No stacks
  const passiveModule = createViperBalladPassiveModule([0.24, 3, 0.03, 12, 12]);
  const hitWith = (context: KitContext, attackTag: AttackTag) =>
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, attackTag, enemy), context, wielder);

  test("an Elemental Skill or Burst hit adds a stack of Hymn of the Pure, once every 0.03 seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, AttackTag.ElementalSkill);
    hitWith(context, AttackTag.ElementalBurst);

    expect(getHymnStacks(context)).toBe(1);

    stepKitSeconds(context, 0.05);
    hitWith(context, AttackTag.ElementalBurst);

    expect(getHymnStacks(context)).toBe(2);
  });

  test("a normal attack hit adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, AttackTag.NormalAttack);

    expect(getHymnStacks(context)).toBeUndefined();
  });

  test("the third stack clears Hymn of the Pure, and the team gets the Stellar Glimmer reaction DMG for twelve seconds, with no stack gained meanwhile", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 2; hit++) {
      hitWith(context, AttackTag.ElementalSkill);
      stepKitSeconds(context, 0.05);
    }
    hitWith(context, AttackTag.ElementalSkill);
    hitWith(context, AttackTag.ElementalSkill);

    expect(getHymnStacks(context)).toBeUndefined();
    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.StellarGlimmerReactionDamageBonus, 0.24, 12],
    ]);
  });
});
