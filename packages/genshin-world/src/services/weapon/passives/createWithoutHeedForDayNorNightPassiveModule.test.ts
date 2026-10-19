import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { createWithoutHeedForDayNorNightPassiveModule } from "#src/services/weapon/passives/createWithoutHeedForDayNorNightPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createWithoutHeedForDayNorNightPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const LAWS_OF_THE_BOARD_BONUSES = [
    { amount: 0.2, attribute: Attribute.AttackPercent },
    { amount: 100, attribute: Attribute.ElementalMastery },
  ];

  // Without Heed for Day nor Night at its first rank: an Elemental Skill gives Laws of the Board, 20% ATK and 100
  // Elemental Mastery for six seconds, once every twelve, and a Charged Attack hit extends it by six seconds, six at
  // Most
  const passiveModule = createWithoutHeedForDayNorNightPassiveModule([0.2, 100, 6, 12, 6]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const hitWith = (context: KitContext, attackTag: AttackTag) =>
    passiveModule.onKitEvent?.(
      { attackTag, element: undefined, enemy, kind: KitEventKind.EnemyHit, striker: wielder },
      context,
      wielder,
    );
  const readBonuses = ({ kitEffectState }: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], kitEffectState.effects);

  test("its Laws of the Board raise ATK and Elemental Mastery for six seconds after an Elemental Skill", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    stepKitSeconds(context, 5.9);
    const bonusesBeforeEnd = readBonuses(context);
    stepKitSeconds(context, 0.2);

    expect(bonusesBeforeEnd).toStrictEqual(LAWS_OF_THE_BOARD_BONUSES);
    expect(readBonuses(context)).toStrictEqual([]);
  });

  test("a Charged Attack hit extends it by six seconds once, and another kind of hit does not", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    hitWith(context, AttackTag.NormalAttack);
    hitWith(context, AttackTag.ChargedAttack);
    hitWith(context, AttackTag.ChargedAttack);
    stepKitSeconds(context, 11.9);
    const bonusesBeforeEnd = readBonuses(context);
    stepKitSeconds(context, 0.2);

    expect(bonusesBeforeEnd).toStrictEqual(LAWS_OF_THE_BOARD_BONUSES);
    expect(readBonuses(context)).toStrictEqual([]);
  });

  test("a skill within twelve seconds of its start gives nothing, and one after it starts it again", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    stepKitSeconds(context, 7);
    useSkill(context);
    const bonusesWithinCooldown = readBonuses(context);
    stepKitSeconds(context, 5.1);
    useSkill(context);

    expect(bonusesWithinCooldown).toStrictEqual([]);
    expect(readBonuses(context)).toStrictEqual(LAWS_OF_THE_BOARD_BONUSES);
  });

  test("a Charged Attack hit with no Laws of the Board gives nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, AttackTag.ChargedAttack);

    expect(readBonuses(context)).toStrictEqual([]);
  });
});
