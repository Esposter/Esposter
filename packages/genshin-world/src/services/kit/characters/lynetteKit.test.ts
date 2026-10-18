import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createLynetteKitBehaviour, LYNETTE_CHARACTER_ID } from "#src/services/kit/characters/lynetteKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const LYNETTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LYNETTE_CHARACTER_ID);

describe(createLynetteKitBehaviour, () => {
  // The effects the burst's start adds to the team's, which its owner holds
  const castBurst = (): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    LYNETTE_KIT.elementalBurst.onStart?.(createKitTestContext(createLynetteCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createLynetteCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: LYNETTE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: LYNETTE_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's, plunges' and skill's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LYNETTE_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...LYNETTE_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      LYNETTE_KIT.plungeCollision.talentMultiplier,
      LYNETTE_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LYNETTE_KIT.highPlunge.hits[0]?.talentMultiplier,
      LYNETTE_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.430817, 0.376121, 0.27864, 0.215929, 0.631541, 0.44204, 0.61404, 0.639324, 1.278377, 1.596762, 2.68,
    ]);
  });

  test("the charged attack costs 20 stamina, her burst costs 70 energy and cools for 18 seconds, and her skill cools for 12 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LYNETTE_KIT.burstCooldownSeconds,
      burstEnergyCost: LYNETTE_KIT.burstEnergyCost,
      chargedAttackStamina: LYNETTE_KIT.chargedAttackStamina,
      skillCooldownSeconds: LYNETTE_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 12,
    });
  });

  test("magic trick: astonishing shift's bogglecat box ticks every 59 frames from 122", () => {
    expect.hasAssertions();
    const field = castBurst().effects.find((effect): effect is KitField => effect.kind === "field");
    expect({ nextTickSeconds: field?.nextTickSeconds, tickIntervalSeconds: field?.tickIntervalSeconds }).toStrictEqual({
      nextTickSeconds: 122 / 60,
      tickIntervalSeconds: 59 / 60,
    });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    expect(LYNETTE_KIT.getSkillChargeBonus?.({ ...createLynetteCombatant(), constellationCount: 4 })).toBe(1);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    expect(LYNETTE_KIT.getSkillChargeBonus?.({ ...createLynetteCombatant(), constellationCount: 3 })).toBe(0);
  });
});
