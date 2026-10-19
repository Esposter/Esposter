import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { createRebelliousGuardianPassiveModule } from "#src/services/weapon/passives/createRebelliousGuardianPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

describe(createRebelliousGuardianPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseHealth, value: 10_000 }]);
  // Synthetic params, not the weapon's row: a shield of three tenths of Max HP, a cooldown of three seconds and a
  // Fifth DMG Bonus
  const rebelliousGuardianPassiveModule = createRebelliousGuardianPassiveModule([0.3, 3, 0.2]);

  test("an enemy's strike that takes the wielder's HP generates its shield and the DMG Bonus while it lasts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects.filter(({ kind }) => kind !== "status")).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        health: 0.3 * wielder.attributes.maxHealth,
        kind: "shield",
        secondsRemaining: 10,
      },
      {
        amount: 0.2,
        attribute: Attribute.AllDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "rebelliousGuardian",
      },
    ]);
  });

  test("a heal, or a loss another character caused, generates no shield", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: 0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wielder,
    );
    rebelliousGuardianPassiveModule.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
        sourceCharacterId: OTHER_CHARACTER_ID,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test("a second loss inside the cooldown generates no second shield", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const loss = {
      bondOfLifeShare: 0,
      characterId: TRAVELER_CHARACTER_ID,
      healthShare: -0.1,
      isFallRefused: false,
      kind: KitEventKind.HealthChanged as const,
      overflowHealthShare: 0,
    };
    rebelliousGuardianPassiveModule.onKitEvent?.(loss, context, wielder);
    rebelliousGuardianPassiveModule.onKitEvent?.(loss, context, wielder);

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "shield")).toHaveLength(1);
  });
});
