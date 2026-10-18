import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  createNeferKitBehaviour,
  NEFER_CHARACTER_ID,
  VERDANT_DEW_STATUS_ID,
} from "#src/services/kit/characters/neferKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NEFER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEFER_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const MAX_HEALTH = 10_000;

const createNeferCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: NEFER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: NEFER_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

describe(createNeferKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(NEFER_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(NEFER_KIT.chargedAttack.hits).talentMultiplier,
      NEFER_KIT.plungeCollision.talentMultiplier,
      takeOne(NEFER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NEFER_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.380712, 1.3088, 0.568288, 1.136335, 1.419344]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 50 stamina for its charged attack, its skill cooling for 9 seconds", () => {
    expect.hasAssertions();
    expect(NEFER_KIT.burstEnergyCost).toBe(60);
    expect(NEFER_KIT.burstCooldownSeconds).toBe(15);
    expect(NEFER_KIT.chargedAttackStamina).toBe(50);
    expect(NEFER_KIT.skillCooldownSeconds).toBe(9);
  });

  test("nefer's elemental skill uses her own hits", () => {
    expect.hasAssertions();
    expect(NEFER_KIT.elementalSkill.hits).not.toStrictEqual(TRAVELER_KIT.elementalSkill.hits);
  });

  test("her skill enters Shadow Dance, where her charged attack is Phantasm Performance, a stance with its own seven hits, for a positive time", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNeferCombatant());

    NEFER_KIT.elementalSkill.onStart?.(context);
    const stance = findKitStance(context.kitEffectState.effects, NEFER_CHARACTER_ID);

    expect(stance?.combatant.kit.chargedAttack.hits).toHaveLength(7);
    expect(stance?.combatant.kit.chargedAttack).not.toStrictEqual(NEFER_KIT.chargedAttack);
    expect(stance?.secondsRemaining).toBeGreaterThan(0);
  });

  test("her Shadow Dance starts with two Verdant Dew", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNeferCombatant());

    NEFER_KIT.elementalSkill.onStart?.(context);

    expect(countKitResource(context.kitEffectState.effects, NEFER_CHARACTER_ID, VERDANT_DEW_STATUS_ID)).toBe(2);
  });

  test("each Phantasm Performance spends a Verdant Dew, and the third ends Shadow Dance", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createNeferCombatant());
    const verdantDew = () =>
      countKitResource(context.kitEffectState.effects, NEFER_CHARACTER_ID, VERDANT_DEW_STATUS_ID);
    const isShadowDanceActive = () => findKitStance(context.kitEffectState.effects, NEFER_CHARACTER_ID) !== undefined;
    const playPhantasmPerformance = () =>
      findKitStance(context.kitEffectState.effects, NEFER_CHARACTER_ID)?.combatant.kit.chargedAttack.onStart?.(context);

    NEFER_KIT.elementalSkill.onStart?.(context);
    playPhantasmPerformance();
    expect(verdantDew()).toBe(1);
    playPhantasmPerformance();
    expect(verdantDew()).toBe(0);
    expect(isShadowDanceActive()).toBe(true);
    playPhantasmPerformance();
    expect(isShadowDanceActive()).toBe(false);
  });
});
