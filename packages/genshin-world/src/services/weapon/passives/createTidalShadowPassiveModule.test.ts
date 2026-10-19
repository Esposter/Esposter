import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { createTidalShadowPassiveModule } from "#src/services/weapon/passives/createTidalShadowPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const createHealthChanged = (characterId: number, healthShare: number): KitEvent => ({
  bondOfLifeShare: 0,
  characterId,
  healthShare,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});

describe(createTidalShadowPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: a quarter ATK for three seconds after the wielder is healed
  const tidalShadowPassiveModule = createTidalShadowPassiveModule([0.25, 3, 0, 0]);

  test("a heal of the wielder raises its ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID, 0.5), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.25,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "tidalShadow",
      },
    ]);
  });

  test("a loss of the wielder's HP, or a heal of another character, raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(TRAVELER_CHARACTER_ID, -0.2), context, wielder);
    tidalShadowPassiveModule.onKitEvent?.(createHealthChanged(OTHER_CHARACTER_ID, 0.5), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
