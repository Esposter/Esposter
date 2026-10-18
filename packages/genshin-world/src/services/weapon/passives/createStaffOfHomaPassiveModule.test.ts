import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createStaffOfHomaPassiveModule } from "#src/services/weapon/passives/createStaffOfHomaPassiveModule";
import { describe, expect, test } from "vitest";

describe(createStaffOfHomaPassiveModule, () => {
  // Synthetic params, not the weapon's row: 30% HP, a quarter ATK of Max HP, and half more of Max HP
  // While HP is under half
  const staffOfHomaPassiveModule = createStaffOfHomaPassiveModule([0.3, 0.25, 0.5]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.Health, value: 10000 }]);

  test("the wielder's HP is raised by the rank's percentage and its ATK by the rank's share of Max HP at full HP", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.3, attribute: Attribute.HealthPercent },
    ]);
    expect(staffOfHomaPassiveModule.getConversionBonuses?.(wielder, 1)).toStrictEqual([
      { amount: 0.25 * 10000, attribute: Attribute.Attack },
    ]);
  });

  test("the ATK bonus gains the rank's extra share of Max HP while HP is under half", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 0.4, [], [])).toStrictEqual([
      { amount: 0.3, attribute: Attribute.HealthPercent },
    ]);
    expect(staffOfHomaPassiveModule.getConversionBonuses?.(wielder, 0.4)).toStrictEqual([
      { amount: (0.25 + 0.5) * 10000, attribute: Attribute.Attack },
    ]);
  });

  test("the extra share is not gained at exactly half HP", () => {
    expect.hasAssertions();

    expect(staffOfHomaPassiveModule.getPassiveBonuses?.(wielder, 0.5, [], [])).toStrictEqual([
      { amount: 0.3, attribute: Attribute.HealthPercent },
    ]);
    expect(staffOfHomaPassiveModule.getConversionBonuses?.(wielder, 0.5)).toStrictEqual([
      { amount: 0.25 * 10000, attribute: Attribute.Attack },
    ]);
  });
});
