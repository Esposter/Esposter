import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYaeMikoKitBehaviour, YAE_MIKO_CHARACTER_ID } from "#src/services/kit/characters/yaeMikoKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YAE_MIKO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YAE_MIKO_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
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

// Yae Miko at the ascension with the Elemental Mastery given
const createAscendedYaeMikoCombatant = (ascension: number, elementalMastery = 0): Combatant => ({
  ...createYaeMikoCombatant(),
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
});
// The seconds left on Sesshou Sakura's cooldown once the burst destroys two totems, as Yae Miko at the ascension stood
// With three charges of it to come back
const castBurstSkillCooldown = (ascension: number): number => {
  const combatant = createAscendedYaeMikoCombatant(ascension);
  const party = createParty([YAE_MIKO_CHARACTER_ID]);
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState, party });
  YAE_MIKO_KIT.elementalSkill.onStart?.(context);
  YAE_MIKO_KIT.elementalSkill.onStart?.(context);
  getPartyMember(party, YAE_MIKO_CHARACTER_ID).skillCooldownSeconds = 3 * YAE_MIKO_KIT.skillCooldownSeconds;
  YAE_MIKO_KIT.elementalBurst.onStart?.(context);
  return getPartyMember(party, YAE_MIKO_CHARACTER_ID).skillCooldownSeconds;
};
// The DMG Bonus a strike of a totem cast by Yae Miko at the ascension with 100 Elemental Mastery takes
const getTotemStrikeDamageBonus = (ascension: number): number | undefined => {
  const combatant = createAscendedYaeMikoCombatant(ascension, 100);
  const kitEffectState: KitEffectState = { effects: [] };
  YAE_MIKO_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  const totem = takeOne(kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"));
  return YAE_MIKO_KIT.getStrikeDamageBonus?.(
    { attackTag: totem.attackTag, body: totem.body, combatant, hit: takeOne(totem.hits) },
    createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    createParty([YAE_MIKO_CHARACTER_ID]),
  );
};

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

describe("the Shrine's Sacred Shade", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstSkillCooldown(1)).toBe(YAE_MIKO_KIT.skillCooldownSeconds);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castBurstSkillCooldown(0)).toBe(3 * YAE_MIKO_KIT.skillCooldownSeconds);
  });
});

describe("enlightened Blessing", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getTotemStrikeDamageBonus(4)).toBeCloseTo(0.15);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getTotemStrikeDamageBonus(3)).toBe(0);
  });
});
