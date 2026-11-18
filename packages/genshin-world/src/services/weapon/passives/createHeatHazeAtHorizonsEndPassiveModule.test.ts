import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createHeatHazeAtHorizonsEndPassiveModule } from "#src/services/weapon/passives/createHeatHazeAtHorizonsEndPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createHeatHazeAtHorizonsEndPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant([{ attribute: Attribute.ElementalMastery, value: 100 }]);
  // Heat Haze at Horizon's End at its first rank: 52% of the wielder's Elemental Mastery as bonus ATK, and each Elemental Skill hit
  // Adds 28% of it more for 10 seconds, up to three stacks
  const passiveModule = createHeatHazeAtHorizonsEndPassiveModule([0.52, 0.28, 10, 0.3, 3]);
  const readAttackBonus = (effects: Parameters<NonNullable<typeof passiveModule.getPassiveBonuses>>[3]) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], effects).find(({ attribute }) => attribute === Attribute.Attack)
      ?.amount;

  test("the wielder's Elemental Mastery is converted to bonus ATK at the rank's share", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(readAttackBonus(context.kitEffectState.effects)).toBeCloseTo(52);
  });

  test("each Elemental Skill hit adds a stack of the rank's share, up to three, for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const skillHit = () =>
      passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);
    skillHit();

    expect(readAttackBonus(context.kitEffectState.effects)).toBeCloseTo(80);

    skillHit();
    skillHit();
    skillHit();

    expect(readAttackBonus(context.kitEffectState.effects)).toBeCloseTo(136);

    stepKitSeconds(context, 10.1);

    expect(readAttackBonus(context.kitEffectState.effects)).toBeCloseTo(52);
  });
});
