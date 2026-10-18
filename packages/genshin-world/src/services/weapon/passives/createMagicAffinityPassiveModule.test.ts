import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createMagicAffinityPassiveModule } from "#src/services/weapon/passives/createMagicAffinityPassiveModule";
import { describe, expect, test } from "vitest";

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
// Magic Affinity at its first rank, which reads its normal and charged attack DMG bonus per stack from the affix row
const magicAffinityPassiveModule = createMagicAffinityPassiveModule([0.08]);
const createSkillUsed = () => ({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const });
const getBuff = (kitEffectState: KitEffectState, attribute: Attribute): KitBuff | undefined =>
  kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute);

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
