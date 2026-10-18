import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant();
// Magic Affinity at its first rank, which reads its normal and charged attack DMG bonus per stack from the affix row
const magicAffinityPassiveModule = createMagicAffinityPassiveModule([0.08]);
const createSkillUsed = () => ({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const });
describe(createMagicAffinityPassiveModule, () => {
  test("an elemental skill raises normal and charged attack DMG by the rank's amount at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.08);
    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)?.amount).toBeCloseTo(0.08);
  });

  test("a further skill stacks the bonus to two and a third holds it there", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);
    magicAffinityPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.16);
    expect(getBuff(kitEffectState, Attribute.ChargedAttackDamageBonus)?.amount).toBeCloseTo(0.16);
  });
});
