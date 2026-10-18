import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createAeonWavePassiveModule } from "#src/services/weapon/passives/createAeonWavePassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createAeonWavePassiveModule, () => {
  // Aeon Wave at its first rank: each change in the wielder's HP adds 14% Charged Attack DMG for four seconds, up to three
  // Stacks once every 0.3 seconds, and a third stack restores 8 energy once every twelve seconds. Its HP line is the table's
  const aeonWavePassiveModule = createAeonWavePassiveModule([4, 0.3, 0.14, 8, 12]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const healthChanged = {
    bondOfLifeShare: 0,
    characterId: TRAVELER_CHARACTER_ID,
    healthShare: 0.1,
    kind: KitEventKind.HealthChanged as const,
    overflowHealthShare: 0,
  };

  test("a change in the wielder's HP adds a stack of Charged Attack DMG for four seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.14, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 4 },
    ]);
  });

  test("a change within the stack's cooldown adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.14, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 4 },
    ]);
  });

  test("a third stack restores the wielder's energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);
  });

  test("the energy is restored once every twelve seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }
    stepKitSeconds(context, 12.1);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(16);
  });

  test("a change in another character's HP adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.({ ...healthChanged, characterId: -1 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
