import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const createSkillUsed = () => ({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const });
describe(createMagicAffinityPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // The per-stack normal and charged attack DMG bonus, a synthetic value rather than the weapon's row
  const magicAffinityPassiveModule = createMagicAffinityPassiveModule([0.1]);

  test("an elemental skill raises normal and charged attack DMG by the rank's amount at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.1);
    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)?.amount).toBeCloseTo(0.1);
  });

  test("a further skill stacks the bonus to two and a third holds it there", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.2);
    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)?.amount).toBeCloseTo(0.2);
  });
});
