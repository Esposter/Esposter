import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import {
  createZibaiKitBehaviour,
  PHASE_SHIFT_RADIANCE_STATUS_ID,
  ZIBAI_CHARACTER_ID,
} from "#src/services/kit/characters/zibaiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ZIBAI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ZIBAI_CHARACTER_ID);

const MAX_HEALTH = 10_000;

const createZibaiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
  characterId: ZIBAI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ZIBAI_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

describe(createZibaiKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(ZIBAI_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(ZIBAI_KIT.chargedAttack.hits).talentMultiplier,
      ZIBAI_KIT.plungeCollision.talentMultiplier,
      takeOne(ZIBAI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ZIBAI_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.505542, 0.73659, 0.639324, 1.278377, 1.596762]);
  });

  test("costs 60 energy for its burst, cooling for 15 seconds, and 20 stamina for its charged attack, its skill cooling for 18 seconds", () => {
    expect.hasAssertions();
    expect(ZIBAI_KIT.burstEnergyCost).toBe(60);
    expect(ZIBAI_KIT.burstCooldownSeconds).toBe(15);
    expect(ZIBAI_KIT.chargedAttackStamina).toBe(20);
    expect(ZIBAI_KIT.skillCooldownSeconds).toBe(18);
  });

  test("her skill enters Lunar Phase Shift, where her normal attacks and charged attack are Geo, for a stance with its own four normal attacks", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createZibaiCombatant());

    ZIBAI_KIT.elementalSkill.onStart?.(context);
    const stance = findKitStance(context.kitEffectState.effects, ZIBAI_CHARACTER_ID);
    const normalAttackHits = stance?.combatant.kit.normalAttacks.flatMap((action) => action.hits) ?? [];

    expect(stance?.combatant.kit.normalAttacks).toHaveLength(4);
    expect(normalAttackHits.every((hit) => hit.element === Element.Geo)).toBe(true);
    expect(stance?.secondsRemaining).toBeGreaterThan(0);
  });

  test("her Lunar Phase Shift gains 10 Radiance a second, and 5 for a normal attack's hit once every half second, up to 100", () => {
    expect.hasAssertions();
    const combatant = createZibaiCombatant();
    const context = createKitTestContext(combatant);
    const radiance = () =>
      countKitResource(context.kitEffectState.effects, ZIBAI_CHARACTER_ID, PHASE_SHIFT_RADIANCE_STATUS_ID);
    const normalAttackLanded = { action: takeOne(ZIBAI_KIT.normalAttacks), kind: KitEventKind.NormalAttackLanded };

    ZIBAI_KIT.elementalSkill.onStart?.(context);
    ZIBAI_KIT.onStep?.(context, combatant, 2);
    expect(radiance()).toBe(20);
    ZIBAI_KIT.onKitEvent?.(normalAttackLanded, context, combatant);
    expect(radiance()).toBe(25);
    ZIBAI_KIT.onKitEvent?.(normalAttackLanded, context, combatant);
    expect(radiance()).toBe(25);
    ZIBAI_KIT.onStep?.(context, combatant, 10);
    expect(radiance()).toBe(100);
  });

  test("spirit steed's stride spends 70 radiance, and the fourth stride ends lunar phase shift", () => {
    expect.hasAssertions();
    const combatant = createZibaiCombatant();
    const context = createKitTestContext(combatant);
    const isShiftActive = () => findKitStance(context.kitEffectState.effects, ZIBAI_CHARACTER_ID) !== undefined;
    const playStride = () =>
      findKitStance(context.kitEffectState.effects, ZIBAI_CHARACTER_ID)?.combatant.kit.elementalSkill.onStart?.(
        context,
      );

    ZIBAI_KIT.elementalSkill.onStart?.(context);
    ZIBAI_KIT.onStep?.(context, combatant, 8);
    playStride();
    expect(countKitResource(context.kitEffectState.effects, ZIBAI_CHARACTER_ID, PHASE_SHIFT_RADIANCE_STATUS_ID)).toBe(
      10,
    );
    playStride();
    playStride();
    expect(isShiftActive()).toBe(true);
    playStride();
    expect(isShiftActive()).toBe(false);
  });
});
