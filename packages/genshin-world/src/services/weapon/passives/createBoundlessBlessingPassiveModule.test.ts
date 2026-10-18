import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBoundlessBlessingPassiveModule } from "#src/services/weapon/passives/createBoundlessBlessingPassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Lost Prayer to the Sacred Winds at its first rank: ten per cent Movement SPD and eight per cent Elemental DMG Bonus a stack
const boundlessBlessingPassiveModule = createBoundlessBlessingPassiveModule([0.1, 0.08, 0, 0]);
const BOUNDLESS_BLESSING_ID = "boundlessBlessing";
const swapOnto = (characterId: number, previousCharacterId: number): KitEvent => ({
  characterId,
  kind: KitEventKind.CharacterSwapped,
  previousCharacterId,
});
const getStacks = (effects: readonly KitEffect[]) =>
  findKitStatus(effects, TRAVELER_CHARACTER_ID, BOUNDLESS_BLESSING_ID)?.stacks;

describe(createBoundlessBlessingPassiveModule, () => {
  test("the rank's Movement SPD is a passive bonus on the wielder", () => {
    expect.hasAssertions();

    expect(boundlessBlessingPassiveModule.getPassiveBonuses?.(wielder, 1, [])).toStrictEqual([
      { amount: 0.1, attribute: Attribute.MovementSpeed },
    ]);
  });

  test("on the field a stack is gained every four seconds, each raising every element's DMG Bonus by the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 4.5);

    expect(getStacks(context.kitEffectState.effects)).toBe(1);
    const buffs = context.kitEffectState.effects.filter(
      (effect) => effect.kind === "buff" && effect.source === BOUNDLESS_BLESSING_ID,
    );
    expect(buffs.map(({ attribute }) => attribute)).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES);
    expect(buffs.every(({ amount }) => Math.abs(amount - 0.08) < 1e-9)).toBe(true);
  });

  test("the stacks are at most four", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 21);

    expect(getStacks(context.kitEffectState.effects)).toBe(4);
  });

  test("a swap off the field clears the stacks, and the clock with them", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 8.5);
    expect(getStacks(context.kitEffectState.effects)).toBe(2);

    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 8);

    expect(getStacks(context.kitEffectState.effects)).toBeUndefined();
    expect(context.kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([]);
  });

  test("a fall clears the stacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 4.5);
    boundlessBlessingPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, healthShare: 0, kind: KitEventKind.HealthChanged, overflowHealthShare: 0 },
      context,
      wielder,
    );

    expect(getStacks(context.kitEffectState.effects)).toBeUndefined();
  });

  test("another character's swap onto the field starts no clock", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(swapOnto(OTHER_CHARACTER_ID, TRAVELER_CHARACTER_ID), context, wielder);
    stepKitSeconds(context, 8.5);

    expect(getStacks(context.kitEffectState.effects)).toBeUndefined();
  });

  test("a battle that opens on the wielder starts the clock, its opening swap having no character before it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boundlessBlessingPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: undefined },
      context,
      wielder,
    );
    stepKitSeconds(context, 4.5);

    expect(getStacks(context.kitEffectState.effects)).toBe(1);
  });
});
