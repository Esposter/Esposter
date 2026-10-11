import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createWandererKitBehaviour, WANDERER_CHARACTER_ID } from "#src/services/kit/characters/wandererKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const WANDERER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, WANDERER_CHARACTER_ID);

describe(createWandererKitBehaviour, () => {
  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction): KitEffectState => {
    const context = createKitTestContext(createWandererCombatant());
    action.onStart?.(context);
    return context.kitEffectState;
  };

  const createWandererCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: WANDERER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: WANDERER_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's, plunges' and skill's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...WANDERER_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      WANDERER_KIT.chargedAttack.hits[0]?.talentMultiplier,
      WANDERER_KIT.plungeCollision.talentMultiplier,
      WANDERER_KIT.lowPlunge.hits[0]?.talentMultiplier,
      WANDERER_KIT.highPlunge.hits[0]?.talentMultiplier,
      WANDERER_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.68714, 0.65016, 0.47644, 0.47644, 1.3208, 0.568288, 1.136335, 1.419344, 0.952,
    ]);
  });

  test("the charged attack costs 50 stamina, his burst costs 60 energy and cools for 15 seconds, and his skill cools for 6 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: WANDERER_KIT.burstCooldownSeconds,
      burstEnergyCost: WANDERER_KIT.burstEnergyCost,
      chargedAttackStamina: WANDERER_KIT.chargedAttackStamina,
      skillCooldownSeconds: WANDERER_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 6,
    });
  });

  test("hanega: Song of the Wind sets Windfavored for ten seconds, whose strikes take the skill's bonus", () => {
    expect.hasAssertions();
    const stance = castAction(WANDERER_KIT.elementalSkill).effects.find(
      (effect): effect is KitStance => effect.kind === "stance",
    );
    expect({
      firstStrikeMultiplier: stance?.combatant.kit.normalAttacks[0]?.hits[0]?.talentMultiplier,
      secondsRemaining: stance?.secondsRemaining,
    }).toStrictEqual({ firstStrikeMultiplier: 1.329825 * 0.68714, secondsRemaining: 10 });
  });

  test("kyougen: Five Ceremonial Plays strikes five times from 92 frames, every 6 frames", () => {
    expect.hasAssertions();
    expect(WANDERER_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual(
      [92, 98, 104, 110, 116],
    );
  });
});
