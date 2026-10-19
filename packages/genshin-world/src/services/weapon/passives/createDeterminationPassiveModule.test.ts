import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createDeterminationPassiveModule } from "#src/services/weapon/passives/createDeterminationPassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

describe(createDeterminationPassiveModule, () => {
  const OTHER_CHARACTER_ID = 10_000_066;
  const wielder: Combatant = createWielderCombatant();
  // Determination with synthetic params: its percentage and its seconds
  const determinationPassiveModule = createDeterminationPassiveModule([0.2, 3]);

  test("a burst the wielder uses raises its ATK and Movement SPD by the rank's percentage for its seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    determinationPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 0, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.2);
    expect(getBuff(kitEffectState, Attribute.MovementSpeed)?.amount).toBeCloseTo(0.2);
  });

  test("a burst another character uses raises nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    determinationPassiveModule.onKitEvent?.(
      { characterId: OTHER_CHARACTER_ID, energyCost: 0, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)).toBeUndefined();
  });
});
