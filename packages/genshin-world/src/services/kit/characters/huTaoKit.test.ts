import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { HU_TAO_CHARACTER_ID } from "#src/services/character/constants";
import { createHuTaoKit } from "#src/services/kit/characters/huTaoKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const HU_TAO_KIT = createHuTaoKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [HU_TAO_CHARACTER_ID]));

const createHuTaoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: HU_TAO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: HU_TAO_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

describe(createHuTaoKit, () => {
  test("guide to Afterlife holds the Paramita stance, its Pyro infusion and an ATK share of her Max HP", () => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();
    const kitEffectState: KitEffectState = { effects: [] };

    HU_TAO_KIT.elementalSkill.onStart?.({
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant,
      kitEffectState,
    });

    const buff = kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff");
    if (!buff) throw new Error("Guide to Afterlife gave no ATK buff");
    const stance = kitEffectState.effects.find((effect) => effect.kind === "stance");
    const infusion = kitEffectState.effects.find((effect) => effect.kind === "infusion");
    expect(stance?.secondsRemaining).toBe(infusion?.secondsRemaining);
    expect(infusion?.element).toBe(Element.Pyro);
    expect(buff.attribute).toBe(Attribute.Attack);
    expect(buff.amount / combatant.attributes.maxHealth).toBeCloseTo(0.03841);
  });
});
