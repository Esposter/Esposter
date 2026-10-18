import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createPressTheAdvantagePassiveModule } from "#src/services/weapon/passives/createPressTheAdvantagePassiveModule";
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
// Press the Advantage at its first rank: twelve per cent ATK for thirty seconds a stack
const pressTheAdvantagePassiveModule = createPressTheAdvantagePassiveModule([0.12, 30]);
const createDefeat = (striker: Combatant | undefined) => ({
  enemy,
  kind: KitEventKind.EnemyDefeated as const,
  striker,
});
const getStackSeconds = (context: KitContext) =>
  context.kitEffectState.effects
    .filter((effect) => effect.kind === "buff" && effect.source?.startsWith("pressTheAdvantage"))
    .map(({ secondsRemaining }) => Math.round(secondsRemaining))
    .toSorted((a, b) => a - b);

describe(createPressTheAdvantagePassiveModule, () => {
  test("a defeat by the wielder adds a stack of the rank's ATK bonus for its seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([{ amount: 0.12, attribute: Attribute.AttackPercent, secondsRemaining: 30 }]);
  });

  test("a fourth defeat with three stacks live adds none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let defeat = 0; defeat < 4; defeat++)
      pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([30, 30, 30]);
  });

  test("a stack ends on its own timer and frees its place for the next defeat", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    stepKitSeconds(context, 10);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);
    stepKitSeconds(context, 21);

    expect(getStackSeconds(context)).toStrictEqual([9, 9]);

    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(wielder), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([9, 9, 30]);
  });

  test("a defeat with no striker or by another striker adds nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pressTheAdvantagePassiveModule.onKitEvent?.(createDefeat(undefined), context, wielder);

    expect(getStackSeconds(context)).toStrictEqual([]);
  });
});
