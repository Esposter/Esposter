import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createKeqingKitBehaviour, KEQING_CHARACTER_ID } from "#src/services/kit/characters/keqingKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const KEQING_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KEQING_CHARACTER_ID);
const createKeqingCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KEQING_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KEQING_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

const castStarwardSword = (ascension: number): KitBuff[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  const combatant = { ...createKeqingCombatant(), ascension };
  KEQING_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
};

describe(createKeqingKitBehaviour, () => {
  test("the recast infuses Keqing with Electro as it starts, for the infusion's seconds", () => {
    expect.hasAssertions();
    const recast = KEQING_KIT.elementalSkillChain?.followUps[0];
    if (!recast) throw new Error("Stellar Restoration has no recast");
    const kitEffectState: KitEffectState = { effects: [] };

    recast.onStart?.(createKitTestContext(createKeqingCombatant(), { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: KEQING_CHARACTER_ID, element: Element.Electro, kind: "infusion", secondsRemaining: 6 },
    ]);
  });

  // Ascension 4's Starward Sword buffs
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(
      castStarwardSword(4).map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.15, attribute: Attribute.CriticalRate, secondsRemaining: 8 },
      { amount: 0.15, attribute: Attribute.EnergyRecharge, secondsRemaining: 8 },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castStarwardSword(3)).toStrictEqual([]);
  });
});
