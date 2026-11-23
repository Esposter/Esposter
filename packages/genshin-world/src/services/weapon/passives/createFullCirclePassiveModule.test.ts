import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createFullCirclePassiveModule } from "#src/services/weapon/passives/createFullCirclePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { stepPassiveSeconds } from "#src/services/weapon/passives/stepPassiveSeconds.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createFullCirclePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Full Circle at its first rank: each Elemental Reaction gains a stack of Wax and Wane, once every 0.3 seconds, up to
  // Five, Each raising Elemental Mastery by 24 and lowering ATK by 5%. A stack goes for each six seconds without a
  // Reaction
  const passiveModule = createFullCirclePassiveModule([-0.05, 24, 0.3, 6]);
  const react = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: ReactionType.Melt }],
        striker: wielder,
      },
      context,
      wielder,
    );
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects) ?? [];

  test("a reaction gains a stack once every 0.3 seconds, raising Elemental Mastery and lowering ATK by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    react(context);
    react(context);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 24, attribute: Attribute.ElementalMastery },
      { amount: -0.05, attribute: Attribute.AttackPercent },
    ]);

    stepPassiveSeconds(context, passiveModule, wielder, 0.35);
    react(context);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 48, attribute: Attribute.ElementalMastery },
      { amount: -0.1, attribute: Attribute.AttackPercent },
    ]);
  });

  test("the stacks are at most five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let reaction = 0; reaction < 6; reaction++) {
      react(context);
      stepPassiveSeconds(context, passiveModule, wielder, 0.35);
    }

    expect(readBonuses(context)).toStrictEqual([
      { amount: 120, attribute: Attribute.ElementalMastery },
      { amount: -0.25, attribute: Attribute.AttackPercent },
    ]);
  });

  test("a stack is lost for each six seconds without a reaction, counted from the last one", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let reaction = 0; reaction < 3; reaction++) {
      react(context);
      stepPassiveSeconds(context, passiveModule, wielder, 0.35);
    }
    stepPassiveSeconds(context, passiveModule, wielder, 6.3);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 48, attribute: Attribute.ElementalMastery },
      { amount: -0.1, attribute: Attribute.AttackPercent },
    ]);

    stepPassiveSeconds(context, passiveModule, wielder, 6);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 24, attribute: Attribute.ElementalMastery },
      { amount: -0.05, attribute: Attribute.AttackPercent },
    ]);
  });
});
