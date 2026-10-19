import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { createProtectorsVirtuePassiveModule } from "#src/services/weapon/passives/createProtectorsVirtuePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

describe(createProtectorsVirtuePassiveModule, () => {
  // Synthetic params, not the weapon's row: a 30% HP bonus and an ATK share of a tenth of Max HP
  const protectorsVirtuePassiveModule = createProtectorsVirtuePassiveModule([0.3, 0.1]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.Health, value: 10000 }]);

  test("the rank's share raises the wielder's HP, and its ATK bonus is the rank's share of its Max HP", () => {
    expect.hasAssertions();

    expect(protectorsVirtuePassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.3, attribute: Attribute.HealthPercent },
    ]);
    expect(protectorsVirtuePassiveModule.getConversionBonuses?.(wielder, 1)).toStrictEqual([
      { amount: 0.1 * 10000, attribute: Attribute.Attack },
    ]);
  });
});
