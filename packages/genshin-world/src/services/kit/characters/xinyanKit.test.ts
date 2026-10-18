import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createXinyanKitBehaviour, XINYAN_CHARACTER_ID } from "#src/services/kit/characters/xinyanKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XINYAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XINYAN_CHARACTER_ID);
const createXinyanCombatant = (ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 800 }]),
  characterId: XINYAN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: XINYAN_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

// A member beside Xinyan on the team
const ALLY_CHARACTER_ID = 10_000_050;
// The Physical DMG Bonus buffs on the team once Xinyan at the ascension sets her shield, as [member, amount], and after
// The shield breaks when it is told to
const readPhysicalDamageBuffs = (ascension: number, isShieldBroken = false): [number, number][] => {
  const combatant = createXinyanCombatant(ascension);
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, {
    kitEffectState,
    party: createParty([XINYAN_CHARACTER_ID, ALLY_CHARACTER_ID]),
  });
  XINYAN_KIT.elementalSkill.onStart?.(context);
  if (isShieldBroken) {
    const shield = takeOne(kitEffectState.effects.filter((effect): effect is KitShield => effect.kind === "shield"));
    shield.secondsRemaining = 0;
    XINYAN_KIT.onKitEvent?.({ effect: shield, kind: KitEventKind.EffectExpired }, context, combatant);
  }
  return kitEffectState.effects
    .filter((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.PhysicalDamageBonus)
    .map(({ amount, characterId }) => [characterId, amount]);
};

describe(createXinyanKitBehaviour, () => {
  const skillHit = takeOne(XINYAN_KIT.elementalSkill.hits);
  // Casts Sweeping Fervor, then strikes the given number of enemies with its hit, as the hit's strikes are read
  const castSkill = (combatant: Combatant, strikeCount: number): KitEffectState => {
    const context = createKitTestContext(combatant);
    XINYAN_KIT.elementalSkill.onStart?.(context);
    for (let strike = 0; strike < strikeCount; strike++)
      skillHit.onStrike?.(context, { body: context.body, combatant, hit: skillHit });
    return context.kitEffectState;
  };

  // Riff Revolution's DoT is the summon its burst casts, read from the effects the cast adds
  const castBurstSummon = (combatant: Combatant): KitSummon | undefined => {
    const kitEffectState: KitEffectState = { effects: [] };
    XINYAN_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState.effects.find((effect: KitEffect): effect is KitSummon => effect.kind === "summon");
  };

  const shieldLevelAfter = (ascension: number, strikeCount: number): number | undefined =>
    castSkill(createXinyanCombatant(ascension), strikeCount).effects.find(
      (effect): effect is KitStatus => effect.kind === "status" && effect.id === "xinyan-shield-level",
    )?.stacks;

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const burstDotSummon = castBurstSummon(createXinyanCombatant());
    const multipliers = [
      ...XINYAN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...XINYAN_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      XINYAN_KIT.plungeCollision.talentMultiplier,
      takeOne(XINYAN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(XINYAN_KIT.highPlunge.hits).talentMultiplier,
      skillHit.talentMultiplier,
      takeOne(XINYAN_KIT.elementalBurst.hits).talentMultiplier,
      takeOne(burstDotSummon?.hits ?? []).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.7654, 0.7396, 0.9546, 1.15842, 0.625455, 1.1309, 0.745878, 1.49144, 1.862889, 1.696, 3.408, 0.4,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("sweeping Fervor's shield steps up at the second and third enemy it strikes, one fewer from Ascension 1", () => {
    expect.hasAssertions();

    expect([shieldLevelAfter(0, 1), shieldLevelAfter(0, 2), shieldLevelAfter(0, 3)]).toStrictEqual([1, 2, 3]);
    expect([shieldLevelAfter(1, 1), shieldLevelAfter(1, 2)]).toStrictEqual([2, 3]);
  });

  test("rave's shield is its flat HP plus its share of DEF at level 3", () => {
    expect.hasAssertions();
    const combatant = createXinyanCombatant();
    // A recast shield ends the one it replaces without removing it yet, so the newest one is the standing shield
    const shield = castSkill(combatant, 3).effects.findLast((effect): effect is KitShield => effect.kind === "shield");

    expect(shield?.health).toBeCloseTo(692.8066 + 1.44 * combatant.attributes.defense);
  });
});

describe("\"...Now That's Rock 'N' Roll!\"", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readPhysicalDamageBuffs(4)).toStrictEqual([
      [XINYAN_CHARACTER_ID, 0.15],
      [ALLY_CHARACTER_ID, 0.15],
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readPhysicalDamageBuffs(3)).toStrictEqual([]);
  });

  test("the Physical DMG Bonus ends as her shield breaks", () => {
    expect.hasAssertions();

    expect(readPhysicalDamageBuffs(4, true)).toStrictEqual([]);
  });
});
