import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createDebutPassiveModule } from "#src/services/weapon/passives/createDebutPassiveModule";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

describe(createDebutPassiveModule, () => {
  const OTHER_CHARACTER_ID = 1;
  const wielder: Combatant = createWielderCombatant();
  // The Widsith's Debut with synthetic params: the Recitative's ATK, the Aria's Elemental DMG and the Interlude's
  // Elemental Mastery, a theme for three seconds, and a cooldown of four
  const debutPassiveModule = createDebutPassiveModule([0.2, 0.15, 60, 3, 4]);
  const createTakeField = () => ({
    characterId: TRAVELER_CHARACTER_ID,
    kind: KitEventKind.CharacterSwapped as const,
    previousCharacterId: OTHER_CHARACTER_ID,
  });

  test("taking the field with a roll on the first theme gains its ATK for its three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([{ amount: 0.2, attribute: Attribute.AttackPercent, secondsRemaining: 3 }]);
  });

  test("a roll on the second theme gains the Elemental DMG Bonus of every element at the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.5 });
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects
        .filter((effect) => effect.kind === "buff")
        .map(({ amount, attribute }) => ({ amount, attribute })),
    ).toStrictEqual(ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.15, attribute })));
  });

  test("taking the field again inside the rank's cooldown gains no theme", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);
    debutPassiveModule.onKitEvent?.(createTakeField(), context, wielder);

    expect(
      context.kitEffectState.effects.filter((effect) => effect.kind === "buff").map(({ attribute }) => attribute),
    ).toStrictEqual([Attribute.AttackPercent]);
  });
});
