import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createPressTheAdvantagePassiveModule } from "#src/services/weapon/passives/createPressTheAdvantagePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const getStackSeconds = (context: KitContext) =>
  context.kitEffectState.effects
    .filter((effect) => effect.kind === "buff" && effect.source?.startsWith("pressTheAdvantage"))
    .map(({ secondsRemaining }) => Math.round(secondsRemaining))
    .toSorted((firstSeconds, secondSeconds) => firstSeconds - secondSeconds);

describe(createPressTheAdvantagePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // A synthetic fifth ATK for four seconds a stack, not the weapon's row
  const pressTheAdvantagePassiveModule = createPressTheAdvantagePassiveModule([0.2, 4]);
  const createDefeat = (striker: Combatant | undefined) => ({
    enemy,
    kind: KitEventKind.EnemyDefeated as const,
    striker,
  });

  test("a defeat by the wielder adds a stack of the rank's ATK bonus for its seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([{ amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 4 }]);
  });

  test("a fourth defeat with three stacks live adds none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let defeat = 0; defeat < 4; defeat++)
      pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([4, 4, 4]);
  });

  test("a stack ends on its own timer and frees its place for the next defeat", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    stepKitSeconds(context, 2);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    stepKitSeconds(context, 3);

    expect(getStackSeconds(context)).toStrictEqual([1, 1]);

    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([1, 1, 4]);
  });

  test("a defeat with no striker or by another striker adds nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(undefined), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([]);
  });
});
