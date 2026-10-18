import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createProtectorsVirtuePassiveModule } from "#src/services/weapon/passives/createProtectorsVirtuePassiveModule";
import { describe, expect, test } from "vitest";

describe(createProtectorsVirtuePassiveModule, () => {
  // Protector's Virtue at its first rank: twenty per cent HP, and an ATK bonus of 1.2% of Max HP
  const protectorsVirtuePassiveModule = createProtectorsVirtuePassiveModule([0.2, 0.012]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.Health, value: 10000 }]);

  test("the rank's share raises the wielder's HP, and its ATK bonus is the rank's share of its Max HP", () => {
    expect.hasAssertions();

    expect(protectorsVirtuePassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.HealthPercent },
    ]);
    expect(protectorsVirtuePassiveModule.getConversionBonuses?.(wielder, 1)).toStrictEqual([
      { amount: 0.012 * 10000, attribute: Attribute.Attack },
    ]);
  });
});
