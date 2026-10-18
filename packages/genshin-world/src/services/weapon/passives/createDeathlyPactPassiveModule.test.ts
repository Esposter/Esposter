import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeathlyPactPassiveModule } from "#src/services/weapon/passives/createDeathlyPactPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createDeathlyPactPassiveModule, () => {
  // Deathly Pact at its first rank: its CRIT DMG line is the table's. Each increase of the wielder's Bond of Life raises its
  // DMG by 16% for six seconds, up to three stacks
  const deathlyPactPassiveModule = createDeathlyPactPassiveModule([0.2, 0.16, 6, 0, 0, 0, 0, 0]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const bondOfLifeIncreased = {
    bondOfLifeShare: 0.1,
    characterId: TRAVELER_CHARACTER_ID,
    healthShare: 0,
    kind: KitEventKind.HealthChanged as const,
    overflowHealthShare: 0,
  };

  test("an increase of the wielder's Bond of Life raises its DMG by 16% for six seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.16, attribute: Attribute.AllDamageBonus, secondsRemaining: 6 },
    ]);
  });

  test("each increase adds a stack, up to three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let increase = 0; increase < 4; increase++)
      deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 3 * 0.16, attribute: Attribute.AllDamageBonus, secondsRemaining: 6 },
    ]);
  });

  test("the stacks end six seconds after the last increase", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);
    stepKitSeconds(context, 6.1);

    expect(readBuffs(context.kitEffectState.effects).filter(({ amount }) => amount > 0)).toStrictEqual([]);
  });

  test("a heal that adds no Bond of Life obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.({ ...bondOfLifeIncreased, bondOfLifeShare: 0 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("an increase of another character's Bond of Life obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.({ ...bondOfLifeIncreased, characterId: -1 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
