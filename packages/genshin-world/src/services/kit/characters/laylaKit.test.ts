import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createLaylaKitBehaviour, LAYLA_CHARACTER_ID } from "#src/services/kit/characters/laylaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const LAYLA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LAYLA_CHARACTER_ID);

describe(createLaylaKitBehaviour, () => {
  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(createLaylaCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createLaylaCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: LAYLA_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: LAYLA_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAYLA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      ...LAYLA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      LAYLA_KIT.plungeCollision.talentMultiplier,
      LAYLA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAYLA_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAYLA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.512173, 0.484834, 0.729736, 0.4773, 0.52546, 0.639324, 1.278377, 1.596762, 0.128,
    ]);
  });

  test("the charged attack costs 20 stamina, her burst costs 40 energy and cools for 12 seconds, and her skill cools for 12 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LAYLA_KIT.burstCooldownSeconds,
      burstEnergyCost: LAYLA_KIT.burstEnergyCost,
      chargedAttackStamina: LAYLA_KIT.chargedAttackStamina,
      skillCooldownSeconds: LAYLA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 12,
      burstEnergyCost: 40,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 12,
    });
  });

  test("nights of Formal Focus sets a shield of its flat share and its Max HP share for 12 seconds", () => {
    expect.hasAssertions();
    const shield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );
    expect({ health: shield?.health, secondsRemaining: shield?.secondsRemaining }).toStrictEqual({
      health: 1040.007 + 0.108 * MAX_HEALTH,
      secondsRemaining: 12,
    });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    LAYLA_KIT.elementalSkill.onStart?.(
      createKitTestContext({ ...createLaylaCombatant(), constellationCount: 1 }, { kitEffectState }),
    );
    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    const baseShield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect(shield?.health).toBeCloseTo((baseShield?.health ?? 0) * 1.2);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    LAYLA_KIT.elementalSkill.onStart?.(
      createKitTestContext({ ...createLaylaCombatant(), constellationCount: 0 }, { kitEffectState }),
    );
    const shield = kitEffectState.effects.find((effect): effect is KitShield => effect.kind === "shield");
    const baseShield = castAction(LAYLA_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect(shield?.health).toBe(baseShield?.health);
  });

  test("starlight Slug's field ticks first at 36 frames and every 90 frames after, for 12 seconds", () => {
    expect.hasAssertions();
    const field = castAction(LAYLA_KIT.elementalBurst).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    );
    expect({
      nextTickFrames: Math.round((field?.nextTickSeconds ?? 0) * 60),
      radius: field?.radius,
      tickIntervalFrames: Math.round((field?.tickIntervalSeconds ?? 0) * 60),
    }).toStrictEqual({ nextTickFrames: 36, radius: 12, tickIntervalFrames: 90 });
  });
});
