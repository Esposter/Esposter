import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createYaeMikoKitBehaviour, YAE_MIKO_CHARACTER_ID } from "#src/services/kit/characters/yaeMikoKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YAE_MIKO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YAE_MIKO_CHARACTER_ID);
const getTotemLevels = (effects: KitEffect[]): number[] =>
  effects
    .filter((effect): effect is KitSummon => effect.kind === "summon" && effect.id === "yae-sesshou-sakura")
    .map((totem) => takeOne(totem.hits).talentMultiplier);

const createYaeMikoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YAE_MIKO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YAE_MIKO_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

describe(createYaeMikoKitBehaviour, () => {
  const combatant = createYaeMikoCombatant();
  // Casts the skill, or the burst, into the effects the team holds, as the kit's start adds them
  const castSkill = (effects: KitEffect[]): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects };
    YAE_MIKO_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState.effects;
  };
  const castBurst = (effects: KitEffect[]): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects };
    YAE_MIKO_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState.effects;
  };

  test("reads the attack, skill and burst multipliers from the proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(YAE_MIKO_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(YAE_MIKO_KIT.chargedAttack.hits).talentMultiplier,
      YAE_MIKO_KIT.chargedAttackStamina,
      YAE_MIKO_KIT.skillCooldownSeconds,
      YAE_MIKO_KIT.burstCooldownSeconds,
      YAE_MIKO_KIT.burstEnergyCost,
    ]).toStrictEqual([0.396584, 1.428948, 50, 4, 22, 90]);
  });

  test("raises a totem's level with each one standing and pops the oldest past three", () => {
    expect.hasAssertions();
    let effects: KitEffect[] = [];
    for (let cast = 0; cast < 4; cast++) effects = castSkill(effects);
    const live = effects.filter((effect) => effect.kind === "summon" && effect.secondsRemaining > 0);
    expect(live).toHaveLength(3);
    expect(getTotemLevels(live)).toStrictEqual([0.7584, 0.948, 0.948]);
  });

  test("destroys every standing totem for one Tenko Thunderbolt each", () => {
    expect.hasAssertions();
    const effects = castBurst(castSkill(castSkill([])));
    const thunderbolts = effects.find(
      (effect): effect is KitSummon => effect.kind === "summon" && effect.id === undefined,
    );
    expect(thunderbolts?.hits).toHaveLength(2);
    expect(effects.filter((effect) => effect.kind === "summon" && effect.secondsRemaining > 0)).toHaveLength(1);
  });
});
